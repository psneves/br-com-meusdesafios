import type { TodayCard, TodayResponse } from "../types/today";

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

/** Days elapsed in the current week (Mon=1 .. Sun=7) */
function weekDaysElapsed(): number {
  const dow = new Date().getDay(); // 0=Sun 1=Mon ... 6=Sat
  return dow === 0 ? 7 : dow;
}

/** Days elapsed in the current month (1..31) */
function monthDaysElapsed(): number {
  return new Date().getDate();
}

export const mockTodayCards: TodayCard[] = [
  // Água - progresso parcial
  {
    userTrackableId: "ut-water-001",
    templateCode: "WATER",
    name: "Água",
    icon: "💧",
    category: "WATER",
    goal: {
      type: "target",
      target: 2500,
      unit: "ml",
    },
    progress: {
      value: 1500,
      unit: "ml",
      met: false,
      percentage: 60,
    },
    streak: {
      current: 4,
      best: 12,
    },
    pointsToday: 0,
    quickActions: [
      { id: "water-250", type: "add", label: "+250 ml", amount: 250, unit: "ml" },
      { id: "water-500", type: "add", label: "+500 ml", amount: 500, unit: "ml" },
      { id: "water-750", type: "add", label: "+750 ml", amount: 750, unit: "ml" },
    ],
    periodWeek: { value: 12500, unit: "ml", count: 5, totalDays: weekDaysElapsed() },
    periodMonth: { value: 30000, unit: "ml", count: 11, totalDays: monthDaysElapsed() },
  },

  // Proteína - refeições com proteína
  {
    userTrackableId: "ut-diet-001",
    templateCode: "DIET_CONTROL",
    name: "Proteína",
    icon: "🥗",
    category: "DIET_CONTROL",
    goal: {
      type: "target",
      target: 5,
      unit: "refeições",
    },
    progress: {
      value: 2,
      unit: "refeições",
      met: false,
      percentage: 40,
    },
    streak: {
      current: 7,
      best: 14,
    },
    pointsToday: 0,
    quickActions: [],
    periodWeek: { value: 22, unit: "refeições", count: 5, totalDays: weekDaysElapsed() },
    periodMonth: { value: 55, unit: "refeições", count: 11, totalDays: monthDaysElapsed() },
  },

  // Sono - duração em minutos
  {
    userTrackableId: "ut-sleep-001",
    templateCode: "SLEEP",
    name: "Sono",
    icon: "😴",
    category: "SLEEP",
    goal: {
      type: "target",
      target: 420,
      unit: "min",
    },
    progress: {
      value: 0,
      unit: "min",
      met: false,
      percentage: 0,
    },
    streak: {
      current: 0,
      best: 5,
    },
    pointsToday: 0,
    quickActions: [
      { id: "sleep-6h30", type: "add", label: "6:30", amount: 390, unit: "min" },
      { id: "sleep-7h", type: "add", label: "7:00", amount: 420, unit: "min" },
      { id: "sleep-plus", type: "add", label: "+", amount: 30, unit: "min" },
      { id: "sleep-minus", type: "add", label: "\u2212", amount: -30, unit: "min" },
    ],
    periodWeek: { value: 2100, unit: "min", count: 4, totalDays: weekDaysElapsed() },
    periodMonth: { value: 5460, unit: "min", count: 9, totalDays: monthDaysElapsed() },
  },

  // Exercício Físico - progresso parcial com modalidades
  {
    userTrackableId: "ut-exercise-001",
    templateCode: "PHYSICAL_EXERCISE",
    name: "Exercício Físico",
    icon: "💪",
    category: "PHYSICAL_EXERCISE",
    goal: {
      type: "target",
      target: 60,
      unit: "min",
    },
    progress: {
      value: 45,
      unit: "min",
      met: false,
      percentage: 75,
    },
    streak: {
      current: 3,
      best: 10,
    },
    pointsToday: 0,
    quickActions: [],
    periodWeek: { value: 180, unit: "min", count: 3, totalDays: weekDaysElapsed() },
    periodMonth: { value: 600, unit: "min", count: 10, totalDays: monthDaysElapsed() },
  },
];

export function getMockTodayResponse(): TodayResponse {
  const totalPoints = mockTodayCards.reduce(
    (sum, card) => sum + card.pointsToday,
    0
  );

  return {
    date: formatDate(new Date()),
    greeting: getGreeting(),
    totalPoints,
    pointsWeek: 120,
    pointsMonth: 450,
    cards: mockTodayCards,
  };
}
