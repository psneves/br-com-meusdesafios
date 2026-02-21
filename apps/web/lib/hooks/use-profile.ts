"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { ProfileData, UpdateProfileInput } from "@meusdesafios/shared";

export type { ProfileData, UpdateProfileInput } from "@meusdesafios/shared";

interface UseProfileResult {
  profile: ProfileData | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  updateProfile: (input: UpdateProfileInput) => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<boolean>;
  isUploadingAvatar: boolean;
  checkHandle: (handle: string) => void;
  handleAvailable: boolean | null;
  isCheckingHandle: boolean;
  refresh: () => Promise<void>;
}

export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
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

  const uploadAvatar = useCallback(
    async (file: File): Promise<boolean> => {
      setIsUploadingAvatar(true);
      setError(null);
      try {
        const dataUri = await resizeAndEncode(file, 256);
        const res = await fetch("/api/profile/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: dataUri }),
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error?.message || "Erro ao enviar imagem");
          return false;
        }
        setProfile((prev) =>
          prev ? { ...prev, avatarUrl: json.data.avatarUrl } : prev
        );
        return true;
      } catch {
        setError("Erro ao enviar imagem");
        return false;
      } finally {
        setIsUploadingAvatar(false);
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

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return {
    profile,
    isLoading,
    isSaving,
    error,
    updateProfile: updateProfileFn,
    uploadAvatar,
    isUploadingAvatar,
    checkHandle,
    handleAvailable,
    isCheckingHandle,
    refresh: fetchProfile,
  };
}

function resizeAndEncode(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new globalThis.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = maxSize;
      canvas.height = maxSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      // Center-crop: take the largest square from the center
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, maxSize, maxSize);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}
