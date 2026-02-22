import { useState, useCallback, useEffect, useRef } from "react";
import type { WeeklySummary, MonthlySummary } from "@meusdesafios/shared";
import { api } from "../api/client";

/** Format date as YYYY-MM-DD using local timezone (not UTC). */
function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface SummaryResult {
  weekSummary: WeeklySummary | null;
  monthSummary: MonthlySummary | null;
  isLoading: boolean;
}

/**
 * Fetches weekly + monthly summary for an arbitrary date.
 * Used for navigating to past weeks/months independently.
 */
export function useSummary(date: Date): SummaryResult {
  const dateKey = localDateStr(date);
  const [weekSummary, setWeekSummary] = useState<WeeklySummary | null>(null);
  const [monthSummary, setMonthSummary] = useState<MonthlySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const cache = useRef<Map<string, { week: WeeklySummary | null; month: MonthlySummary | null }>>(new Map());

  const fetchSummary = useCallback(async () => {
    const cached = cache.current.get(dateKey);
    if (cached) {
      setWeekSummary(cached.week);
      setMonthSummary(cached.month);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.get<{
        weekSummary: WeeklySummary | null;
        monthSummary: MonthlySummary | null;
      }>(`/api/trackables/summary?date=${dateKey}`);

      cache.current.set(dateKey, { week: data.weekSummary, month: data.monthSummary });
      setWeekSummary(data.weekSummary);
      setMonthSummary(data.monthSummary);
    } catch {
      setWeekSummary(null);
      setMonthSummary(null);
    } finally {
      setIsLoading(false);
    }
  }, [dateKey]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { weekSummary, monthSummary, isLoading };
}
