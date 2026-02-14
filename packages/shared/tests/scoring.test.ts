import { describe, it, expect } from "vitest";
import {
  evaluateGoal,
  updateStreak,
  computeDayResult,
} from "../src/scoring";
import type { Goal, TrackableLog, Streak, ScoringConfig } from "../src/types";
import { DEFAULT_SCORING } from "../src/types/trackable";

const createLog = (overrides: Partial<TrackableLog> = {}): TrackableLog => ({
  id: "log-1",
  userId: "user-1",
  userTrackableId: "ut-1",
  occurredAt: new Date(),
  createdAt: new Date(),
  ...overrides,
});

const createStreak = (overrides: Partial<Streak> = {}): Streak => ({
  id: "streak-1",
  userId: "user-1",
  userTrackableId: "ut-1",
  currentStreak: 0,
  bestStreak: 0,
  updatedAt: new Date(),
  ...overrides,
});

describe("evaluateGoal", () => {
  describe("binary goals", () => {
    const binaryGoal: Goal = { type: "binary" };

    it("returns metGoal=true when log has valueText=MET", () => {
      const logs = [createLog({ valueText: "MET" })];
      const result = evaluateGoal(binaryGoal, logs);
      expect(result.metGoal).toBe(true);
    });

    it("returns metGoal=false when no MET log", () => {
      const logs = [createLog({ valueText: "NOT_MET" })];
      const result = evaluateGoal(binaryGoal, logs);
      expect(result.metGoal).toBe(false);
    });

    it("returns metGoal=false with empty logs", () => {
      const result = evaluateGoal(binaryGoal, []);
      expect(result.metGoal).toBe(false);
    });
  });

  describe("target goals", () => {
    const waterGoal: Goal = { type: "target", target: 2500, unit: "ml" };

    it("returns metGoal=true when total meets target", () => {
      const logs = [
        createLog({ valueNum: 500 }),
        createLog({ valueNum: 1000 }),
        createLog({ valueNum: 1000 }),
      ];
      const result = evaluateGoal(waterGoal, logs);
      expect(result.metGoal).toBe(true);
      expect(result.progress.total).toBe(2500);
    });

    it("returns metGoal=true when total exceeds target", () => {
      const logs = [createLog({ valueNum: 3000 })];
      const result = evaluateGoal(waterGoal, logs);
      expect(result.metGoal).toBe(true);
    });

    it("returns metGoal=false when total below target", () => {
      const logs = [createLog({ valueNum: 1500 })];
      const result = evaluateGoal(waterGoal, logs);
      expect(result.metGoal).toBe(false);
      expect(result.progress.total).toBe(1500);
    });
  });

  describe("range goals", () => {
    const calorieGoal: Goal = { type: "range", min: 1800, max: 2200, unit: "kcal" };

    it("returns metGoal=true when within range", () => {
      const logs = [createLog({ valueNum: 2000 })];
      const result = evaluateGoal(calorieGoal, logs);
      expect(result.metGoal).toBe(true);
    });

    it("returns metGoal=false when below min", () => {
      const logs = [createLog({ valueNum: 1500 })];
      const result = evaluateGoal(calorieGoal, logs);
      expect(result.metGoal).toBe(false);
    });

    it("returns metGoal=false when above max", () => {
      const logs = [createLog({ valueNum: 2500 })];
      const result = evaluateGoal(calorieGoal, logs);
      expect(result.metGoal).toBe(false);
    });
  });

  describe("time_window goals (sleep)", () => {
    const sleepGoal: Goal = { type: "time_window", timeWindowEnd: "23:00" };

    it("returns metGoal=true when bedtime before target", () => {
      const logs = [createLog({ meta: { bedtime: "22:30", durationMin: 420 } })];
      const result = evaluateGoal(sleepGoal, logs);
      expect(result.metGoal).toBe(true);
      expect(result.progress.bedtime).toBe("22:30");
    });

    it("returns metGoal=false when bedtime after target", () => {
      const logs = [createLog({ meta: { bedtime: "23:30", durationMin: 420 } })];
      const result = evaluateGoal(sleepGoal, logs);
      expect(result.metGoal).toBe(false);
    });
  });
});

describe("updateStreak", () => {
  const today = new Date("2024-01-15");
  const yesterday = new Date("2024-01-14");

  it("starts new streak when meeting goal with no previous streak", () => {
    const streak = createStreak({ currentStreak: 0, lastMetDay: undefined });
    const result = updateStreak(streak, true, today, DEFAULT_SCORING);
    expect(result.newStreak).toBe(1);
  });

  it("increments streak when consecutive day met", () => {
    const streak = createStreak({ currentStreak: 2, lastMetDay: yesterday });
    const result = updateStreak(streak, true, today, DEFAULT_SCORING);
    expect(result.newStreak).toBe(3);
  });

  it("awards bonus on day 3", () => {
    const streak = createStreak({ currentStreak: 2, lastMetDay: yesterday });
    const result = updateStreak(streak, true, today, DEFAULT_SCORING);
    expect(result.bonusAwarded).toBe(5);
    expect(result.milestoneReached).toBe(3);
  });

  it("resets streak when goal not met", () => {
    const streak = createStreak({ currentStreak: 5, lastMetDay: yesterday });
    const result = updateStreak(streak, false, today, DEFAULT_SCORING);
    expect(result.newStreak).toBe(0);
  });

  it("updates best streak when current exceeds best", () => {
    const streak = createStreak({ currentStreak: 6, bestStreak: 5, lastMetDay: yesterday });
    const result = updateStreak(streak, true, today, DEFAULT_SCORING);
    expect(result.bestStreak).toBe(7);
  });
});

describe("computeDayResult", () => {
  const goal: Goal = { type: "target", target: 2500, unit: "ml" };
  const today = new Date("2024-01-15");
  const yesterday = new Date("2024-01-14");

  it("computes full day result with points and streak", () => {
    const logs = [createLog({ valueNum: 2500 })];
    const streak = createStreak({ currentStreak: 2, lastMetDay: yesterday });

    const result = computeDayResult(goal, logs, streak, DEFAULT_SCORING, today);

    expect(result.metGoal).toBe(true);
    expect(result.pointsEarned).toBe(15); // 10 base + 5 day-3 bonus
    expect(result.newStreak).toBe(3);
    expect(result.bonusAwarded).toBe(5);
  });

  it("returns zero points when goal not met", () => {
    const logs = [createLog({ valueNum: 1000 })];
    const streak = createStreak({ currentStreak: 5, lastMetDay: yesterday });

    const result = computeDayResult(goal, logs, streak, DEFAULT_SCORING, today);

    expect(result.metGoal).toBe(false);
    expect(result.pointsEarned).toBe(0);
    expect(result.newStreak).toBe(0);
  });
});
