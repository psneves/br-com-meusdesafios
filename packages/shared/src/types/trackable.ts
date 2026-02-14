export type TrackableCategory =
  | "RUN"
  | "BIKE"
  | "SWIM"
  | "GYM"
  | "SLEEP"
  | "DIET"
  | "WATER";

export type GoalType = "binary" | "target" | "range" | "time_window";

export type ScheduleType = "daily" | "weekly";

export interface Goal {
  type: GoalType;
  target?: number;
  min?: number;
  max?: number;
  unit?: string;
  timeWindowStart?: string; // HH:mm format
  timeWindowEnd?: string; // HH:mm format
}

export interface Schedule {
  type: ScheduleType;
  timezone: string;
  activeDays?: number[]; // 0-6 for weekly, Sunday = 0
}

export interface TrackableTemplate {
  id: string;
  code: string;
  name: string;
  category: TrackableCategory;
  defaultGoal: Goal;
  defaultScoring: ScoringConfig;
}

export interface UserTrackable {
  id: string;
  userId: string;
  templateId: string;
  goal: Goal;
  schedule: Schedule;
  scoring: ScoringConfig;
  isActive: boolean;
  startDate: Date;
}

export interface ScoringConfig {
  basePoints: number;
  streakBonuses: StreakBonus[];
}

export interface StreakBonus {
  day: number;
  points: number;
}

export const DEFAULT_SCORING: ScoringConfig = {
  basePoints: 10,
  streakBonuses: [
    { day: 3, points: 5 },
    { day: 7, points: 10 },
    { day: 14, points: 20 },
    { day: 30, points: 50 },
  ],
};
