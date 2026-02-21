import { useState, useCallback, useEffect, useRef } from "react";
import type {
  ExploreUser,
  FriendSummary,
  PendingFollowRequest,
  SentFollowRequest,
} from "@meusdesafios/shared";
import { api } from "../api/client";

interface FeedbackData {
  message: string;
  variant: "success" | "neutral";
}

export interface UseExploreResult {
  pendingRequests: PendingFollowRequest[];
  sentRequests: SentFollowRequest[];
  suggestedUsers: ExploreUser[];
  friends: FriendSummary[];
  searchResults: ExploreUser[] | null;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  search: (query: string) => void;
  clearSearch: () => void;
  sendFollowRequest: (handle: string) => Promise<void>;
  acceptRequest: (edgeId: string) => Promise<void>;
  denyRequest: (edgeId: string) => Promise<void>;
  cancelRequest: (edgeId: string) => Promise<void>;
  unfriend: (userId: string) => Promise<void>;
  feedback: FeedbackData | null;
  clearFeedback: () => void;
  refresh: () => void;
}

export function useExplore(): UseExploreResult {
  const [pendingRequests, setPendingRequests] = useState<PendingFollowRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<SentFollowRequest[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<ExploreUser[]>([]);
  const [friends, setFriends] = useState<FriendSummary[]>([]);
  const [searchResults, setSearchResults] = useState<ExploreUser[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latestQueryRef = useRef<string>("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch initial explore data + friends list
  useEffect(() => {
    let cancelled = false;

    async function fetchExplore() {
      setIsLoading(true);
      setError(null);
      try {
        const [exploreData, friendsData] = await Promise.all([
          api.get<{
            pendingRequests: PendingFollowRequest[];
            sentRequests: SentFollowRequest[];
            suggestedUsers: ExploreUser[];
          }>("/api/social/explore"),
          api
            .get<{ friends: FriendSummary[] }>("/api/social/friends")
            .catch(() => null),
        ]);

        if (!cancelled) {
          setPendingRequests(exploreData.pendingRequests);
          setSentRequests(exploreData.sentRequests ?? []);
          setSuggestedUsers(exploreData.suggestedUsers);
          if (friendsData) {
            setFriends(friendsData.friends);
          }
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
        const data = await api.get<{ users: ExploreUser[] }>(
          `/api/social/search?q=${encodeURIComponent(currentQuery)}`
        );
        if (latestQueryRef.current === currentQuery) {
          setSearchResults(data.users);
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

  const sendFollowRequest = useCallback(async (handle: string) => {
    try {
      await api.post("/api/social/follow-request", { targetHandle: handle });

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

      setFeedback({ message: "Solicitação de amizade enviada", variant: "success" });
    } catch {
      setFeedback({ message: "Erro ao enviar solicitação", variant: "neutral" });
    }
  }, []);

  const acceptRequest = useCallback(async (edgeId: string) => {
    try {
      await api.post(`/api/social/follow-requests/${edgeId}/accept`);
      setPendingRequests((prev) => prev.filter((r) => r.edgeId !== edgeId));
      setFeedback({ message: "Amizade aceita", variant: "success" });
    } catch {
      setFeedback({ message: "Erro ao aceitar solicitação", variant: "neutral" });
    }
  }, []);

  const denyRequest = useCallback(async (edgeId: string) => {
    try {
      await api.post(`/api/social/follow-requests/${edgeId}/deny`);
      setPendingRequests((prev) => prev.filter((r) => r.edgeId !== edgeId));
      setFeedback({ message: "Solicitação recusada", variant: "neutral" });
    } catch {
      setFeedback({ message: "Erro ao recusar solicitação", variant: "neutral" });
    }
  }, []);

  const cancelRequest = useCallback(async (edgeId: string) => {
    try {
      await api.post(`/api/social/follow-requests/${edgeId}/cancel`);
      setSentRequests((prev) => prev.filter((r) => r.edgeId !== edgeId));
      setFeedback({ message: "Solicitação cancelada", variant: "neutral" });
    } catch {
      setFeedback({ message: "Erro ao cancelar solicitação", variant: "neutral" });
    }
  }, []);

  const unfriendUser = useCallback(async (userId: string) => {
    try {
      await api.delete(`/api/social/friends/${userId}`);
      setFriends((prev) => prev.filter((f) => f.id !== userId));
      setFeedback({ message: "Amizade desfeita", variant: "neutral" });
    } catch {
      setFeedback({ message: "Erro ao desfazer amizade", variant: "neutral" });
    }
  }, []);

  const clearFeedback = useCallback(() => setFeedback(null), []);

  return {
    pendingRequests,
    sentRequests,
    suggestedUsers,
    friends,
    searchResults,
    isLoading,
    isSearching,
    error,
    search,
    clearSearch,
    sendFollowRequest,
    acceptRequest,
    denyRequest,
    cancelRequest,
    unfriend: unfriendUser,
    feedback,
    clearFeedback,
    refresh,
  };
}
