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
      { id: "water-custom", type: "log", label: "Personalizar" },
    ],
    period7d: { value: 15500, unit: "ml", count: 5 },
    period30d: { value: 62000, unit: "ml", count: 22 },
  },

  // Controle Alimentar - toggle simples
  {
    userTrackableId: "ut-diet-001",
    templateCode: "DIET_CONTROL",
    name: "Controle Alimentar",
    icon: "🥗",
    category: "DIET_CONTROL",
    goal: {
      type: "binary",
    },
    progress: {
      value: 0,
      met: false,
      percentage: 0,
    },
    streak: {
      current: 7,
      best: 14,
    },
    pointsToday: 0,
    quickActions: [
      { id: "diet-toggle", type: "toggle", label: "Cumpri" },
    ],
    period7d: { value: 5, count: 5 },
    period30d: { value: 22, count: 22 },
  },

  // Sono - não registado
  {
    userTrackableId: "ut-sleep-001",
    templateCode: "SLEEP",
    name: "Sono",
    icon: "😴",
    category: "SLEEP",
    goal: {
      type: "time_window",
      timeWindowEnd: "23:00",
    },
    progress: {
      value: 0,
      met: false,
      percentage: 0,
    },
    streak: {
      current: 0,
      best: 5,
    },
    pointsToday: 0,
    quickActions: [
      { id: "sleep-log", type: "log", label: "Registar" },
    ],
    period7d: { value: 4, count: 4 },
    period30d: { value: 18, count: 18 },
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
    quickActions: [
      { id: "exercise-log", type: "log", label: "Registar" },
    ],
    breakdown: [
      { label: "Corrida", value: 30, actionId: "exercise-log" },
      { label: "Musculação", value: 15, actionId: "exercise-log" },
    ],
    period7d: { value: 320, unit: "min", count: 5 },
    period30d: { value: 1200, unit: "min", count: 20 },
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
    points30d: 450,
    bestStreak: 14,
    cards: mockTodayCards,
  };
}
