import type { Goal, ScoringConfig } from "@meusdesafios/shared";
import { DEFAULT_SCORING } from "@meusdesafios/shared";

interface TemplateSeed {
  code: string;
  name: string;
  category: "RUN" | "BIKE" | "SWIM" | "GYM" | "SLEEP" | "DIET" | "WATER";
  defaultGoal: Goal;
  defaultScoring: ScoringConfig;
  description: string;
  icon: string;
}

export const TRACKABLE_TEMPLATES: TemplateSeed[] = [
  {
    code: "WATER_DAILY",
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
    code: "RUN_DISTANCE",
    name: "Run",
    category: "RUN",
    defaultGoal: {
      type: "target",
      target: 5,
      unit: "km",
    },
    defaultScoring: DEFAULT_SCORING,
    description: "Track running distance",
    icon: "🏃",
  },
  {
    code: "BIKE_DISTANCE",
    name: "Bike",
    category: "BIKE",
    defaultGoal: {
      type: "target",
      target: 20,
      unit: "km",
    },
    defaultScoring: DEFAULT_SCORING,
    description: "Track cycling distance",
    icon: "🚴",
  },
  {
    code: "SWIM_DISTANCE",
    name: "Swim",
    category: "SWIM",
    defaultGoal: {
      type: "target",
      target: 1,
      unit: "km",
    },
    defaultScoring: DEFAULT_SCORING,
    description: "Track swimming distance",
    icon: "🏊",
  },
  {
    code: "GYM_SESSION",
    name: "Gym",
    category: "GYM",
    defaultGoal: {
      type: "target",
      target: 60,
      unit: "min",
    },
    defaultScoring: DEFAULT_SCORING,
    description: "Track gym sessions",
    icon: "🏋️",
  },
  {
    code: "SLEEP_BEDTIME",
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
    code: "DIET_CHECKLIST",
    name: "Diet",
    category: "DIET",
    defaultGoal: {
      type: "binary",
    },
    defaultScoring: DEFAULT_SCORING,
    description: "Track daily diet compliance",
    icon: "🥗",
  },
];
