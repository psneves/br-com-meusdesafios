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
  date?: string;
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

  // Insert log — use provided date or default to now
  const targetDate = input.date
    ? new Date(`${input.date}T12:00:00`)
    : new Date();
  const log = logRepo.create({
    userId,
    userTrackableId: input.userTrackableId,
    occurredAt: targetDate,
    valueNum: input.valueNum,
    meta: input.meta,
  });
  await logRepo.save(log);

  // ── Recompute pipeline ──────────────────────────────────

  const dayStart = startOfDay(targetDate);
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
    const dayKey = String(s.day).slice(0, 10);
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
    const dayKey = String(s.day).slice(0, 10);
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
