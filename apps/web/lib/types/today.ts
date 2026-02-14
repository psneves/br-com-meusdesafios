import type { TrackableCategory, GoalType } from "@meusdesafios/shared";

export interface PeriodSummary {
  value: number;
  unit?: string;
  count: number; // number of days with logs
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
  period7d?: PeriodSummary;
  period30d?: PeriodSummary;
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
}

export interface TodayResponse {
  date: string;
  greeting: string;
  totalPoints: number;
  points30d: number;
  bestStreak: number;
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
