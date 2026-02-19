"use client";

import { useState, useEffect } from "react";

interface SessionUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

interface UseSessionResult {
  user: SessionUser | null;
  isLoading: boolean;
}

export function useSession(): UseSessionResult {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          setUser(null);
          return;
        }
        const json = await res.json();
        if (!cancelled) {
          setUser(json.data);
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchSession();
    return () => {
      cancelled = true;
    };
  }, []);

  return { user, isLoading };
}
