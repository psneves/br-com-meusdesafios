"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface ProfileData {
  id: string;
  handle: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
}

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
  handle: string;
}

interface UseProfileResult {
  profile: ProfileData | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  updateProfile: (input: UpdateProfileInput) => Promise<boolean>;
  checkHandle: (handle: string) => void;
  handleAvailable: boolean | null;
  isCheckingHandle: boolean;
  refresh: () => Promise<void>;
}

export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  const [isCheckingHandle, setIsCheckingHandle] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) {
        setProfile(null);
        return;
      }
      const json = await res.json();
      setProfile(json.data);
    } catch {
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfileFn = useCallback(
    async (input: UpdateProfileInput): Promise<boolean> => {
      setIsSaving(true);
      setError(null);
      try {
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error?.message || "Erro ao salvar");
          return false;
        }
        setProfile(json.data);
        return true;
      } catch {
        setError("Erro ao salvar");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const checkHandle = useCallback((handle: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (handle.length < 3) {
      setHandleAvailable(null);
      setIsCheckingHandle(false);
      return;
    }
    setIsCheckingHandle(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/profile/check-handle?handle=${encodeURIComponent(handle)}`
        );
        if (res.ok) {
          const json = await res.json();
          setHandleAvailable(json.data.available);
        }
      } catch {
        setHandleAvailable(null);
      } finally {
        setIsCheckingHandle(false);
      }
    }, 400);
  }, []);

  return {
    profile,
    isLoading,
    isSaving,
    error,
    updateProfile: updateProfileFn,
    checkHandle,
    handleAvailable,
    isCheckingHandle,
    refresh: fetchProfile,
  };
}
