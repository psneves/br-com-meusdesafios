"use client";

import { useState, useCallback, useEffect } from "react";
import type { Period, Scope, LeaderboardData } from "../types/leaderboard";

interface UseLeaderboardResult {
  data: LeaderboardData | null;
  isLoading: boolean;
  error: Error | null;
  period: Period;
  scope: Scope;
  setPeriod: (p: Period) => void;
  setScope: (s: Scope) => void;
}

export function useLeaderboard(): UseLeaderboardResult {
  const [period, setPeriod] = useState<Period>("week");
  const [scope, setScope] = useState<Scope>("following");
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRank = useCallback(async (p: Period, s: Scope) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/leaderboards/rank?scope=${s}&period=${p}`
      );
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      const json = await res.json();
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRank(period, scope);
  }, [period, scope, fetchRank]);

  return {
    data,
    isLoading,
    error,
    period,
    scope,
    setPeriod,
    setScope,
  };
}
