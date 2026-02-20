"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { TodayResponse, LogFeedback, WeeklySummary, MonthlySummary } from "../types/today";

interface UseTodayResult {
  data: TodayResponse | null;
  weekSummary: WeeklySummary | null;
  monthSummary: MonthlySummary | null;
  isLoading: boolean;
  error: Error | null;
  feedback: LogFeedback | null;
  logQuickAction: (cardId: string, actionId: string) => Promise<void>;
  logValue: (cardId: string, value: number, meta?: Record<string, unknown>) => Promise<void>;
  clearFeedback: () => void;
  refresh: () => Promise<void>;
}

export function useToday(selectedDate?: Date): UseTodayResult {
  const [data, setData] = useState<TodayResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [feedback, setFeedback] = useState<LogFeedback | null>(null);
  const [weekSummary, setWeekSummary] = useState<WeeklySummary | null>(null);
  const [monthSummary, setMonthSummary] = useState<MonthlySummary | null>(null);
  const initialLoadDone = useRef(false);

  const fetchToday = useCallback(async () => {
    const isInitial = !initialLoadDone.current;
    if (isInitial) setIsLoading(true);
    setError(null);

    try {
      const params = selectedDate
        ? `?date=${selectedDate.toISOString().slice(0, 10)}`
        : "";

      const [todayRes, summaryRes] = await Promise.all([
        fetch(`/api/trackables/today${params}`),
        fetch(`/api/trackables/summary${params}`),
      ]);

      if (!todayRes.ok) throw new Error("Failed to fetch today data");
      const todayJson = await todayRes.json();
      setData(todayJson.data);

      if (summaryRes.ok) {
        const summaryJson = await summaryRes.json();
        setWeekSummary(summaryJson.data.weekSummary ?? null);
        setMonthSummary(summaryJson.data.monthSummary ?? null);
      }

      initialLoadDone.current = true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  // Log with a specific value (for modals)
  const logValue = useCallback(
    async (cardId: string, value: number, meta?: Record<string, unknown>) => {
      if (!data) return;

      const card = data.cards.find((c) => c.userTrackableId === cardId);
      if (!card) return;

      const dateStr = selectedDate
        ? selectedDate.toISOString().slice(0, 10)
        : undefined;

      try {
        const response = await fetch("/api/trackables/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userTrackableId: cardId,
            valueNum: value,
            date: dateStr,
            meta,
          }),
        });

        if (!response.ok) throw new Error("Erro ao registar");

        const json = await response.json();
        if (json.data.feedback) {
          setFeedback(json.data.feedback);
        }

        await fetchToday();
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Erro ao registar"));
      }
    },
    [data, selectedDate, fetchToday]
  );

  const logQuickAction = useCallback(
    async (cardId: string, actionId: string) => {
      if (!data) return;

      const card = data.cards.find((c) => c.userTrackableId === cardId);
      if (!card) return;

      // Check for custom action IDs (from modals)
      if (actionId.startsWith("water-custom-")) {
        const amount = parseInt(actionId.replace("water-custom-", ""), 10);
        if (!isNaN(amount)) {
          await logValue(cardId, amount);
          return;
        }
      }

      if (actionId.startsWith("diet-meal-delta-")) {
        const delta = parseInt(actionId.replace("diet-meal-delta-", ""), 10);
        if (!isNaN(delta)) {
          await logValue(cardId, delta);
          return;
        }
      }

      if (actionId.startsWith("activity-log-")) {
        const value = parseFloat(actionId.replace("activity-log-", ""));
        if (!isNaN(value)) {
          await logValue(cardId, value);
          return;
        }
      }

      // exercise-{MODALITY}-{minutes} from ExerciseCompactActions
      if (actionId.startsWith("exercise-")) {
        const parts = actionId.split("-");
        const minutes = parseFloat(parts[parts.length - 1]);
        if (!isNaN(minutes)) {
          const modality = parts.slice(1, -1).join("-").toUpperCase();
          await logValue(cardId, minutes, { exerciseModality: modality });
          return;
        }
      }

      if (actionId === "sleep-log") {
        // For sleep, just mark as completed
        await logValue(cardId, 1);
        return;
      }

      const action = card.quickActions.find((a) => a.id === actionId);
      if (!action) return;

      const dateStr = selectedDate
        ? selectedDate.toISOString().slice(0, 10)
        : undefined;

      try {
        const response = await fetch("/api/trackables/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userTrackableId: cardId,
            valueNum: action.amount,
            date: dateStr,
            meta: action.exerciseModality
              ? { exerciseModality: action.exerciseModality }
              : undefined,
          }),
        });

        if (!response.ok) throw new Error("Failed to log action");

        const json = await response.json();
        if (json.data.feedback) {
          setFeedback(json.data.feedback);
        }

        await fetchToday();
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Erro ao registar"));
      }
    },
    [data, selectedDate, fetchToday, logValue]
  );

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  return {
    data,
    weekSummary,
    monthSummary,
    isLoading,
    error,
    feedback,
    logQuickAction,
    logValue,
    clearFeedback,
    refresh: fetchToday,
  };
}
