import {
  getDataSource,
  TrackableTemplate,
  UserTrackable,
  TrackableLog as TrackableLogEntity,
  ComputedDailyStats,
  Streak as StreakEntity,
  PointsLedger,
} from "@meusdesafios/db";
import {
  computeDayResult,
} from "@meusdesafios/shared";
import type {
  Goal,
  TrackableCategory,
  TrackableLog as SharedTrackableLog,
  Streak as SharedStreak,
  LogMeta,
} from "@meusdesafios/shared";
import type {
  TodayCard,
  TodayResponse,
  QuickAction,
  ProgressBreakdown,
  LogFeedback,
  WeeklySummary,
  WeekDayStatus,
  WeekChallengeSummary,
  MonthlySummary,
  MonthChallengeSummary,
} from "../types/today";

// ── Helpers ──────────────────────────────────────────────────

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

/** Format date as YYYY-MM-DD using local timezone (not UTC). */
function dayString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Map a DB TrackableLog entity to the shared TrackableLog interface */
function toSharedLog(entity: TrackableLogEntity): SharedTrackableLog {
  return {
    id: entity.id,
    userId: entity.userId,
    userTrackableId: entity.userTrackableId,
    occurredAt: entity.occurredAt,
    valueNum: entity.valueNum != null ? Number(entity.valueNum) : undefined,
    valueText: entity.valueText ?? undefined,
    meta: entity.meta ?? undefined,
    createdAt: entity.createdAt,
  };
}

/** Map a DB Streak entity to the shared Streak interface */
function toSharedStreak(entity: StreakEntity): SharedStreak {
  return {
    id: entity.id,
    userId: entity.userId,
    userTrackableId: entity.userTrackableId,
    currentStreak: entity.currentStreak,
    bestStreak: entity.bestStreak,
    lastMetDay: entity.lastMetDay ? new Date(entity.lastMetDay) : undefined,
    updatedAt: entity.updatedAt,
  };
}

// ── Category metadata ────────────────────────────────────────

const CATEGORY_NAMES: Record<TrackableCategory, string> = {
  WATER: "Água",
  DIET_CONTROL: "Dieta",
  PHYSICAL_EXERCISE: "Exercício Físico",
  SLEEP: "Sono",
};

const CATEGORY_QUICK_ACTIONS: Record<TrackableCategory, QuickAction[]> = {
  WATER: [
    { id: "water-250", type: "add", label: "+250 ml", amount: 250, unit: "ml" },
    { id: "water-500", type: "add", label: "+500 ml", amount: 500, unit: "ml" },
    { id: "water-750", type: "add", label: "+750 ml", amount: 750, unit: "ml" },
  ],
  PHYSICAL_EXERCISE: [],
  DIET_CONTROL: [],
  SLEEP: [
    { id: "sleep-6h30", type: "add", label: "6:30", amount: 390, unit: "min" },
    { id: "sleep-7h", type: "add", label: "7:00", amount: 420, unit: "min" },
    { id: "sleep-plus", type: "add", label: "+", amount: 30, unit: "min" },
    { id: "sleep-minus", type: "add", label: "\u2212", amount: -30, unit: "min" },
  ],
};

/** Goal overrides for templates whose defaults don't match the UI */
const GOAL_OVERRIDES: Partial<Record<TrackableCategory, Goal>> = {
  DIET_CONTROL: { type: "target", target: 5, unit: "refeições" },
  SLEEP: { type: "target", target: 420, unit: "min" },
};

// ── 1a. ensureUserTrackables ─────────────────────────────────

export async function ensureUserTrackables(
  userId: string
): Promise<UserTrackable[]> {
  const ds = await getDataSource();
  const utRepo = ds.getRepository(UserTrackable);

  let userTrackables = await utRepo.find({
    where: { userId },
    relations: ["template"],
  });

  if (userTrackables.length > 0) return userTrackables;

  // New user — provision all 4 templates (race-safe with ON CONFLICT)
  const templateRepo = ds.getRepository(TrackableTemplate);
  const templates = await templateRepo.find();
  const today = dayString(new Date());

  for (const template of templates) {
    const goal =
      GOAL_OVERRIDES[template.category] ?? template.defaultGoal;

    const schedule = { type: "daily", timezone: "America/Sao_Paulo" };

    // ON CONFLICT prevents duplicates when concurrent requests race
    await ds.query(
      `INSERT INTO user_trackables (user_id, template_id, goal, schedule, scoring, start_date)
       VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6)
       ON CONFLICT (user_id, template_id) DO NOTHING`,
      [userId, template.id, JSON.stringify(goal), JSON.stringify(schedule), JSON.stringify(template.defaultScoring), today]
    );
  }

  // Fetch the (possibly just-created) records
  userTrackables = await utRepo.find({
    where: { userId },
    relations: ["template"],
  });

  // Ensure streaks exist for each trackable (also race-safe)
  for (const ut of userTrackables) {
    await ds.query(
      `INSERT INTO streaks (user_id, user_trackable_id, current_streak, best_streak)
       VALUES ($1, $2, 0, 0)
       ON CONFLICT (user_id, user_trackable_id) DO NOTHING`,
      [userId, ut.id]
    );
  }

  return userTrackables;
}

// ── 1b. buildTodayResponse ───────────────────────────────────

export async function buildTodayResponse(
  userId: string,
  date: Date
): Promise<TodayResponse> {
  const ds = await getDataSource();
  const userTrackables = await ensureUserTrackables(userId);

  const dayStart = startOfDay(date);
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);
  const dayStr = dayString(dayStart);

  const logRepo = ds.getRepository(TrackableLogEntity);
  const statsRepo = ds.getRepository(ComputedDailyStats);
  const streakRepo = ds.getRepository(StreakEntity);
  const ledgerRepo = ds.getRepository(PointsLedger);

  const activeUTs = userTrackables.filter((ut) => ut.isActive);
  const utIds = activeUTs.map((ut) => ut.id);

  // Batch fetch: 3 queries instead of 3 × N (N+1 fix)
  const [allLogs, allStats, allStreaks] = await Promise.all([
    utIds.length > 0
      ? logRepo
          .createQueryBuilder("log")
          .where("log.user_trackable_id IN (:...utIds)", { utIds })
          .andWhere("log.occurred_at >= :dayStart", { dayStart })
          .andWhere("log.occurred_at <= :dayEnd", { dayEnd })
          .orderBy("log.occurred_at", "ASC")
          .getMany()
      : Promise.resolve([]),
    utIds.length > 0
      ? statsRepo
          .createQueryBuilder("s")
          .where("s.user_trackable_id IN (:...utIds)", { utIds })
          .andWhere("s.day = :day", { day: dayStr })
          .getMany()
      : Promise.resolve([]),
    utIds.length > 0
      ? streakRepo
          .createQueryBuilder("s")
          .where("s.user_id = :userId", { userId })
          .andWhere("s.user_trackable_id IN (:...utIds)", { utIds })
          .getMany()
      : Promise.resolve([]),
  ]);

  // Index by userTrackableId for O(1) lookups
  const logsByUt = new Map<string, TrackableLogEntity[]>();
  for (const log of allLogs) {
    const list = logsByUt.get(log.userTrackableId) ?? [];
    list.push(log);
    logsByUt.set(log.userTrackableId, list);
  }
  const statsMap = new Map(allStats.map((s) => [s.userTrackableId, s]));
  const streakMap = new Map(allStreaks.map((s) => [s.userTrackableId, s]));

  const cards: TodayCard[] = [];

  for (const ut of activeUTs) {
    const logs = logsByUt.get(ut.id) ?? [];
    const stats = statsMap.get(ut.id);
    const streak = streakMap.get(ut.id);

    // Compute progress from logs
    const sharedLogs = logs.map(toSharedLog);
    const goal = ut.goal;
    const target = goal.target ?? 0;
    const total = sharedLogs.reduce((sum, l) => sum + (l.valueNum ?? 0), 0);
    const met = stats?.metGoal ?? (target > 0 ? total >= target : false);
    const percentage = target > 0 ? Math.min(100, Math.round((total / target) * 100)) : 0;

    // Build exercise breakdown
    let breakdown: ProgressBreakdown[] | undefined;
    if (ut.template.category === "PHYSICAL_EXERCISE") {
      const modalityLabels: Record<string, string> = {
        GYM: "Musculação",
        RUN: "Corrida",
        CYCLING: "Ciclismo",
        SWIM: "Natação",
      };
      const grouped: Record<string, number> = {};
      for (const log of logs) {
        const mod = log.meta?.exerciseModality;
        if (mod) {
          grouped[mod] = (grouped[mod] ?? 0) + Number(log.valueNum ?? 0);
        }
      }
      const entries = Object.entries(grouped);
      if (entries.length > 0) {
        breakdown = entries.map(([mod, value]) => ({
          label: modalityLabels[mod] ?? mod,
          value,
          actionId: `exercise-${mod.toLowerCase()}`,
        }));
      }
    }

    const card: TodayCard = {
      userTrackableId: ut.id,
      templateCode: ut.template.code,
      name: CATEGORY_NAMES[ut.template.category],
      icon: ut.template.icon ?? "",
      category: ut.template.category,
      goal: {
        type: goal.type,
        target: goal.target,
        unit: goal.unit,
      },
      progress: {
        value: total,
        unit: goal.unit,
        met,
        percentage,
      },
      streak: {
        current: streak?.currentStreak ?? 0,
        best: streak?.bestStreak ?? 0,
      },
      pointsToday: stats?.pointsEarned ?? 0,
      quickActions: CATEGORY_QUICK_ACTIONS[ut.template.category],
      breakdown,
    };

    cards.push(card);
  }

  // Compute aggregate points
  const totalPoints = cards.reduce((sum, c) => sum + c.pointsToday, 0);

  // Week points: sum of PointsLedger entries for the ISO week
  const dayOfWeek = dayStart.getDay(); // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(dayStart);
  monday.setDate(monday.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  const pointsWeek = await ledgerRepo
    .createQueryBuilder("pl")
    .select("COALESCE(SUM(pl.points), 0)", "total")
    .where("pl.user_id = :userId", { userId })
    .andWhere("pl.day >= :start", { start: dayString(monday) })
    .andWhere("pl.day <= :end", { end: dayString(sunday) })
    .getRawOne()
    .then((r) => Number(r?.total ?? 0));

  // Month points
  const monthStart = new Date(dayStart.getFullYear(), dayStart.getMonth(), 1);
  const monthEnd = new Date(dayStart.getFullYear(), dayStart.getMonth() + 1, 0);

  const pointsMonth = await ledgerRepo
    .createQueryBuilder("pl")
    .select("COALESCE(SUM(pl.points), 0)", "total")
    .where("pl.user_id = :userId", { userId })
    .andWhere("pl.day >= :start", { start: dayString(monthStart) })
    .andWhere("pl.day <= :end", { end: dayString(monthEnd) })
    .getRawOne()
    .then((r) => Number(r?.total ?? 0));

  return {
    date: formatDate(dayStart),
    greeting: getGreeting(),
    totalPoints,
    pointsWeek,
    pointsMonth,
    cards,
  };
}

// ── Perfect day bonus helper ─────────────────────────────────

async function awardPerfectDayBonus(
  manager: { getRepository: Awaited<ReturnType<typeof getDataSource>>["getRepository"] },
  userId: string,
  dayStr: string
): Promise<number> {
  const allUTs = await manager.getRepository(UserTrackable).find({
    where: { userId, isActive: true },
  });
  const allStats = await manager
    .getRepository(ComputedDailyStats)
    .createQueryBuilder("s")
    .where("s.user_id = :userId", { userId })
    .andWhere("s.day = :day", { day: dayStr })
    .getMany();

  const metMap = new Map(allStats.map((s: ComputedDailyStats) => [s.userTrackableId, s.metGoal]));
  const allMet = allUTs.length > 0 && allUTs.every((ut: UserTrackable) => metMap.get(ut.id) === true);
  if (!allMet) return 0;

  const ledgerRepo = manager.getRepository(PointsLedger);
  const existing = await ledgerRepo.findOne({
    where: { userId, day: dayStr as unknown as Date, source: "streak_bonus", reason: "Dia perfeito" },
  });
  if (existing) return 0;

  const entry = ledgerRepo.create({
    userId,
    day: dayStr as unknown as Date,
    source: "streak_bonus",
    points: 10,
    reason: "Dia perfeito",
  });
  await ledgerRepo.save(entry);
  return 10;
}

// ── Weekly bonus helper ──────────────────────────────────────

async function awardWeeklyBonuses(
  manager: { getRepository: Awaited<ReturnType<typeof getDataSource>>["getRepository"]; query: Awaited<ReturnType<typeof getDataSource>>["query"] },
  userId: string,
  logDate: Date
): Promise<number> {
  // Determine the previous week (Mon-Sun)
  const prevSunday = new Date(logDate);
  const dow = logDate.getDay(); // 0=Sun
  if (dow === 0) {
    prevSunday.setDate(prevSunday.getDate() - 7);
  } else {
    prevSunday.setDate(prevSunday.getDate() - dow);
  }
  const prevMonday = new Date(prevSunday);
  prevMonday.setDate(prevSunday.getDate() - 6);

  // Only award if that week is fully in the past
  const today = startOfDay(new Date());
  if (today <= prevSunday) return 0;

  const sundayStr = dayString(prevSunday);
  const mondayStr = dayString(prevMonday);

  // Idempotent: check if already awarded for this week
  const ledgerRepo = manager.getRepository(PointsLedger);
  const existing = await ledgerRepo
    .createQueryBuilder("pl")
    .where("pl.user_id = :userId", { userId })
    .andWhere("pl.day = :day", { day: sundayStr })
    .andWhere("pl.source = :source", { source: "streak_bonus" })
    .andWhere("pl.reason LIKE :reason", { reason: "Meta semanal%" })
    .getOne();
  if (existing) return 0;

  // Get all active user trackables
  const allUTs = await manager.getRepository(UserTrackable).find({
    where: { userId, isActive: true },
  });
  if (allUTs.length === 0) return 0;

  // Get all stats for the previous week
  const utIds = allUTs.map((ut) => ut.id);
  const statsRepo = manager.getRepository(ComputedDailyStats);
  const weekStats = await statsRepo
    .createQueryBuilder("s")
    .where("s.user_trackable_id IN (:...utIds)", { utIds })
    .andWhere("s.day >= :start", { start: mondayStr })
    .andWhere("s.day <= :end", { end: sundayStr })
    .getMany();

  // Count met days per UT
  const metCountByUT = new Map<string, number>();
  for (const s of weekStats) {
    if (s.metGoal) {
      metCountByUT.set(s.userTrackableId, (metCountByUT.get(s.userTrackableId) ?? 0) + 1);
    }
  }

  // Weekly goal: +10 per challenge with 7/7 days met
  const challengesWith7 = allUTs.filter((ut) => (metCountByUT.get(ut.id) ?? 0) === 7);
  let totalBonus = 0;

  if (challengesWith7.length > 0) {
    const weeklyGoalBonus = challengesWith7.length * 10;
    const entry = ledgerRepo.create({
      userId,
      day: sundayStr as unknown as Date,
      source: "streak_bonus" as const,
      points: weeklyGoalBonus,
      reason: `Meta semanal: ${challengesWith7.length} desafio(s) com 7/7 dias`,
    });
    await ledgerRepo.save(entry);
    totalBonus += weeklyGoalBonus;

    // Perfect week: +10 if ALL challenges had 7/7
    if (challengesWith7.length === allUTs.length) {
      const perfectEntry = ledgerRepo.create({
        userId,
        day: sundayStr as unknown as Date,
        source: "streak_bonus" as const,
        points: 10,
        reason: "Semana perfeita",
      });
      await ledgerRepo.save(perfectEntry);
      totalBonus += 10;
    }
  }

  return totalBonus;
}

// ── 1c. createLog ────────────────────────────────────────────

interface CreateLogInput {
  userTrackableId: string;
  valueNum: number;
  date?: string;
  meta?: LogMeta;
}

export async function createLog(
  userId: string,
  input: CreateLogInput
): Promise<LogFeedback> {
  const ds = await getDataSource();

  // Validate ownership (read-only, outside transaction)
  const ut = await ds.getRepository(UserTrackable).findOne({
    where: { id: input.userTrackableId, userId },
    relations: ["template"],
  });
  if (!ut) {
    throw new Error("UserTrackable not found or does not belong to user");
  }

  const targetDate = input.date
    ? new Date(`${input.date}T12:00:00`)
    : new Date();
  const dayStart = startOfDay(targetDate);
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);
  const dayStr = dayString(dayStart);

  // ── Entire scoring pipeline runs in a single transaction ──
  return ds.transaction(async (manager) => {
    const logRepo = manager.getRepository(TrackableLogEntity);
    const streakRepo = manager.getRepository(StreakEntity);
    const ledgerRepo = manager.getRepository(PointsLedger);

    // 1. Insert log
    const log = logRepo.create({
      userId,
      userTrackableId: input.userTrackableId,
      occurredAt: targetDate,
      valueNum: input.valueNum,
      meta: input.meta,
    });
    await logRepo.save(log);

    // 2. Query all logs for today
    const allLogs = await logRepo
      .createQueryBuilder("log")
      .where("log.user_trackable_id = :utId", { utId: input.userTrackableId })
      .andWhere("log.occurred_at >= :dayStart", { dayStart })
      .andWhere("log.occurred_at <= :dayEnd", { dayEnd })
      .getMany();
    const sharedLogs = allLogs.map(toSharedLog);

    // 3. Get current streak with pessimistic lock (prevents concurrent updates)
    let streak = await streakRepo
      .createQueryBuilder("s")
      .setLock("pessimistic_write")
      .where("s.user_id = :userId", { userId })
      .andWhere("s.user_trackable_id = :utId", { utId: input.userTrackableId })
      .getOne();

    if (!streak) {
      // Race-safe creation: ON CONFLICT DO NOTHING handles concurrent inserts
      await manager.query(
        `INSERT INTO streaks (user_id, user_trackable_id, current_streak, best_streak)
         VALUES ($1, $2, 0, 0)
         ON CONFLICT (user_id, user_trackable_id) DO NOTHING`,
        [userId, input.userTrackableId]
      );
      streak = await streakRepo
        .createQueryBuilder("s")
        .setLock("pessimistic_write")
        .where("s.user_id = :userId", { userId })
        .andWhere("s.user_trackable_id = :utId", { utId: input.userTrackableId })
        .getOne();
    }

    // 4. Compute day result using shared scoring engine
    const dayResult = computeDayResult(
      ut.goal,
      sharedLogs,
      toSharedStreak(streak!),
      ut.scoring,
      dayStart
    );

    // 5. Upsert ComputedDailyStats (ON CONFLICT prevents race condition)
    await manager.query(
      `INSERT INTO computed_daily_stats (user_id, user_trackable_id, day, progress, met_goal, points_earned, updated_at)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6, NOW())
       ON CONFLICT (user_trackable_id, day)
       DO UPDATE SET progress = EXCLUDED.progress, met_goal = EXCLUDED.met_goal,
                     points_earned = EXCLUDED.points_earned, updated_at = NOW()`,
      [userId, input.userTrackableId, dayStr, JSON.stringify(dayResult.progress), dayResult.metGoal, dayResult.pointsEarned]
    );

    // 6. Update streak
    if (dayResult.metGoal) {
      streak!.currentStreak = dayResult.newStreak;
      streak!.bestStreak = Math.max(dayResult.newStreak, streak!.bestStreak);
      streak!.lastMetDay = dayStr as unknown as Date;
    } else {
      streak!.currentStreak = 0;
    }
    await streakRepo.save(streak!);

    // 7. Upsert PointsLedger: remove old entries for this trackable+day, insert new
    await ledgerRepo.delete({
      userId,
      userTrackableId: input.userTrackableId,
      day: dayStr as unknown as Date,
      source: "trackable_goal",
    });

    if (dayResult.pointsEarned > 0) {
      const basePoints = dayResult.metGoal ? ut.scoring.basePoints : 0;
      if (basePoints > 0) {
        const entry = ledgerRepo.create({
          userId,
          userTrackableId: input.userTrackableId,
          day: dayStr as unknown as Date,
          source: "trackable_goal",
          points: basePoints,
          reason: `Meta diária cumprida: ${CATEGORY_NAMES[ut.template.category]}`,
        });
        await ledgerRepo.save(entry);
      }
    }

    // Handle streak bonus separately
    if (dayResult.bonusAwarded) {
      await ledgerRepo.delete({
        userId,
        userTrackableId: input.userTrackableId,
        day: dayStr as unknown as Date,
        source: "streak_bonus",
      });

      const bonusEntry = ledgerRepo.create({
        userId,
        userTrackableId: input.userTrackableId,
        day: dayStr as unknown as Date,
        source: "streak_bonus",
        points: dayResult.bonusAwarded,
        reason: `Bônus de streak: ${dayResult.newStreak} dias consecutivos`,
      });
      await ledgerRepo.save(bonusEntry);
    }

    // Perfect day bonus: +10 XP when ALL active challenges are met
    const perfectDayBonus = dayResult.metGoal
      ? await awardPerfectDayBonus(manager, userId, dayStr)
      : 0;

    // Weekly bonuses: award for previous completed week (idempotent)
    await awardWeeklyBonuses(manager, userId, dayStart);

    // Build feedback
    const totalPoints = dayResult.pointsEarned + perfectDayBonus;
    const streakChanged = dayResult.metGoal && dayResult.newStreak > 0;

    let message = "Registro salvo";
    if (perfectDayBonus > 0) {
      message = `Dia perfeito! +${totalPoints} XP`;
    } else if (dayResult.metGoal) {
      message = `Meta cumprida! +${totalPoints} XP`;
    }

    return {
      goalMet: dayResult.metGoal,
      pointsEarned: totalPoints,
      streakUpdated: streakChanged
        ? { from: Math.max(0, dayResult.newStreak - 1), to: dayResult.newStreak }
        : undefined,
      milestone: perfectDayBonus > 0
        ? { day: 0, bonus: perfectDayBonus }
        : undefined,
      message,
    };
  });
}

// ── 1d. updateGoal ──────────────────────────────────────────

interface UpdateGoalInput {
  category: TrackableCategory;
  target: number;
}

export async function updateGoal(
  userId: string,
  input: UpdateGoalInput
): Promise<void> {
  const ds = await getDataSource();
  const utRepo = ds.getRepository(UserTrackable);

  const ut = await utRepo
    .createQueryBuilder("ut")
    .innerJoin("ut.template", "t")
    .where("ut.user_id = :userId", { userId })
    .andWhere("t.category = :category", { category: input.category })
    .getOne();

  if (!ut) {
    throw new Error("UserTrackable not found");
  }

  ut.goal = { ...ut.goal, target: input.target };
  await utRepo.save(ut);
}

// ── 1e. toggleActive ─────────────────────────────────────────

export async function toggleActive(
  userId: string,
  category: TrackableCategory
): Promise<{ isActive: boolean }> {
  const ds = await getDataSource();
  const utRepo = ds.getRepository(UserTrackable);

  const ut = await utRepo
    .createQueryBuilder("ut")
    .innerJoin("ut.template", "t")
    .where("ut.user_id = :userId", { userId })
    .andWhere("t.category = :category", { category })
    .getOne();

  if (!ut) {
    throw new Error("UserTrackable not found");
  }

  ut.isActive = !ut.isActive;
  await utRepo.save(ut);

  return { isActive: ut.isActive };
}

// ── 1f. getUserSettings ──────────────────────────────────────

export interface UserTrackableSetting {
  category: TrackableCategory;
  isActive: boolean;
  target: number;
}

export async function getUserSettings(
  userId: string
): Promise<UserTrackableSetting[]> {
  const userTrackables = await ensureUserTrackables(userId);

  return userTrackables.map((ut) => ({
    category: ut.template.category,
    isActive: ut.isActive,
    target: ut.goal.target ?? 0,
  }));
}

// ── 2a. buildWeeklySummary ──────────────────────────────────

function weekMonday(d: Date): Date {
  const day = d.getDay(); // 0=Sun
  const offset = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(mon.getDate() + offset);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

export async function buildWeeklySummary(
  userId: string,
  date: Date
): Promise<WeeklySummary> {
  const ds = await getDataSource();
  const statsRepo = ds.getRepository(ComputedDailyStats);
  const ledgerRepo = ds.getRepository(PointsLedger);
  const userTrackables = await ensureUserTrackables(userId);
  const activeUTs = userTrackables.filter((ut) => ut.isActive);

  const selected = startOfDay(date);
  const today = startOfDay(new Date());
  const monday = weekMonday(selected);

  // Build 7 day dates
  const weekDates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    weekDates.push(d);
  }

  // Fetch all stats for this week for all user trackables
  const utIds = activeUTs.map((ut) => ut.id);
  const mondayStr = dayString(monday);
  const sundayStr = dayString(weekDates[6]);

  let allStats: ComputedDailyStats[] = [];
  if (utIds.length > 0) {
    allStats = await statsRepo
      .createQueryBuilder("s")
      .where("s.user_trackable_id IN (:...utIds)", { utIds })
      .andWhere("s.day >= :start", { start: mondayStr })
      .andWhere("s.day <= :end", { end: sundayStr })
      .getMany();
  }

  // Index stats: utId -> dayStr -> stats
  const statsMap = new Map<string, Map<string, ComputedDailyStats>>();
  for (const s of allStats) {
    if (!statsMap.has(s.userTrackableId)) {
      statsMap.set(s.userTrackableId, new Map());
    }
    const dayKey = s.day instanceof Date ? dayString(s.day) : String(s.day).slice(0, 10);
    statsMap.get(s.userTrackableId)!.set(dayKey, s);
  }

  // Build per-day status and per-challenge data
  const days: WeekDayStatus[] = [];
  const challengeRows: { daysMet: boolean[]; metCount: number; totalDays: number; weeklyProgress: number }[] =
    activeUTs.map(() => ({ daysMet: [], metCount: 0, totalDays: 0, weeklyProgress: 0 }));

  let totalDone = 0;
  let perfectDays = 0;
  const perfectFlags: boolean[] = [];

  for (let i = 0; i < 7; i++) {
    const day = weekDates[i];
    const dayKey = dayString(day);
    const isFuture = day > today;
    const isSelected = day.getTime() === selected.getTime();

    let metCount = 0;

    activeUTs.forEach((ut, ti) => {
      const s = statsMap.get(ut.id)?.get(dayKey);
      const met = !isFuture && (s?.metGoal ?? false);
      challengeRows[ti].daysMet.push(met);
      if (!isFuture) {
        challengeRows[ti].totalDays++;
        if (met) {
          challengeRows[ti].metCount++;
          totalDone++;
          metCount++;
        }
        const progressNum = typeof s?.progress === "object" ? (s.progress.total ?? 0) : 0;
        challengeRows[ti].weeklyProgress += progressNum;
      }
    });

    const isPerfect = !isFuture && metCount === activeUTs.length && activeUTs.length > 0;
    if (isPerfect) perfectDays++;
    perfectFlags.push(isPerfect);

    days.push({ date: dayKey, dayOfMonth: day.getDate(), metCount, total: activeUTs.length, isSelected, isFuture });
  }

  // Best streak of perfect days
  let bestStreak = 0;
  let run = 0;
  for (const perfect of perfectFlags) {
    if (perfect) { run++; if (run > bestStreak) bestStreak = run; } else { run = 0; }
  }

  const nonFutureDays = days.filter((d) => !d.isFuture).length;
  const totalPossible = nonFutureDays * activeUTs.length;
  const percentMet = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

  const isComplete = nonFutureDays === 7;

  // Weekly XP
  const totalXP = await ledgerRepo
    .createQueryBuilder("pl")
    .select("COALESCE(SUM(pl.points), 0)", "total")
    .where("pl.user_id = :userId", { userId })
    .andWhere("pl.day >= :start", { start: mondayStr })
    .andWhere("pl.day <= :end", { end: sundayStr })
    .getRawOne()
    .then((r) => Number(r?.total ?? 0));

  // Build challenge summaries
  const challenges: WeekChallengeSummary[] = activeUTs.map((ut, i) => ({
    category: ut.template.category,
    name: CATEGORY_NAMES[ut.template.category],
    icon: ut.template.icon ?? "",
    daysMet: challengeRows[i].daysMet,
    metCount: challengeRows[i].metCount,
    totalDays: challengeRows[i].totalDays,
    weeklyTarget: (ut.goal.target ?? 0) * 7,
    weeklyProgress: challengeRows[i].weeklyProgress,
    unit: ut.goal.unit ?? "",
  }));

  // Bonus calculations
  const weeklyGoalBonusXP = isComplete
    ? challenges.filter((c) => c.metCount === 7).length * 10
    : 0;
  const perfectWeekBonusXP =
    isComplete && challenges.every((c) => c.metCount === 7) ? 10 : 0;

  return {
    days,
    challenges,
    totalXP,
    percentMet,
    perfectDays,
    totalDone,
    bestStreak,
    isComplete,
    weeklyGoalBonusXP,
    perfectWeekBonusXP,
  };
}

// ── 2b. buildMonthlySummary ─────────────────────────────────

export async function buildMonthlySummary(
  userId: string,
  date: Date
): Promise<MonthlySummary> {
  const ds = await getDataSource();
  const statsRepo = ds.getRepository(ComputedDailyStats);
  const ledgerRepo = ds.getRepository(PointsLedger);
  const userTrackables = await ensureUserTrackables(userId);
  const activeUTs = userTrackables.filter((ut) => ut.isActive);

  const selected = startOfDay(date);
  const today = startOfDay(new Date());
  const year = selected.getFullYear();
  const month = selected.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthStartStr = dayString(new Date(year, month, 1));
  const monthEndStr = dayString(new Date(year, month, daysInMonth));

  // Fetch all stats for this month
  const utIds = activeUTs.map((ut) => ut.id);
  let allStats: ComputedDailyStats[] = [];
  if (utIds.length > 0) {
    allStats = await statsRepo
      .createQueryBuilder("s")
      .where("s.user_trackable_id IN (:...utIds)", { utIds })
      .andWhere("s.day >= :start", { start: monthStartStr })
      .andWhere("s.day <= :end", { end: monthEndStr })
      .getMany();
  }

  // Index stats
  const statsMap = new Map<string, Map<string, ComputedDailyStats>>();
  for (const s of allStats) {
    if (!statsMap.has(s.userTrackableId)) {
      statsMap.set(s.userTrackableId, new Map());
    }
    const dayKey = s.day instanceof Date ? dayString(s.day) : String(s.day).slice(0, 10);
    statsMap.get(s.userTrackableId)!.set(dayKey, s);
  }

  const challengeRows: { daysMet: boolean[]; metCount: number; totalDays: number }[] =
    activeUTs.map(() => ({ daysMet: [], metCount: 0, totalDays: 0 }));

  let totalDone = 0;
  let perfectDays = 0;
  let futureDayStart = daysInMonth + 1;
  let foundFuture = false;
  const perfectFlags: boolean[] = [];

  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const day = new Date(year, month, dayNum);
    const dayKey = dayString(day);
    const isFuture = day > today;

    if (isFuture && !foundFuture) {
      futureDayStart = dayNum;
      foundFuture = true;
    }

    let dayMetCount = 0;

    activeUTs.forEach((ut, ti) => {
      const s = statsMap.get(ut.id)?.get(dayKey);
      const met = !isFuture && (s?.metGoal ?? false);
      challengeRows[ti].daysMet.push(met);
      if (!isFuture) {
        challengeRows[ti].totalDays++;
        if (met) {
          challengeRows[ti].metCount++;
          totalDone++;
          dayMetCount++;
        }
      }
    });

    const isPerfect = !isFuture && dayMetCount === activeUTs.length && activeUTs.length > 0;
    if (isPerfect) perfectDays++;
    perfectFlags.push(isPerfect);
  }

  // Best streak
  let bestStreak = 0;
  let run = 0;
  for (const perfect of perfectFlags) {
    if (perfect) { run++; if (run > bestStreak) bestStreak = run; } else { run = 0; }
  }

  const totalPossible = (challengeRows[0]?.totalDays ?? 0) * activeUTs.length;
  const percentMet = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

  const totalXP = await ledgerRepo
    .createQueryBuilder("pl")
    .select("COALESCE(SUM(pl.points), 0)", "total")
    .where("pl.user_id = :userId", { userId })
    .andWhere("pl.day >= :start", { start: monthStartStr })
    .andWhere("pl.day <= :end", { end: monthEndStr })
    .getRawOne()
    .then((r) => Number(r?.total ?? 0));

  const challenges: MonthChallengeSummary[] = activeUTs.map((ut, i) => ({
    category: ut.template.category,
    name: CATEGORY_NAMES[ut.template.category],
    icon: ut.template.icon ?? "",
    daysMet: challengeRows[i].daysMet,
    metCount: challengeRows[i].metCount,
    totalDays: challengeRows[i].totalDays,
    percentMet:
      challengeRows[i].totalDays > 0
        ? Math.round((challengeRows[i].metCount / challengeRows[i].totalDays) * 100)
        : 0,
  }));

  return {
    year,
    month,
    daysInMonth,
    futureDayStart,
    selectedDay: selected.getDate(),
    challenges,
    perfectDays,
    percentMet,
    totalDone,
    bestStreak,
    totalXP,
  };
}

