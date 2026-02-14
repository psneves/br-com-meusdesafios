import type { TrackableCategory, GoalType, ExerciseModality } from "@meusdesafios/shared";

export interface PeriodSummary {
  value: number;
  unit?: string;
  count: number; // number of days with logs
  totalDays: number; // total days in the period (partial week/month)
}

export interface ProgressBreakdown {
  label: string;
  value: number;
  actionId: string; // links to the QuickAction.id for its +1 button
}

export interface TodayCard {
  userTrackableId: string;
  templateCode: string;
  name: string;
  icon: string;
  category: TrackableCategory;
  goal: CardGoal;
  progress: CardProgress;
  streak: CardStreak;
  pointsToday: number;
  quickActions: QuickAction[];
  breakdown?: ProgressBreakdown[];
  periodWeek?: PeriodSummary;
  periodMonth?: PeriodSummary;
}

export interface CardGoal {
  type: GoalType;
  target?: number;
  unit?: string;
  timeWindowEnd?: string;
}

export interface CardProgress {
  value: number;
  unit?: string;
  met: boolean;
  percentage: number;
}

export interface CardStreak {
  current: number;
  best: number;
}

export interface QuickAction {
  id: string;
  type: "add" | "toggle" | "log";
  label: string;
  amount?: number;
  unit?: string;
  exerciseModality?: ExerciseModality;
}

export interface TodayResponse {
  date: string;
  greeting: string;
  totalPoints: number;
  pointsWeek: number;
  pointsMonth: number;
  cards: TodayCard[];
}

export interface LogFeedback {
  goalMet: boolean;
  pointsEarned: number;
  streakUpdated?: {
    from: number;
    to: number;
  };
  milestone?: {
    day: number;
    bonus: number;
  };
  message: string;
}
