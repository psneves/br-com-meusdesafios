import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";
import type { SessionUser } from "@meusdesafios/shared";
import { api, AuthError, NetworkError } from "../api/client";

const DEVICE_ID_KEY = "meusdesafios_device_id";

async function getDeviceId(): Promise<string> {
  let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = Crypto.randomUUID();
    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

interface AuthState {
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithGoogle: (idToken: string) => Promise<void>;
  loginWithApple: (
    identityToken: string,
    fullName?: string,
    email?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  restoreSession: () => Promise<void>;
  setDateOfBirth: (dob: string) => void;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: SessionUser;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  loginWithGoogle: async (idToken: string) => {
    const deviceId = await getDeviceId();
    const data = await api.post<AuthResponse>("/api/mobile/auth/google", {
      idToken,
      deviceId,
      platform: Platform.OS,
    });
    await api.setTokens(data.accessToken, data.refreshToken);
    set({ user: data.user, isAuthenticated: true });
  },

  loginWithApple: async (
    identityToken: string,
    fullName?: string,
    email?: string
  ) => {
    const deviceId = await getDeviceId();
    const data = await api.post<AuthResponse>("/api/mobile/auth/apple", {
      identityToken,
      deviceId,
      platform: Platform.OS,
      fullName,
      email,
    });
    await api.setTokens(data.accessToken, data.refreshToken);
    set({ user: data.user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await api.post("/api/mobile/auth/logout", {});
    } catch {
      // Ignore errors — still clear local state
    }
    await api.clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    try {
      const user = await api.get<SessionUser>("/api/mobile/auth/me");
      set({ user, isAuthenticated: true });
    } catch (err) {
      if (err instanceof AuthError) {
        await api.clearTokens();
        set({ user: null, isAuthenticated: false });
      }
    }
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const hasTokens = await api.init();
      if (!hasTokens) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }
      const user = await api.get<SessionUser>("/api/mobile/auth/me");
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      if (err instanceof NetworkError) {
        // Network error — keep tokens, assume offline
        set({ isLoading: false });
      } else {
        // Auth error or other — clear tokens
        await api.clearTokens();
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    }
  },

  setDateOfBirth: (dob: string) => {
    set((state) => ({
      user: state.user ? { ...state.user, dateOfBirth: dob } : null,
    }));
  },
}));
