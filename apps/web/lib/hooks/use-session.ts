"use client";

import { useState, useEffect, useCallback } from "react";
import type { SessionUser } from "@meusdesafios/shared";

export type { SessionUser } from "@meusdesafios/shared";

interface UseSessionResult {
  user: SessionUser | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
}

export function useSession(): UseSessionResult {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        setUser(null);
        return;
      }
      const json = await res.json();
      setUser(json.data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          if (!cancelled) setUser(null);
          return;
        }
        const json = await res.json();
        if (!cancelled) setUser(json.data);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { user, isLoading, refreshSession: fetchSession };
}
