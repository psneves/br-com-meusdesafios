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
} from "../types/today";

// ── Helpers ──────────────────────────────────────────────────

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function dayString(d: Date): string {
  return d.toISOString().slice(0, 10);
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

  // New user — provision all 4 templates
  const templateRepo = ds.getRepository(TrackableTemplate);
  const templates = await templateRepo.find();

  const streakRepo = ds.getRepository(StreakEntity);
  const today = dayString(new Date());

  for (const template of templates) {
    const goal =
      GOAL_OVERRIDES[template.category] ?? template.defaultGoal;

    const ut = utRepo.create({
      userId,
      templateId: template.id,
      goal,
      schedule: { type: "daily", timezone: "America/Sao_Paulo" },
      scoring: template.defaultScoring,
      startDate: today as unknown as Date,
    });
    await utRepo.save(ut);

    const streak = streakRepo.create({
      userId,
      userTrackableId: ut.id,
      currentStreak: 0,
      bestStreak: 0,
    });
    await streakRepo.save(streak);
  }

  userTrackables = await utRepo.find({
    where: { userId },
    relations: ["template"],
  });

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

  const cards: TodayCard[] = [];

  for (const ut of userTrackables) {
    if (!ut.isActive) continue;

    const [logs, stats, streak] = await Promise.all([
      logRepo
        .createQueryBuilder("log")
        .where("log.user_trackable_id = :utId", { utId: ut.id })
        .andWhere("log.occurred_at >= :dayStart", { dayStart })
        .andWhere("log.occurred_at <= :dayEnd", { dayEnd })
        .orderBy("log.occurred_at", "ASC")
        .getMany(),
      statsRepo.findOne({
        where: { userTrackableId: ut.id, day: dayStr as unknown as Date },
      }),
      streakRepo.findOne({
        where: { userId, userTrackableId: ut.id },
      }),
    ]);

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

// ── 1c. createLog ────────────────────────────────────────────

interface CreateLogInput {
  userTrackableId: string;
  valueNum: number;
  meta?: LogMeta;
}

export async function createLog(
  userId: string,
  input: CreateLogInput
): Promise<LogFeedback> {
  const ds = await getDataSource();
  const utRepo = ds.getRepository(UserTrackable);
  const logRepo = ds.getRepository(TrackableLogEntity);
  const statsRepo = ds.getRepository(ComputedDailyStats);
  const streakRepo = ds.getRepository(StreakEntity);
  const ledgerRepo = ds.getRepository(PointsLedger);

  // Validate ownership
  const ut = await utRepo.findOne({
    where: { id: input.userTrackableId, userId },
    relations: ["template"],
  });
  if (!ut) {
    throw new Error("UserTrackable not found or does not belong to user");
  }

  // Insert log
  const now = new Date();
  const log = logRepo.create({
    userId,
    userTrackableId: input.userTrackableId,
    occurredAt: now,
    valueNum: input.valueNum,
    meta: input.meta,
  });
  await logRepo.save(log);

  // ── Recompute pipeline ──────────────────────────────────

  const dayStart = startOfDay(now);
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);
  const dayStr = dayString(dayStart);

  // 1. Query all logs for today
  const allLogs = await logRepo
    .createQueryBuilder("log")
    .where("log.user_trackable_id = :utId", { utId: input.userTrackableId })
    .andWhere("log.occurred_at >= :dayStart", { dayStart })
    .andWhere("log.occurred_at <= :dayEnd", { dayEnd })
    .getMany();
  const sharedLogs = allLogs.map(toSharedLog);

  // 2. Get current streak
  let streak = await streakRepo.findOne({
    where: { userId, userTrackableId: input.userTrackableId },
  });
  if (!streak) {
    streak = streakRepo.create({
      userId,
      userTrackableId: input.userTrackableId,
      currentStreak: 0,
      bestStreak: 0,
    });
    await streakRepo.save(streak);
  }

  // 3. Compute day result using shared scoring engine
  const dayResult = computeDayResult(
    ut.goal,
    sharedLogs,
    toSharedStreak(streak),
    ut.scoring,
    dayStart
  );

  // 4. Upsert ComputedDailyStats
  let existingStats = await statsRepo.findOne({
    where: { userTrackableId: input.userTrackableId, day: dayStr as unknown as Date },
  });
  if (existingStats) {
    existingStats.progress = dayResult.progress;
    existingStats.metGoal = dayResult.metGoal;
    existingStats.pointsEarned = dayResult.pointsEarned;
    await statsRepo.save(existingStats);
  } else {
    existingStats = statsRepo.create({
      userId,
      userTrackableId: input.userTrackableId,
      day: dayStr as unknown as Date,
      progress: dayResult.progress,
      metGoal: dayResult.metGoal,
      pointsEarned: dayResult.pointsEarned,
    });
    await statsRepo.save(existingStats);
  }

  // 5. Update streak
  if (dayResult.metGoal) {
    streak.currentStreak = dayResult.newStreak;
    streak.bestStreak = Math.max(dayResult.newStreak, streak.bestStreak);
    streak.lastMetDay = dayStr as unknown as Date;
  } else {
    streak.currentStreak = 0;
  }
  await streakRepo.save(streak);

  // 6. Upsert PointsLedger: remove old entries for this trackable+day, insert new
  await ledgerRepo.delete({
    userId,
    userTrackableId: input.userTrackableId,
    day: dayStr as unknown as Date,
    source: "trackable_goal",
  });

  if (dayResult.pointsEarned > 0) {
    // Base points entry
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
    // Remove old streak_bonus for this trackable+day
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

  // Build feedback
  const previousStreak = streak.currentStreak - (dayResult.metGoal ? 1 : 0);
  const streakChanged = dayResult.metGoal && dayResult.newStreak > 0;

  const feedback: LogFeedback = {
    goalMet: dayResult.metGoal,
    pointsEarned: dayResult.pointsEarned,
    streakUpdated: streakChanged
      ? { from: Math.max(0, dayResult.newStreak - 1), to: dayResult.newStreak }
      : undefined,
    milestone: dayResult.bonusAwarded
      ? { day: dayResult.newStreak, bonus: dayResult.bonusAwarded }
      : undefined,
    message: dayResult.metGoal
      ? `Meta cumprida! +${dayResult.pointsEarned} XP`
      : "Registro salvo",
  };

  return feedback;
}
