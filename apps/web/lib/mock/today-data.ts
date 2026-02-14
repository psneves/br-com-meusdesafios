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
    templateCode: "WATER_DAILY",
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
  },

  // Corrida - não começou
  {
    userTrackableId: "ut-run-001",
    templateCode: "RUN_DISTANCE",
    name: "Corrida",
    icon: "🏃",
    category: "RUN",
    goal: {
      type: "target",
      target: 5,
      unit: "km",
    },
    progress: {
      value: 0,
      unit: "km",
      met: false,
      percentage: 0,
    },
    streak: {
      current: 2,
      best: 8,
    },
    pointsToday: 0,
    quickActions: [
      { id: "run-log", type: "log", label: "Registrar" },
    ],
  },

  // Dieta - toggle simples
  {
    userTrackableId: "ut-diet-001",
    templateCode: "DIET_CHECKLIST",
    name: "Alimentação",
    icon: "🥗",
    category: "DIET",
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
  },

  // Sono - não registado
  {
    userTrackableId: "ut-sleep-001",
    templateCode: "SLEEP_BEDTIME",
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
      { id: "sleep-log", type: "log", label: "Registrar" },
    ],
  },

  // Ginásio - meta cumprida
  {
    userTrackableId: "ut-gym-001",
    templateCode: "GYM_SESSION",
    name: "Musculação",
    icon: "🏋️",
    category: "GYM",
    goal: {
      type: "target",
      target: 60,
      unit: "min",
    },
    progress: {
      value: 75,
      unit: "min",
      met: true,
      percentage: 100,
    },
    streak: {
      current: 3,
      best: 10,
    },
    pointsToday: 15,
    quickActions: [
      { id: "gym-log", type: "log", label: "Registrar" },
    ],
  },

  // Ciclismo - parcial
  {
    userTrackableId: "ut-bike-001",
    templateCode: "BIKE_DISTANCE",
    name: "Ciclismo",
    icon: "🚴",
    category: "BIKE",
    goal: {
      type: "target",
      target: 20,
      unit: "km",
    },
    progress: {
      value: 12,
      unit: "km",
      met: false,
      percentage: 60,
    },
    streak: {
      current: 1,
      best: 6,
    },
    pointsToday: 0,
    quickActions: [
      { id: "bike-log", type: "log", label: "Registrar" },
    ],
  },

  // Natação - meta cumprida
  {
    userTrackableId: "ut-swim-001",
    templateCode: "SWIM_DISTANCE",
    name: "Natação",
    icon: "🏊",
    category: "SWIM",
    goal: {
      type: "target",
      target: 1,
      unit: "km",
    },
    progress: {
      value: 1.2,
      unit: "km",
      met: true,
      percentage: 100,
    },
    streak: {
      current: 14,
      best: 14,
    },
    pointsToday: 30,
    quickActions: [
      { id: "swim-log", type: "log", label: "Registrar" },
    ],
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
