import {
  getDataSource,
  FollowEdge,
  PointsLedger,
  User,
  UserTrackable,
  TrackableTemplate,
} from "@meusdesafios/db";
import type { TrackableCategory } from "@meusdesafios/shared";
import { getCellsWithinRadius, normalizeCellId } from "@/lib/location/geohash";
import type {
  Period,
  Scope,
  Radius,
  RankData,
  ChallengeRank,
  LeaderboardData,
  LeaderboardView,
  ParticipantRow,
  ParticipantsPage,
  ParticipantsStandard,
} from "../types/leaderboard";

const CATEGORY_NAMES: Record<TrackableCategory, string> = {
  WATER: "Água",
  DIET_CONTROL: "Dieta",
  PHYSICAL_EXERCISE: "Exercício",
  SLEEP: "Sono",
};

const CATEGORIES: TrackableCategory[] = [
  "WATER",
  "DIET_CONTROL",
  "PHYSICAL_EXERCISE",
  "SLEEP",
];

const STANDARD_TOP_SIZE = 20;
const STANDARD_AROUND_WINDOW = 3;

interface CohortResult {
  cohortIds: string[];
  userHasLocation: boolean;
}

interface DateRange {
  start: string;
  end: string;
}

interface RankedEntry {
  userId: string;
  score: number;
  rank: number;
}

interface ViewOptions {
  view: LeaderboardView;
  page: number;
  pageSize: number;
}

function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getDateRange(period: Period): DateRange {
  const now = new Date();

  if (period === "week") {
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(monday.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    return {
      start: localDateStr(monday),
      end: localDateStr(sunday),
    };
  }

  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: localDateStr(start),
    end: localDateStr(end),
  };
}

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids)];
}

function scoreSort(a: { userId: string; score: number }, b: { userId: string; score: number }): number {
  if (b.score !== a.score) return b.score - a.score;
  return a.userId.localeCompare(b.userId);
}

function rankEntries(scoreMap: Map<string, number>): RankedEntry[] {
  const sorted = [...scoreMap.entries()]
    .map(([userId, score]) => ({ userId, score }))
    .sort(scoreSort);

  const ranked: RankedEntry[] = [];
  let currentRank = 0;
  let previousScore: number | null = null;

  sorted.forEach((entry, idx) => {
    if (previousScore == null || entry.score < previousScore) {
      currentRank = idx + 1;
      previousScore = entry.score;
    }

    ranked.push({
      userId: entry.userId,
      score: entry.score,
      rank: currentRank,
    });
  });

  return ranked;
}

async function getBlockedUserIds(
  ds: Awaited<ReturnType<typeof getDataSource>>,
  userId: string
): Promise<Set<string>> {
  const edgeRepo = ds.getRepository(FollowEdge);
  const rows: { uid: string }[] = await edgeRepo.query(
    `SELECT CASE WHEN requester_id = $1 THEN target_id ELSE requester_id END AS uid
     FROM follow_edges
     WHERE status = 'blocked'
       AND (requester_id = $1 OR target_id = $1)`,
    [userId]
  );

  return new Set(rows.map((r) => r.uid));
}

async function buildFriendsCohort(
  ds: Awaited<ReturnType<typeof getDataSource>>,
  userId: string
): Promise<string[]> {
  const edgeRepo = ds.getRepository(FollowEdge);
  const userRepo = ds.getRepository(User);

  const rows: { uid: string }[] = await edgeRepo.query(
    `SELECT e.target_id AS uid FROM follow_edges e
      WHERE e.requester_id = $1 AND e.status = 'accepted'
     UNION
     SELECT e.requester_id AS uid FROM follow_edges e
      WHERE e.target_id = $1 AND e.status = 'accepted'`,
    [userId]
  );

  const blocked = await getBlockedUserIds(ds, userId);
  const friendIds = rows
    .map((r) => r.uid)
    .filter((id) => id !== userId && !blocked.has(id));

  if (friendIds.length === 0) {
    return [userId];
  }

  const activeRows: { uid: string }[] = await userRepo.query(
    `SELECT id AS uid
     FROM users
     WHERE id = ANY($1::uuid[])
       AND is_active = true`,
    [friendIds]
  );

  return uniqueIds([userId, ...activeRows.map((r) => r.uid)]);
}

async function buildNearbyCohort(
  ds: Awaited<ReturnType<typeof getDataSource>>,
  userId: string,
  radiusKm: Radius
): Promise<CohortResult> {
  const userRepo = ds.getRepository(User);
  const user = await userRepo.findOneBy({ id: userId });

  const normalizedCellId = normalizeCellId(user?.locationCell ?? "");
  if (!normalizedCellId) {
    return { cohortIds: [userId], userHasLocation: false };
  }

  const nearbyCells = getCellsWithinRadius(normalizedCellId, radiusKm);
  const blocked = await getBlockedUserIds(ds, userId);

  const rows: { uid: string }[] = await userRepo.query(
    `SELECT id AS uid
     FROM users
     WHERE id != $1
       AND is_active = true
       AND location_cell = ANY($2::text[])`,
    [userId, nearbyCells]
  );

  const nearbyIds = rows
    .map((r) => r.uid)
    .filter((id) => !blocked.has(id));

  return {
    cohortIds: uniqueIds([userId, ...nearbyIds]),
    userHasLocation: true,
  };
}

async function buildSelectedScoreMap(
  ds: Awaited<ReturnType<typeof getDataSource>>,
  cohortIds: string[],
  period: DateRange
): Promise<Map<string, number>> {
  const ledgerRepo = ds.getRepository(PointsLedger);
  const rows: { user_id: string; total: string }[] = await ledgerRepo
    .createQueryBuilder("pl")
    .select("pl.user_id", "user_id")
    .addSelect("COALESCE(SUM(pl.points), 0)", "total")
    .where("pl.user_id IN (:...cohortIds)", { cohortIds })
    .andWhere("pl.day >= :start", { start: period.start })
    .andWhere("pl.day <= :end", { end: period.end })
    .groupBy("pl.user_id")
    .getRawMany();

  const scoreMap = new Map(rows.map((r) => [r.user_id, Number(r.total)]));
  for (const userId of cohortIds) {
    if (!scoreMap.has(userId)) {
      scoreMap.set(userId, 0);
    }
  }

  return scoreMap;
}

async function buildChallengeRanks(
  ds: Awaited<ReturnType<typeof getDataSource>>,
  cohortIds: string[],
  userId: string,
  cohortSize: number,
  period: DateRange
): Promise<ChallengeRank[]> {
  const ledgerRepo = ds.getRepository(PointsLedger);

  const rows: {
    user_id: string;
    category: TrackableCategory;
    total: string;
  }[] = await ledgerRepo
    .createQueryBuilder("pl")
    .innerJoin(UserTrackable, "ut", "ut.id = pl.user_trackable_id")
    .innerJoin(TrackableTemplate, "tt", "tt.id = ut.template_id")
    .select("pl.user_id", "user_id")
    .addSelect("tt.category", "category")
    .addSelect("COALESCE(SUM(pl.points), 0)", "total")
    .where("pl.user_id IN (:...cohortIds)", { cohortIds })
    .andWhere("pl.day >= :start", { start: period.start })
    .andWhere("pl.day <= :end", { end: period.end })
    .groupBy("pl.user_id")
    .addGroupBy("tt.category")
    .getRawMany();

  return CATEGORIES.map((category) => {
    const scoreMap = new Map<string, number>();

    for (const row of rows) {
      if (row.category === category) {
        scoreMap.set(row.user_id, Number(row.total));
      }
    }

    for (const id of cohortIds) {
      if (!scoreMap.has(id)) scoreMap.set(id, 0);
    }

    const ranked = rankEntries(scoreMap);
    const mine = ranked.find((entry) => entry.userId === userId);
    const percentile = mine
      ? Math.round((1 - (mine.rank - 1) / cohortSize) * 100) / 100
      : null;

    return {
      category,
      name: CATEGORY_NAMES[category],
      rank: mine?.rank ?? null,
      score: mine?.score ?? 0,
      cohortSize,
      percentile,
    };
  });
}

async function buildParticipantRows(
  ds: Awaited<ReturnType<typeof getDataSource>>,
  cohortIds: string[],
  rankedOverall: RankedEntry[],
  period: DateRange,
  week: DateRange,
  month: DateRange
): Promise<ParticipantRow[]> {
  const userRepo = ds.getRepository(User);
  const utRepo = ds.getRepository(UserTrackable);

  const users = await userRepo
    .createQueryBuilder("u")
    .select(["u.id", "u.handle", "u.displayName", "u.avatarUrl"])
    .where("u.id IN (:...cohortIds)", { cohortIds })
    .getMany();

  const userMap = new Map(users.map((u) => [u.id, u]));

  const goalRows: {
    user_id: string;
    category: TrackableCategory;
    goal: { target?: number; unit?: string };
  }[] = await utRepo
    .createQueryBuilder("ut")
    .innerJoin(TrackableTemplate, "tt", "tt.id = ut.template_id")
    .select("ut.user_id", "user_id")
    .addSelect("tt.category", "category")
    .addSelect("ut.goal", "goal")
    .where("ut.user_id IN (:...cohortIds)", { cohortIds })
    .andWhere("ut.is_active = true")
    .getRawMany();

  const goalsMap = new Map<
    string,
    { activeCount: number; targets: Array<{ category: TrackableCategory; target: number; unit: string }> }
  >();

  for (const row of goalRows) {
    const value = goalsMap.get(row.user_id) ?? { activeCount: 0, targets: [] };
    const parsedGoal =
      typeof row.goal === "string" ? (JSON.parse(row.goal) as { target?: number; unit?: string }) : row.goal;

    const target = Number(parsedGoal?.target ?? 0);
    value.targets.push({
      category: row.category,
      target,
      unit: parsedGoal?.unit ?? "",
    });
    value.activeCount += 1;
    goalsMap.set(row.user_id, value);
  }

  for (const value of goalsMap.values()) {
    value.targets.sort((a, b) => CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category));
  }

  const accomplishedRows: { user_id: string; total: string }[] = await ds.query(
    `SELECT s.user_id,
            COUNT(*)::int AS total
     FROM computed_daily_stats s
     INNER JOIN user_trackables ut ON ut.id = s.user_trackable_id
     WHERE s.user_id = ANY($1::uuid[])
       AND s.met_goal = true
       AND ut.is_active = true
       AND s.day >= $2
       AND s.day <= $3
     GROUP BY s.user_id`,
    [cohortIds, period.start, period.end]
  );

  const accomplishedMap = new Map(accomplishedRows.map((row) => [row.user_id, Number(row.total)]));

  const [dayRows, weekRows, monthRows]: [
    Array<{ user_id: string; total: string }>,
    Array<{ user_id: string; total: string }>,
    Array<{ user_id: string; total: string }>
  ] = await Promise.all([
    ds.query(
      `SELECT user_id, COALESCE(SUM(points), 0)::int AS total
       FROM points_ledger
       WHERE user_id = ANY($1::uuid[])
         AND day = $2
       GROUP BY user_id`,
      [cohortIds, localDateStr(new Date())]
    ),
    ds.query(
      `SELECT user_id, COALESCE(SUM(points), 0)::int AS total
       FROM points_ledger
       WHERE user_id = ANY($1::uuid[])
         AND day >= $2
         AND day <= $3
       GROUP BY user_id`,
      [cohortIds, week.start, week.end]
    ),
    ds.query(
      `SELECT user_id, COALESCE(SUM(points), 0)::int AS total
       FROM points_ledger
       WHERE user_id = ANY($1::uuid[])
         AND day >= $2
         AND day <= $3
       GROUP BY user_id`,
      [cohortIds, month.start, month.end]
    ),
  ]);

  const dayMap = new Map(dayRows.map((row) => [row.user_id, Number(row.total)]));
  const weekMap = new Map(weekRows.map((row) => [row.user_id, Number(row.total)]));
  const monthMap = new Map(monthRows.map((row) => [row.user_id, Number(row.total)]));

  return rankedOverall
    .map((entry) => {
      const user = userMap.get(entry.userId);
      if (!user) return null;

      const goals = goalsMap.get(entry.userId) ?? {
        activeCount: 0,
        targets: [],
      };

      return {
        user: {
          id: user.id,
          handle: user.handle,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
        },
        rank: entry.rank,
        score: entry.score,
        goals,
        accomplishedTotal: accomplishedMap.get(entry.userId) ?? 0,
        pointsSummary: {
          day: dayMap.get(entry.userId) ?? 0,
          week: weekMap.get(entry.userId) ?? 0,
          month: monthMap.get(entry.userId) ?? 0,
        },
      };
    })
    .filter((row): row is ParticipantRow => row !== null);
}

function buildStandardView(rows: ParticipantRow[], currentUserId: string): ParticipantsStandard {
  const top = rows.slice(0, STANDARD_TOP_SIZE);
  const topIds = new Set(top.map((row) => row.user.id));

  const userIdx = rows.findIndex((row) => row.user.id === currentUserId);
  const from = Math.max(0, userIdx - STANDARD_AROUND_WINDOW);
  const to = userIdx < 0 ? 0 : Math.min(rows.length, userIdx + STANDARD_AROUND_WINDOW + 1);
  const aroundSlice = rows.slice(from, to);

  const aroundMe = aroundSlice.filter((row) => !topIds.has(row.user.id));

  return { top, aroundMe };
}

function buildPaginatedView(rows: ParticipantRow[], page: number, pageSize: number): ParticipantsPage {
  const totalItems = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: rows.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    hasNext: safePage < totalPages,
  };
}

export async function computeLeaderboard(
  userId: string,
  scope: Scope,
  period: Period,
  radius: Radius | undefined,
  options: ViewOptions
): Promise<LeaderboardData> {
  const ds = await getDataSource();

  const cohortResult =
    scope === "nearby"
      ? await buildNearbyCohort(ds, userId, radius ?? 50)
      : { cohortIds: await buildFriendsCohort(ds, userId), userHasLocation: true };

  if (scope === "nearby" && !cohortResult.userHasLocation) {
    return {
      overall: {
        scope,
        rank: null,
        score: 0,
        cohortSize: 0,
        percentile: null,
        rankStatus: "no_location",
      },
      challengeRanks: [],
      view: options.view,
      participantsStandard: options.view === "standard" ? { top: [], aroundMe: [] } : undefined,
      participantsPage:
        options.view === "all"
          ? {
              items: [],
              page: 1,
              pageSize: options.pageSize,
              totalItems: 0,
              totalPages: 1,
              hasNext: false,
            }
          : undefined,
    };
  }

  const cohortIds = uniqueIds(cohortResult.cohortIds);
  const cohortSize = cohortIds.length;

  const selectedRange = getDateRange(period);
  const weekRange = getDateRange("week");
  const monthRange = getDateRange("month");

  const selectedScoreMap = await buildSelectedScoreMap(ds, cohortIds, selectedRange);
  const rankedOverall = rankEntries(selectedScoreMap);

  const current = rankedOverall.find((entry) => entry.userId === userId);
  const rank = current?.rank ?? 1;
  const percentile = cohortSize > 0 ? Math.round((1 - (rank - 1) / cohortSize) * 100) / 100 : null;

  const overall: RankData = {
    scope,
    rank,
    score: current?.score ?? 0,
    cohortSize,
    percentile,
    rankStatus: "available",
  };

  const challengeRanks = await buildChallengeRanks(ds, cohortIds, userId, cohortSize, selectedRange);
  const participantRows = await buildParticipantRows(
    ds,
    cohortIds,
    rankedOverall,
    selectedRange,
    weekRange,
    monthRange
  );

  return {
    overall,
    challengeRanks,
    view: options.view,
    participantsStandard:
      options.view === "standard" ? buildStandardView(participantRows, userId) : undefined,
    participantsPage:
      options.view === "all"
        ? buildPaginatedView(participantRows, options.page, options.pageSize)
        : undefined,
  };
}
