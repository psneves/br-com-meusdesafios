"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { ExploreUser, PendingFollowRequest } from "../types/social";

interface FeedbackData {
  message: string;
  variant: "success" | "neutral";
}

interface UseExploreResult {
  pendingRequests: PendingFollowRequest[];
  suggestedUsers: ExploreUser[];
  searchResults: ExploreUser[] | null;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  search: (query: string) => void;
  clearSearch: () => void;
  sendFollowRequest: (handle: string) => Promise<void>;
  acceptRequest: (edgeId: string) => Promise<void>;
  denyRequest: (edgeId: string) => Promise<void>;
  feedback: FeedbackData | null;
  clearFeedback: () => void;
  refresh: () => void;
}

export function useExplore(): UseExploreResult {
  const [pendingRequests, setPendingRequests] = useState<PendingFollowRequest[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<ExploreUser[]>([]);
  const [searchResults, setSearchResults] = useState<ExploreUser[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestQueryRef = useRef<string>("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch initial explore data
  useEffect(() => {
    let cancelled = false;

    async function fetchExplore() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/social/explore");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        if (!cancelled) {
          setPendingRequests(json.data.pendingRequests);
          setSuggestedUsers(json.data.suggestedUsers);
        }
      } catch {
        if (!cancelled) setError("Erro ao carregar dados");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchExplore();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Search with debounce
  const search = useCallback((query: string) => {
    latestQueryRef.current = query;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      const currentQuery = latestQueryRef.current;
      try {
        const res = await fetch(
          `/api/social/search?q=${encodeURIComponent(currentQuery)}`
        );
        if (!res.ok) return;
        const json = await res.json();
        // Only update if this is still the latest query
        if (latestQueryRef.current === currentQuery) {
          setSearchResults(json.data.users);
        }
      } catch {
        // silently fail
      } finally {
        if (latestQueryRef.current === currentQuery) {
          setIsSearching(false);
        }
      }
    }, 300);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const clearSearch = useCallback(() => {
    latestQueryRef.current = "";
    setSearchResults(null);
    setIsSearching(false);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  const sendFollowRequest = useCallback(
    async (handle: string) => {
      try {
        const res = await fetch("/api/social/follow-request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetHandle: handle }),
        });

        if (!res.ok) return;

        // Optimistically update suggested users
        setSuggestedUsers((prev) =>
          prev.map((u) =>
            u.handle === handle ? { ...u, followStatus: "pending" as const } : u
          )
        );

        // Optimistically update search results
        setSearchResults((prev) =>
          prev
            ? prev.map((u) =>
                u.handle === handle
                  ? { ...u, followStatus: "pending" as const }
                  : u
              )
            : null
        );

        setFeedback({ message: "Solicitação enviada", variant: "success" });
      } catch {
        setFeedback({ message: "Erro ao enviar solicitação", variant: "neutral" });
      }
    },
    []
  );

  const acceptRequest = useCallback(async (edgeId: string) => {
    try {
      const res = await fetch(`/api/social/follow-requests/${edgeId}/accept`, {
        method: "POST",
      });
      if (!res.ok) return;

      setPendingRequests((prev) => prev.filter((r) => r.edgeId !== edgeId));
      setFeedback({ message: "Solicitação aceita", variant: "success" });
    } catch {
      setFeedback({ message: "Erro ao aceitar solicitação", variant: "neutral" });
    }
  }, []);

  const denyRequest = useCallback(async (edgeId: string) => {
    try {
      const res = await fetch(`/api/social/follow-requests/${edgeId}/deny`, {
        method: "POST",
      });
      if (!res.ok) return;

      setPendingRequests((prev) => prev.filter((r) => r.edgeId !== edgeId));
      setFeedback({ message: "Solicitação recusada", variant: "neutral" });
    } catch {
      setFeedback({ message: "Erro ao recusar solicitação", variant: "neutral" });
    }
  }, []);

  const clearFeedback = useCallback(() => setFeedback(null), []);

  return {
    pendingRequests,
    suggestedUsers,
    searchResults,
    isLoading,
    isSearching,
    error,
    search,
    clearSearch,
    sendFollowRequest,
    acceptRequest,
    denyRequest,
    feedback,
    clearFeedback,
    refresh,
  };
}
