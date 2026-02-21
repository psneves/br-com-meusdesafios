import { useState, useCallback, useEffect, useRef } from "react";
import type {
  TodayResponse,
  LogFeedback,
  WeeklySummary,
  MonthlySummary,
} from "@meusdesafios/shared";
import { api } from "../api/client";

/** Format date as YYYY-MM-DD using local timezone (not UTC). */
function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export interface UseTodayResult {
  data: TodayResponse | null;
  weekSummary: WeeklySummary | null;
  monthSummary: MonthlySummary | null;
  isLoading: boolean;
  error: Error | null;
  feedback: LogFeedback | null;
  logQuickAction: (cardId: string, actionId: string) => Promise<void>;
  logValue: (
    cardId: string,
    value: number,
    meta?: Record<string, unknown>
  ) => Promise<void>;
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
        ? `?date=${localDateStr(selectedDate)}`
        : "";

      const [todayData, summaryData] = await Promise.all([
        api.get<TodayResponse>(`/api/trackables/today${params}`),
        api
          .get<{ weekSummary: WeeklySummary | null; monthSummary: MonthlySummary | null }>(
            `/api/trackables/summary${params}`
          )
          .catch(() => null),
      ]);

      setData(todayData);

      if (summaryData) {
        setWeekSummary(summaryData.weekSummary ?? null);
        setMonthSummary(summaryData.monthSummary ?? null);
      }

      initialLoadDone.current = true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  // Optimistic update: immediately reflect the log in local state
  const applyOptimisticUpdate = useCallback(
    (cardId: string, value: number) => {
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          cards: prev.cards.map((c) => {
            if (c.userTrackableId !== cardId) return c;
            const newValue = c.progress.value + value;
            const target = c.goal.target ?? 0;
            return {
              ...c,
              progress: {
                ...c.progress,
                value: newValue,
                percentage:
                  target > 0
                    ? Math.min(100, Math.round((newValue / target) * 100))
                    : 0,
                met: target > 0 ? newValue >= target : c.progress.met,
              },
            };
          }),
        };
      });
    },
    []
  );

  // Log with a specific value
  const logValue = useCallback(
    async (
      cardId: string,
      value: number,
      meta?: Record<string, unknown>
    ) => {
      if (!data) return;

      const card = data.cards.find((c) => c.userTrackableId === cardId);
      if (!card) return;

      // Optimistic: update UI immediately
      applyOptimisticUpdate(cardId, value);

      const dateStr = selectedDate ? localDateStr(selectedDate) : undefined;

      try {
        const result = await api.post<{ feedback?: LogFeedback }>(
          "/api/trackables/log",
          {
            userTrackableId: cardId,
            valueNum: value,
            date: dateStr,
            meta,
          }
        );

        if (result.feedback) {
          setFeedback(result.feedback);
        }

        // Reconcile with server state in background
        fetchToday();
      } catch (err) {
        // Revert optimistic update on error
        applyOptimisticUpdate(cardId, -value);
        setError(err instanceof Error ? err : new Error("Erro ao registar"));
      }
    },
    [data, selectedDate, fetchToday, applyOptimisticUpdate]
  );

  const logQuickAction = useCallback(
    async (cardId: string, actionId: string) => {
      if (!data) return;

      const card = data.cards.find((c) => c.userTrackableId === cardId);
      if (!card) return;

      // Check for custom action IDs (from modals)
      if (actionId.startsWith("water-custom-")) {
        const amount = parseInt(actionId.replace("water-custom-", ""), 10);
        if (!Number.isNaN(amount)) {
          await logValue(cardId, amount);
          return;
        }
      }

      if (actionId.startsWith("diet-meal-delta-")) {
        const delta = parseInt(actionId.replace("diet-meal-delta-", ""), 10);
        if (!Number.isNaN(delta)) {
          await logValue(cardId, delta);
          return;
        }
      }

      if (actionId.startsWith("activity-log-")) {
        const val = parseFloat(actionId.replace("activity-log-", ""));
        if (!Number.isNaN(val)) {
          await logValue(cardId, val);
          return;
        }
      }

      // exercise-{MODALITY}-{minutes}
      if (actionId.startsWith("exercise-")) {
        const parts = actionId.split("-");
        const minutes = parseFloat(parts[parts.length - 1]);
        if (!Number.isNaN(minutes)) {
          const modality = parts.slice(1, -1).join("-").toUpperCase();
          await logValue(cardId, minutes, { exerciseModality: modality });
          return;
        }
      }

      if (actionId === "sleep-log") {
        await logValue(cardId, 1);
        return;
      }

      const action = card.quickActions.find((a) => a.id === actionId);
      if (!action?.amount) return;

      const meta = action.exerciseModality
        ? { exerciseModality: action.exerciseModality }
        : undefined;
      await logValue(cardId, action.amount, meta);
    },
    [data, logValue]
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
