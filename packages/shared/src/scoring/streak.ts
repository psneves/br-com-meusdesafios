import type { Streak, ScoringConfig } from "../types";

export interface StreakUpdateResult {
  newStreak: number;
  bestStreak: number;
  bonusAwarded?: number;
  milestoneReached?: number;
}

/** Compare two dates by local year/month/day only (timezone-safe). */
function sameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function updateStreak(
  currentStreak: Streak,
  metGoalToday: boolean,
  today: Date,
  scoring: ScoringConfig
): StreakUpdateResult {
  const lastMetDay = currentStreak.lastMetDay;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if last met day was yesterday (streak continues)
  const isConsecutive = lastMetDay && sameLocalDay(lastMetDay, yesterday);

  let newStreak: number;

  if (!metGoalToday) {
    // Did not meet goal today - streak breaks
    newStreak = 0;
  } else if (isConsecutive) {
    // Consecutive day - increment streak
    newStreak = currentStreak.currentStreak + 1;
  } else {
    // Met goal but not consecutive - start new streak
    newStreak = 1;
  }

  const bestStreak = Math.max(newStreak, currentStreak.bestStreak);

  // Check for milestone bonus
  const milestone = scoring.streakBonuses.find(
    (bonus) => bonus.day === newStreak
  );

  return {
    newStreak,
    bestStreak,
    bonusAwarded: milestone?.points,
    milestoneReached: milestone?.day,
  };
}

export function calculateStreakBonus(
  streakDay: number,
  scoring: ScoringConfig
): number {
  const milestone = scoring.streakBonuses.find(
    (bonus) => bonus.day === streakDay
  );
  return milestone?.points ?? 0;
}
