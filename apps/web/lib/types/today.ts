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

export interface WeekDayStatus {
  date: string;        // "2026-02-10"
  dayOfMonth: number;  // 10
  metCount: number;    // how many challenges met (0-4)
  total: number;       // total challenges (4)
  isSelected: boolean; // currently viewed date
  isFuture: boolean;   // after today
}

export interface WeekChallengeSummary {
  category: TrackableCategory;
  name: string;
  icon: string;
  daysMet: boolean[];  // length-7, Mon=0..Sun=6
  metCount: number;    // total days met
  totalDays: number;   // days with data (excludes future)
}

export interface WeeklySummary {
  days: WeekDayStatus[];             // always 7 entries, Mon-Sun
  challenges: WeekChallengeSummary[];
  totalXP: number;
  percentMet: number;    // overall % of individual goals met
  perfectDays: number;   // days where ALL challenges were met
  totalDone: number;     // total individual goals met
  bestStreak: number;    // longest streak of perfect days in the week
}

export interface MonthChallengeSummary {
  category: TrackableCategory;
  name: string;
  icon: string;
  daysMet: boolean[];   // length = daysInMonth, index 0 = day 1
  metCount: number;
  totalDays: number;    // days with data (excludes future)
  percentMet: number;   // 0-100
}

export interface MonthlySummary {
  year: number;
  month: number;                        // 0-indexed (JS Date convention)
  daysInMonth: number;
  futureDayStart: number;               // 1-indexed: first future day (or daysInMonth+1 if none)
  selectedDay: number;                  // 1-indexed
  challenges: MonthChallengeSummary[];
  perfectDays: number;                  // days where ALL challenges were met
  percentMet: number;                   // overall % of individual goals met
  totalDone: number;                    // total individual goals met
  bestStreak: number;                   // longest streak of perfect days
  totalXP: number;
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
