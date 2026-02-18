import type {
  TodayCard,
  TodayResponse,
  ProgressBreakdown,
  WeeklySummary,
  WeekDayStatus,
  WeekChallengeSummary,
  MonthlySummary,
  MonthChallengeSummary,
} from "../types/today";

// ── Raw mock daily data (Feb 1–18, 2026) ──────────────────

interface DailyValues {
  water: number;
  exercise: number;
  diet: number;
  sleep: number;
}

const DAILY_DATA: Record<string, DailyValues> = {
  "2026-02-01": { water: 2700, exercise: 75, diet: 5, sleep: 450 },
  "2026-02-02": { water: 2600, exercise: 60, diet: 5, sleep: 430 },
  "2026-02-03": { water: 2800, exercise: 80, diet: 6, sleep: 460 },
  "2026-02-04": { water: 2500, exercise: 65, diet: 5, sleep: 420 },
  "2026-02-05": { water: 2800, exercise: 45, diet: 5, sleep: 450 },
  "2026-02-06": { water: 2600, exercise: 70, diet: 4, sleep: 380 },
  "2026-02-07": { water: 1800, exercise: 90, diet: 3, sleep: 480 },
  "2026-02-08": { water: 2200, exercise: 0, diet: 5, sleep: 510 },
  "2026-02-09": { water: 2700, exercise: 65, diet: 5, sleep: 420 },
  "2026-02-10": { water: 3000, exercise: 50, diet: 6, sleep: 390 },
  "2026-02-11": { water: 2500, exercise: 75, diet: 5, sleep: 440 },
  "2026-02-12": { water: 2600, exercise: 60, diet: 5, sleep: 430 },
  "2026-02-13": { water: 2900, exercise: 65, diet: 4, sleep: 460 },
  "2026-02-14": { water: 3000, exercise: 120, diet: 3, sleep: 450 },
  "2026-02-15": { water: 1500, exercise: 0, diet: 0, sleep: 480 },
  "2026-02-16": { water: 2800, exercise: 70, diet: 5, sleep: 440 },
  "2026-02-17": { water: 2700, exercise: 30, diet: 4, sleep: 460 },
  "2026-02-18": { water: 1200, exercise: 0, diet: 2, sleep: 450 },
};

const EXERCISE_BREAKDOWNS: Record<string, ProgressBreakdown[]> = {
  "2026-02-01": [{ label: "Musculação", value: 75, actionId: "exercise-gym" }],
  "2026-02-02": [{ label: "Corrida", value: 60, actionId: "exercise-run" }],
  "2026-02-03": [
    { label: "Ciclismo", value: 80, actionId: "exercise-cycling" },
  ],
  "2026-02-04": [{ label: "Natação", value: 65, actionId: "exercise-swim" }],
  "2026-02-05": [{ label: "Natação", value: 45, actionId: "exercise-swim" }],

  "2026-02-06": [{ label: "Corrida", value: 70, actionId: "exercise-run" }],
  "2026-02-07": [
    { label: "Ciclismo", value: 90, actionId: "exercise-cycling" },
  ],
  "2026-02-09": [{ label: "Musculação", value: 65, actionId: "exercise-gym" }],
  "2026-02-10": [{ label: "Musculação", value: 50, actionId: "exercise-gym" }],

  "2026-02-11": [{ label: "Corrida", value: 75, actionId: "exercise-run" }],
  "2026-02-12": [{ label: "Musculação", value: 60, actionId: "exercise-gym" }],
  "2026-02-13": [{ label: "Musculação", value: 65, actionId: "exercise-gym" }],
  "2026-02-14": [
    { label: "Ciclismo", value: 70, actionId: "exercise-cycling" },
    { label: "Corrida", value: 50, actionId: "exercise-run" },
  ],
  "2026-02-16": [{ label: "Corrida", value: 70, actionId: "exercise-run" }],
};

// Diet meal breakdowns: value 1=success, 0=skipped, -1=fail
const DIET_BREAKDOWNS: Record<string, ProgressBreakdown[]> = {
  "2026-02-14": [
    { label: "Café", value: 1, actionId: "diet-meal-0" },
    { label: "Lanche", value: 0, actionId: "diet-meal-1" },
    { label: "Almoço", value: 1, actionId: "diet-meal-2" },
    { label: "Lanche", value: -1, actionId: "diet-meal-3" },
    { label: "Jantar", value: 1, actionId: "diet-meal-4" },
  ],
};

const DATA_START = new Date(2026, 1, 1); // Feb 1, 2026

// ── Trackable definitions ─────────────────────────────────

type Field = keyof DailyValues;

interface TrackableDef {
  field: Field;
  userTrackableId: string;
  templateCode: string;
  name: string;
  icon: string;
  category: "WATER" | "DIET_CONTROL" | "SLEEP" | "PHYSICAL_EXERCISE";
  target: number;
  unit: string;
  quickActions: TodayCard["quickActions"];
}

const TRACKABLES: TrackableDef[] = [
  {
    field: "water",
    userTrackableId: "ut-water-001",
    templateCode: "WATER",
    name: "Água",
    icon: "💧",
    category: "WATER",
    target: 2500,
    unit: "ml",
    quickActions: [
      {
        id: "water-250",
        type: "add",
        label: "+250 ml",
        amount: 250,
        unit: "ml",
      },
      {
        id: "water-500",
        type: "add",
        label: "+500 ml",
        amount: 500,
        unit: "ml",
      },
      {
        id: "water-750",
        type: "add",
        label: "+750 ml",
        amount: 750,
        unit: "ml",
      },
    ],
  },
  {
    field: "exercise",
    userTrackableId: "ut-exercise-001",
    templateCode: "PHYSICAL_EXERCISE",
    name: "Exercício Físico",
    icon: "💪",
    category: "PHYSICAL_EXERCISE",
    target: 60,
    unit: "min",
    quickActions: [],
  },
  {
    field: "diet",
    userTrackableId: "ut-diet-001",
    templateCode: "DIET_CONTROL",
    name: "Dieta",
    icon: "🥗",
    category: "DIET_CONTROL",
    target: 5,
    unit: "refeições",
    quickActions: [],
  },
  {
    field: "sleep",
    userTrackableId: "ut-sleep-001",
    templateCode: "SLEEP",
    name: "Sono",
    icon: "😴",
    category: "SLEEP",
    target: 420,
    unit: "min",
    quickActions: [
      {
        id: "sleep-6h30",
        type: "add",
        label: "6:30",
        amount: 390,
        unit: "min",
      },
      { id: "sleep-7h", type: "add", label: "7:00", amount: 420, unit: "min" },
      { id: "sleep-plus", type: "add", label: "+", amount: 30, unit: "min" },
      {
        id: "sleep-minus",
        type: "add",
        label: "\u2212",
        amount: -30,
        unit: "min",
      },
    ],
  },
];

// ── Date helpers ──────────────────────────────────────────

export function toKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function sod(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Monday of the ISO week containing d */
export function weekMonday(d: Date): Date {
  const r = sod(d);
  const dow = r.getDay(); // 0=Sun
  const diff = dow === 0 ? -6 : 1 - dow;
  r.setDate(r.getDate() + diff);
  return r;
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

// ── Data access & scoring ─────────────────────────────────

function getValue(field: Field, d: Date): number {
  return DAILY_DATA[toKey(d)]?.[field] ?? 0;
}

function isMet(field: Field, target: number, d: Date): boolean {
  return getValue(field, d) >= target;
}

/** Count consecutive met days ending at `from`, walking backwards */
function countBackwards(field: Field, target: number, from: Date): number {
  let count = 0;
  const d = new Date(from);
  while (d >= DATA_START) {
    if (isMet(field, target, d)) {
      count++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return count;
}

function computeStreak(
  field: Field,
  target: number,
  upTo: Date
): { current: number; best: number } {
  const today = sod(new Date());
  const viewDate = sod(upTo);
  const isViewingToday = viewDate.getTime() === today.getTime();
  const metOnDate = isMet(field, target, viewDate);

  // Current streak
  let current = 0;
  if (metOnDate) {
    current = countBackwards(field, target, viewDate);
  } else if (isViewingToday) {
    // Today not met yet — show streak from yesterday (still pending)
    const yesterday = addDays(viewDate, -1);
    if (yesterday >= DATA_START && isMet(field, target, yesterday)) {
      current = countBackwards(field, target, yesterday);
    }
  }
  // else: past day, not met → current = 0

  // Best streak: longest consecutive run in [DATA_START, viewDate]
  let best = 0;
  let run = 0;
  const iter = new Date(DATA_START);
  while (iter <= viewDate) {
    if (isMet(field, target, iter)) {
      run++;
      if (run > best) best = run;
    } else {
      run = 0;
    }
    iter.setDate(iter.getDate() + 1);
  }

  return { current, best: Math.max(current, best) };
}

function computePointsForDay(field: Field, target: number, d: Date): number {
  return isMet(field, target, d) ? 10 : 0;
}

function sumPointsRange(
  field: Field,
  target: number,
  from: Date,
  to: Date
): number {
  let total = 0;
  const iter = new Date(from);
  while (iter <= to) {
    total += computePointsForDay(field, target, iter);
    iter.setDate(iter.getDate() + 1);
  }
  return total;
}

// ── Period summary ────────────────────────────────────────

function periodSummary(
  field: Field,
  target: number,
  from: Date,
  to: Date,
  unit: string
): { value: number; unit: string; count: number; totalDays: number } {
  let value = 0;
  let count = 0;
  let totalDays = 0;
  const iter = new Date(from);
  while (iter <= to) {
    totalDays++;
    const v = getValue(field, iter);
    value += v;
    if (v >= target) count++;
    iter.setDate(iter.getDate() + 1);
  }
  return { value, unit, count, totalDays };
}

// ── Build card for a specific date ────────────────────────

function buildCard(def: TrackableDef, date: Date): TodayCard {
  const d = sod(date);
  const value = getValue(def.field, d);
  const met = value >= def.target;
  const percentage =
    def.target > 0 ? Math.min(100, Math.round((value / def.target) * 100)) : 0;

  const streak = computeStreak(def.field, def.target, d);
  const pointsToday = computePointsForDay(def.field, def.target, d);

  const mon = weekMonday(d);
  const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);

  const card: TodayCard = {
    userTrackableId: def.userTrackableId,
    templateCode: def.templateCode,
    name: def.name,
    icon: def.icon,
    category: def.category,
    goal: { type: "target", target: def.target, unit: def.unit },
    progress: { value, unit: def.unit, met, percentage },
    streak,
    pointsToday,
    quickActions: def.quickActions,
    periodWeek: periodSummary(def.field, def.target, mon, d, def.unit),
    periodMonth: periodSummary(def.field, def.target, monthStart, d, def.unit),
  };

  if (def.field === "exercise") {
    const breakdown = EXERCISE_BREAKDOWNS[toKey(d)];
    if (breakdown) card.breakdown = breakdown;
  } else if (def.field === "diet") {
    const breakdown = DIET_BREAKDOWNS[toKey(d)];
    if (breakdown) card.breakdown = breakdown;
  }

  return card;
}

// ── Public API ────────────────────────────────────────────

export function getMockTodayResponse(date?: Date): TodayResponse {
  const d = sod(date ?? new Date());
  const today = sod(new Date());
  const cards = TRACKABLES.map((def) => buildCard(def, d));

  const totalPoints = cards.reduce((sum, c) => sum + c.pointsToday, 0);

  // Week/month XP covers the full period up to today (not just up to selected date)
  const mon = weekMonday(d);
  const sun = addDays(mon, 6);
  const weekEnd = sun > today ? today : sun;

  const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
  const monthLast = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const monthEnd = monthLast > today ? today : monthLast;

  const pointsWeek = TRACKABLES.reduce(
    (sum, def) => sum + sumPointsRange(def.field, def.target, mon, weekEnd),
    0
  );
  const pointsMonth = TRACKABLES.reduce(
    (sum, def) => sum + sumPointsRange(def.field, def.target, monthStart, monthEnd),
    0
  );

  return {
    date: formatDate(d),
    greeting: getGreeting(),
    totalPoints,
    pointsWeek,
    pointsMonth,
    cards,
  };
}

export function getMockWeeklySummary(selectedDate: Date): WeeklySummary {
  const today = sod(new Date());
  const selected = sod(selectedDate);
  const mon = weekMonday(selected);

  const days: WeekDayStatus[] = [];
  const challengeData: { daysMet: boolean[]; metCount: number; totalDays: number }[] =
    TRACKABLES.map(() => ({ daysMet: [], metCount: 0, totalDays: 0 }));

  let totalXP = 0;
  let totalDone = 0;
  let perfectDays = 0;
  const perfectFlags: boolean[] = [];

  for (let i = 0; i < 7; i++) {
    const day = addDays(mon, i);
    const dayKey = toKey(day);
    const isFuture = day > today;
    const isSelected = day.getTime() === selected.getTime();

    let metCount = 0;

    TRACKABLES.forEach((def, ti) => {
      const met = !isFuture && isMet(def.field, def.target, day);
      challengeData[ti].daysMet.push(met);
      if (!isFuture) {
        challengeData[ti].totalDays++;
        if (met) {
          challengeData[ti].metCount++;
          totalXP += 10;
          totalDone++;
        }
      }
      if (met) metCount++;
    });

    const isPerfect = !isFuture && metCount === TRACKABLES.length;
    if (isPerfect) perfectDays++;
    perfectFlags.push(isPerfect);

    days.push({
      date: dayKey,
      dayOfMonth: day.getDate(),
      metCount,
      total: TRACKABLES.length,
      isSelected,
      isFuture,
    });
  }

  // Best streak of perfect days
  let bestStreak = 0;
  let run = 0;
  for (const perfect of perfectFlags) {
    if (perfect) { run++; if (run > bestStreak) bestStreak = run; } else { run = 0; }
  }

  const nonFutureDays = days.filter((d) => !d.isFuture).length;
  const totalPossible = nonFutureDays * TRACKABLES.length;
  const percentMet = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

  const challenges: WeekChallengeSummary[] = TRACKABLES.map((def, i) => ({
    category: def.category,
    name: def.name,
    icon: def.icon,
    daysMet: challengeData[i].daysMet,
    metCount: challengeData[i].metCount,
    totalDays: challengeData[i].totalDays,
  }));

  return { days, challenges, totalXP, percentMet, perfectDays, totalDone, bestStreak };
}

export function getMockMonthlySummary(selectedDate: Date): MonthlySummary {
  const today = sod(new Date());
  const selected = sod(selectedDate);
  const year = selected.getFullYear();
  const month = selected.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const challengeData: {
    daysMet: boolean[];
    metCount: number;
    totalDays: number;
  }[] = TRACKABLES.map(() => ({ daysMet: [], metCount: 0, totalDays: 0 }));

  let totalDone = 0;
  let perfectDays = 0;
  let futureDayStart = daysInMonth + 1;
  let foundFuture = false;

  // For best streak of perfect days
  const perfectDayFlags: boolean[] = [];

  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const day = new Date(year, month, dayNum);
    const isFuture = day > today;

    if (isFuture && !foundFuture) {
      futureDayStart = dayNum;
      foundFuture = true;
    }

    let dayMetCount = 0;

    TRACKABLES.forEach((def, ti) => {
      const met = !isFuture && isMet(def.field, def.target, day);
      challengeData[ti].daysMet.push(met);
      if (!isFuture) {
        challengeData[ti].totalDays++;
        if (met) {
          challengeData[ti].metCount++;
          totalDone++;
        }
      }
      if (met) dayMetCount++;
    });

    if (!isFuture && dayMetCount === TRACKABLES.length) {
      perfectDays++;
    }
    perfectDayFlags.push(!isFuture && dayMetCount === TRACKABLES.length);
  }

  // Compute best streak of perfect days
  let bestStreak = 0;
  let run = 0;
  for (const perfect of perfectDayFlags) {
    if (perfect) {
      run++;
      if (run > bestStreak) bestStreak = run;
    } else {
      run = 0;
    }
  }

  // Total possible = totalDays (non-future) * number of challenges
  const totalPossible = challengeData[0].totalDays * TRACKABLES.length;
  const percentMet = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

  const totalXP = totalDone * 10;

  const challenges: MonthChallengeSummary[] = TRACKABLES.map((def, i) => ({
    category: def.category,
    name: def.name,
    icon: def.icon,
    daysMet: challengeData[i].daysMet,
    metCount: challengeData[i].metCount,
    totalDays: challengeData[i].totalDays,
    percentMet:
      challengeData[i].totalDays > 0
        ? Math.round((challengeData[i].metCount / challengeData[i].totalDays) * 100)
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

export const mockTodayCards = getMockTodayResponse().cards;
