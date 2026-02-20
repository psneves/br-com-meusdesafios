import {
  getDataSource,
  FollowEdge,
  PointsLedger,
  User,
  UserTrackable,
  TrackableTemplate,
} from "@meusdesafios/db";
import type { TrackableCategory } from "@meusdesafios/shared";
import type {
  Period,
  Scope,
  Radius,
  RankData,
  ChallengeRank,
  LeaderboardData,
} from "../types/leaderboard";

const MIN_COHORT = 5;

const CATEGORY_NAMES: Record<TrackableCategory, string> = {
  WATER: "Água",
  DIET_CONTROL: "Dieta",
  PHYSICAL_EXERCISE: "Exercício",
  SLEEP: "Sono",
};

// ── Helpers ───────────────────────────────────────────────

function buildSocialCohortQuery(userId: string, scope: "following" | "followers"): { sql: string; params: string[] } {
  if (scope === "following") {
    return {
      sql: `SELECT e.target_id AS uid FROM follow_edges e WHERE e.requester_id = $1 AND e.status = 'accepted'`,
      params: [userId],
    };
  }
  return {
    sql: `SELECT e.requester_id AS uid FROM follow_edges e WHERE e.target_id = $1 AND e.status = 'accepted'`,
    params: [userId],
  };
}

async function buildNearbyCohort(
  ds: Awaited<ReturnType<typeof getDataSource>>,
  userId: string,
  radiusKm: Radius
): Promise<{ cohortIds: string[]; userHasLocation: boolean }> {
  const userRepo = ds.getRepository(User);
  const user = await userRepo.findOneBy({ id: userId });

  if (!user?.latitude || !user?.longitude) {
    return { cohortIds: [userId], userHasLocation: false };
  }

  const nearbyRows: { uid: string }[] = await userRepo.query(
    `SELECT u.id AS uid
     FROM users u
     WHERE u.latitude IS NOT NULL
       AND u.longitude IS NOT NULL
       AND u.id != $1
       AND u.is_active = true
       AND (6371 * acos(
         LEAST(1.0, GREATEST(-1.0,
           cos(radians($2)) * cos(radians(u.latitude))
           * cos(radians(u.longitude) - radians($3))
           + sin(radians($2)) * sin(radians(u.latitude))
         ))
       )) <= $4`,
    [userId, user.latitude, user.longitude, radiusKm]
  );

  return {
    cohortIds: [userId, ...nearbyRows.map((r) => r.uid)],
    userHasLocation: true,
  };
}

/** Format date as YYYY-MM-DD using local timezone (not UTC). */
function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getDateRange(period: Period): { start: string; end: string } {
  const now = new Date();

  if (period === "week") {
    const day = now.getDay(); // 0=Sun
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

  // month
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: localDateStr(start),
    end: localDateStr(end),
  };
}

// ── computeLeaderboard ────────────────────────────────────

export async function computeLeaderboard(
  userId: string,
  scope: Scope,
  period: Period,
  radius?: Radius
): Promise<LeaderboardData> {
  const ds = await getDataSource();

  // 1. Build cohort based on scope
  let cohortIds: string[];

  if (scope === "nearby") {
    const nearbyResult = await buildNearbyCohort(ds, userId, radius ?? 50);

    if (!nearbyResult.userHasLocation) {
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
      };
    }

    cohortIds = nearbyResult.cohortIds;
  } else {
    const edgeRepo = ds.getRepository(FollowEdge);
    const cohortQuery = buildSocialCohortQuery(userId, scope);
    const cohortRows: { uid: string }[] = await edgeRepo.query(
      cohortQuery.sql,
      cohortQuery.params
    );
    cohortIds = [userId, ...cohortRows.map((r) => r.uid)];
  }

  const cohortSize = cohortIds.length;

  // 2. Date range
  const { start, end } = getDateRange(period);

  const ledgerRepo = ds.getRepository(PointsLedger);

  // 3. If insufficient cohort, still calculate user's actual score but hide rank
  if (cohortSize < MIN_COHORT) {
    // Get user's overall score
    const scoreResult: { total: string }[] = await ledgerRepo
      .createQueryBuilder("pl")
      .select("COALESCE(SUM(pl.points), 0)", "total")
      .where("pl.user_id = :userId", { userId })
      .andWhere("pl.day >= :start", { start })
      .andWhere("pl.day <= :end", { end })
      .getRawMany();
    const userScore = Number(scoreResult[0]?.total ?? 0);

    // Get per-challenge scores
    const catScores: { category: TrackableCategory; total: string }[] = await ledgerRepo
      .createQueryBuilder("pl")
      .innerJoin(UserTrackable, "ut", "ut.id = pl.user_trackable_id")
      .innerJoin(TrackableTemplate, "tt", "tt.id = ut.template_id")
      .select("tt.category", "category")
      .addSelect("COALESCE(SUM(pl.points), 0)", "total")
      .where("pl.user_id = :userId", { userId })
      .andWhere("pl.day >= :start", { start })
      .andWhere("pl.day <= :end", { end })
      .groupBy("tt.category")
      .getRawMany();

    const catMap = new Map(catScores.map((r) => [r.category, Number(r.total)]));
    const categories: TrackableCategory[] = ["WATER", "DIET_CONTROL", "PHYSICAL_EXERCISE", "SLEEP"];
    const challengeRanks: ChallengeRank[] = categories.map((cat) => ({
      category: cat,
      name: CATEGORY_NAMES[cat],
      rank: null,
      score: catMap.get(cat) ?? 0,
      cohortSize,
      percentile: null,
    }));

    return {
      overall: {
        scope,
        rank: null,
        score: userScore,
        cohortSize,
        percentile: null,
        rankStatus: "insufficient_cohort",
      },
      challengeRanks,
    };
  }

  // 4. Overall rank: sum points per user in cohort for the period
  const overallScores: { user_id: string; total: string }[] = await ledgerRepo
    .createQueryBuilder("pl")
    .select("pl.user_id", "user_id")
    .addSelect("COALESCE(SUM(pl.points), 0)", "total")
    .where("pl.user_id IN (:...cohortIds)", { cohortIds })
    .andWhere("pl.day >= :start", { start })
    .andWhere("pl.day <= :end", { end })
    .groupBy("pl.user_id")
    .getRawMany();

  // Fill in users with zero points
  const scoreMap = new Map(
    overallScores.map((r) => [r.user_id, Number(r.total)])
  );
  for (const id of cohortIds) {
    if (!scoreMap.has(id)) scoreMap.set(id, 0);
  }

  // Sort descending
  const sorted = [...scoreMap.entries()].sort((a, b) => b[1] - a[1]);

  // Standard competition ranking
  const userScore = scoreMap.get(userId) ?? 0;
  const userRank = 1 + sorted.filter(([, s]) => s > userScore).length;
  const percentile = 1 - (userRank - 1) / cohortSize;

  const overall: RankData = {
    scope,
    rank: userRank,
    score: userScore,
    cohortSize,
    percentile: Math.round(percentile * 100) / 100,
    rankStatus: "available",
  };

  // 5. Per-challenge ranks
  const challengeScores: {
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
    .andWhere("pl.day >= :start", { start })
    .andWhere("pl.day <= :end", { end })
    .groupBy("pl.user_id")
    .addGroupBy("tt.category")
    .getRawMany();

  const categories: TrackableCategory[] = [
    "WATER",
    "DIET_CONTROL",
    "PHYSICAL_EXERCISE",
    "SLEEP",
  ];

  const challengeRanks: ChallengeRank[] = categories.map((cat) => {
    const catScores = challengeScores.filter((r) => r.category === cat);
    const catMap = new Map(
      catScores.map((r) => [r.user_id, Number(r.total)])
    );
    for (const id of cohortIds) {
      if (!catMap.has(id)) catMap.set(id, 0);
    }

    const catSorted = [...catMap.entries()].sort((a, b) => b[1] - a[1]);
    const catUserScore = catMap.get(userId) ?? 0;
    const catUserRank = 1 + catSorted.filter(([, s]) => s > catUserScore).length;
    const catPercentile = 1 - (catUserRank - 1) / cohortSize;

    return {
      category: cat,
      name: CATEGORY_NAMES[cat],
      rank: catUserRank,
      score: catUserScore,
      cohortSize,
      percentile: Math.round(catPercentile * 100) / 100,
    };
  });

  return { overall, challengeRanks };
}

