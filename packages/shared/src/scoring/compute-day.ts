import type {
  Goal,
  TrackableLog,
  Streak,
  ScoringConfig,
  DayEvaluationResult,
} from "../types";
import { evaluateGoal } from "./evaluate-goal";
import { updateStreak } from "./streak";

export function computeDayResult(
  goal: Goal,
  logs: TrackableLog[],
  currentStreak: Streak,
  scoring: ScoringConfig,
  day: Date
): DayEvaluationResult {
  // 1. Evaluate if goal was met
  const { metGoal, progress } = evaluateGoal(goal, logs);

  // 2. Calculate base points
  let pointsEarned = metGoal ? scoring.basePoints : 0;

  // 3. Update streak
  const streakResult = updateStreak(currentStreak, metGoal, day, scoring);

  // 4. Add bonus if milestone reached
  if (streakResult.bonusAwarded) {
    pointsEarned += streakResult.bonusAwarded;
  }

  return {
    metGoal,
    progress,
    pointsEarned,
    streakUpdated: true,
    newStreak: streakResult.newStreak,
    bonusAwarded: streakResult.bonusAwarded,
  };
}
