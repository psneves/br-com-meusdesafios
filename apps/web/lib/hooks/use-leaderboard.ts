"use client";

import { useState, useCallback, useEffect } from "react";
import type {
  Period,
  Scope,
  Radius,
  LeaderboardData,
  LeaderboardView,
} from "../types/leaderboard";

interface UseLeaderboardResult {
  data: LeaderboardData | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasNextPage: boolean;
  error: Error | null;
  period: Period;
  scope: Scope;
  radius: Radius;
  view: LeaderboardView;
  setPeriod: (p: Period) => void;
  setScope: (s: Scope) => void;
  setRadius: (r: Radius) => void;
  setView: (v: LeaderboardView) => void;
  refresh: () => void;
  loadMore: () => void;
}

function buildUrl(
  period: Period,
  scope: Scope,
  radius: Radius,
  view: LeaderboardView,
  page: number,
  pageSize: number
): string {
  const params = new URLSearchParams({
    scope,
    period,
    view,
    page: String(page),
    pageSize: String(pageSize),
  });

  if (scope === "nearby") {
    params.set("radius", String(radius));
  }

  return `/api/leaderboards/rank?${params.toString()}`;
}

export function useLeaderboard(): UseLeaderboardResult {
  const [period, setPeriod] = useState<Period>("week");
  const [scope, setScope] = useState<Scope>("friends");
  const [radius, setRadius] = useState<Radius>(50);
  const [view, setView] = useState<LeaderboardView>("standard");
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRank = useCallback(
    async (opts?: { page?: number; append?: boolean }) => {
      const targetPage = opts?.page ?? 1;
      const append = opts?.append ?? false;

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const url = buildUrl(period, scope, radius, view, targetPage, 50);
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch leaderboard");

        const json = await res.json();
        const nextData = json.data as LeaderboardData;

        if (append && view === "all") {
          setData((current) => {
            if (!current?.participantsPage || !nextData.participantsPage) {
              return nextData;
            }

            const seen = new Set(current.participantsPage.items.map((item) => item.user.id));
            const mergedItems = [...current.participantsPage.items];

            for (const item of nextData.participantsPage.items) {
              if (!seen.has(item.user.id)) {
                mergedItems.push(item);
                seen.add(item.user.id);
              }
            }

            return {
              ...nextData,
              participantsPage: {
                ...nextData.participantsPage,
                items: mergedItems,
              },
            };
          });
          return;
        }

        setData(nextData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        if (append) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [period, scope, radius, view]
  );

  useEffect(() => {
    fetchRank({ page: 1, append: false });
  }, [fetchRank]);

  const refresh = useCallback(() => {
    fetchRank({ page: 1, append: false });
  }, [fetchRank]);

  const loadMore = useCallback(() => {
    if (view !== "all") return;
    if (!data?.participantsPage?.hasNext) return;
    if (isLoadingMore) return;

    const nextPage = data.participantsPage.page + 1;
    fetchRank({ page: nextPage, append: true });
  }, [data, fetchRank, isLoadingMore, view]);

  return {
    data,
    isLoading,
    isLoadingMore,
    hasNextPage: data?.participantsPage?.hasNext ?? false,
    error,
    period,
    scope,
    radius,
    view,
    setPeriod,
    setScope,
    setRadius,
    setView,
    refresh,
    loadMore,
  };
}
