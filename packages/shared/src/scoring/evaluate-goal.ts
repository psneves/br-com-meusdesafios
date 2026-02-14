import type { Goal, TrackableLog, DailyProgress } from "../types";

export interface GoalEvaluationResult {
  metGoal: boolean;
  progress: DailyProgress;
}

export function evaluateGoal(
  goal: Goal,
  logs: TrackableLog[]
): GoalEvaluationResult {
  switch (goal.type) {
    case "binary":
      return evaluateBinaryGoal(logs);
    case "target":
      return evaluateTargetGoal(goal, logs);
    case "range":
      return evaluateRangeGoal(goal, logs);
    case "time_window":
      return evaluateTimeWindowGoal(goal, logs);
    default:
      return { metGoal: false, progress: {} };
  }
}

function evaluateBinaryGoal(logs: TrackableLog[]): GoalEvaluationResult {
  const metLog = logs.find(
    (log) => log.valueText === "MET" || log.meta?.checklistMet === true
  );
  return {
    metGoal: !!metLog,
    progress: { checklistMet: !!metLog },
  };
}

function evaluateTargetGoal(
  goal: Goal,
  logs: TrackableLog[]
): GoalEvaluationResult {
  const total = logs.reduce((sum, log) => sum + (log.valueNum ?? 0), 0);
  const target = goal.target ?? 0;

  return {
    metGoal: total >= target,
    progress: {
      total,
      unit: goal.unit,
    },
  };
}

function evaluateRangeGoal(
  goal: Goal,
  logs: TrackableLog[]
): GoalEvaluationResult {
  const total = logs.reduce((sum, log) => sum + (log.valueNum ?? 0), 0);
  const min = goal.min ?? 0;
  const max = goal.max ?? Infinity;

  return {
    metGoal: total >= min && total <= max,
    progress: {
      total,
      unit: goal.unit,
    },
  };
}

function evaluateTimeWindowGoal(
  goal: Goal,
  logs: TrackableLog[]
): GoalEvaluationResult {
  // For sleep: check if bedtime is within window
  const sleepLog = logs.find((log) => log.meta?.bedtime);

  if (!sleepLog || !sleepLog.meta?.bedtime) {
    return { metGoal: false, progress: {} };
  }

  const bedtime = sleepLog.meta.bedtime;
  const targetEnd = goal.timeWindowEnd ?? "23:59";

  // Simple string comparison works for HH:mm format
  const metGoal = bedtime <= targetEnd;

  return {
    metGoal,
    progress: {
      bedtime,
      durationMin: sleepLog.meta.durationMin,
    },
  };
}
