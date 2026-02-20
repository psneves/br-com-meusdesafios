"use client";

import { useState, useCallback, useEffect } from "react";
import type { Period, Scope, Radius, LeaderboardData } from "../types/leaderboard";

interface UseLeaderboardResult {
  data: LeaderboardData | null;
  isLoading: boolean;
  error: Error | null;
  period: Period;
  scope: Scope;
  radius: Radius;
  setPeriod: (p: Period) => void;
  setScope: (s: Scope) => void;
  setRadius: (r: Radius) => void;
  refresh: () => void;
}

export function useLeaderboard(): UseLeaderboardResult {
  const [period, setPeriod] = useState<Period>("week");
  const [scope, setScope] = useState<Scope>("following");
  const [radius, setRadius] = useState<Radius>(50);
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRank = useCallback(async (p: Period, s: Scope, r: Radius) => {
    setIsLoading(true);
    setError(null);
    try {
      let url = `/api/leaderboards/rank?scope=${s}&period=${p}`;
      if (s === "nearby") url += `&radius=${r}`;
      const res = await fetch(url);
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
    fetchRank(period, scope, radius);
  }, [period, scope, radius, fetchRank]);

  const refresh = useCallback(() => {
    fetchRank(period, scope, radius);
  }, [fetchRank, period, scope, radius]);

  return {
    data,
    isLoading,
    error,
    period,
    scope,
    radius,
    setPeriod,
    setScope,
    setRadius,
    refresh,
  };
}
