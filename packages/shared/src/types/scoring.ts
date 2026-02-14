export type PointSource =
  | "trackable_goal"
  | "streak_bonus"
  | "penalty"
  | "admin";

export interface PointsLedgerEntry {
  id: string;
  userId: string;
  day: Date;
  source: PointSource;
  userTrackableId?: string;
  points: number;
  reason: string;
  createdAt: Date;
}

export interface Streak {
  id: string;
  userId: string;
  userTrackableId: string;
  currentStreak: number;
  bestStreak: number;
  lastMetDay?: Date;
  updatedAt: Date;
}

export interface ComputedDailyStats {
  id: string;
  userId: string;
  userTrackableId: string;
  day: Date;
  progress: DailyProgress;
  metGoal: boolean;
  pointsEarned: number;
  updatedAt: Date;
}

export interface DailyProgress {
  total?: number;
  unit?: string;
  checklistMet?: boolean;
  bedtime?: string;
  durationMin?: number;
}

export interface DayEvaluationResult {
  metGoal: boolean;
  progress: DailyProgress;
  pointsEarned: number;
  streakUpdated: boolean;
  newStreak: number;
  bonusAwarded?: number;
}
