import { useState, useCallback, useRef, useEffect } from "react";
import * as ImageManipulator from "expo-image-manipulator";
import type { ProfileData, UpdateProfileInput } from "@meusdesafios/shared";
import { api } from "../api/client";

export interface UseProfileResult {
  profile: ProfileData | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  updateProfile: (input: UpdateProfileInput) => Promise<boolean>;
  uploadAvatar: (uri: string) => Promise<boolean>;
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
      const data = await api.get<ProfileData>("/api/profile");
      setProfile(data);
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
        const data = await api.patch<ProfileData>("/api/profile", input);
        setProfile(data);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao salvar");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const uploadAvatar = useCallback(async (uri: string): Promise<boolean> => {
    setIsUploadingAvatar(true);
    setError(null);
    try {
      const dataUri = await resizeAndEncode(uri, 256);
      const data = await api.post<{ avatarUrl: string }>(
        "/api/profile/avatar",
        { image: dataUri }
      );
      setProfile((prev) =>
        prev ? { ...prev, avatarUrl: data.avatarUrl } : prev
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar imagem");
      return false;
    } finally {
      setIsUploadingAvatar(false);
    }
  }, []);

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
        const data = await api.get<{ available: boolean }>(
          `/api/profile/check-handle?handle=${encodeURIComponent(handle)}`
        );
        setHandleAvailable(data.available);
      } catch {
        setHandleAvailable(null);
      } finally {
        setIsCheckingHandle(false);
      }
    }, 400);
  }, []);

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

async function resizeAndEncode(
  uri: string,
  maxSize: number
): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: maxSize, height: maxSize } }],
    {
      compress: 0.85,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    }
  );
  return `data:image/jpeg;base64,${result.base64}`;
}
