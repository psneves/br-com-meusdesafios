import type { Goal, ScoringConfig } from "@meusdesafios/shared";
import { DEFAULT_SCORING } from "@meusdesafios/shared";

interface TemplateSeed {
  code: string;
  name: string;
  category: "WATER" | "DIET_CONTROL" | "SLEEP" | "PHYSICAL_EXERCISE";
  defaultGoal: Goal;
  defaultScoring: ScoringConfig;
  description: string;
  icon: string;
}

export const TRACKABLE_TEMPLATES: TemplateSeed[] = [
  {
    code: "WATER",
    name: "Water",
    category: "WATER",
    defaultGoal: {
      type: "target",
      target: 2500,
      unit: "ml",
    },
    defaultScoring: DEFAULT_SCORING,
    description: "Track daily water intake",
    icon: "💧",
  },
  {
    code: "DIET_CONTROL",
    name: "Diet Control",
    category: "DIET_CONTROL",
    defaultGoal: {
      type: "binary",
    },
    defaultScoring: DEFAULT_SCORING,
    description: "Track daily diet compliance",
    icon: "🥗",
  },
  {
    code: "SLEEP",
    name: "Sleep",
    category: "SLEEP",
    defaultGoal: {
      type: "time_window",
      timeWindowEnd: "23:00",
    },
    defaultScoring: DEFAULT_SCORING,
    description: "Track sleep habits and bedtime",
    icon: "😴",
  },
  {
    code: "PHYSICAL_EXERCISE",
    name: "Physical Exercise",
    category: "PHYSICAL_EXERCISE",
    defaultGoal: {
      type: "target",
      target: 60,
      unit: "min",
    },
    defaultScoring: DEFAULT_SCORING,
    description: "Track physical exercise with modalities (gym, run, cycling, swim)",
    icon: "💪",
  },
];
