import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { TrackableCategory } from "@meusdesafios/shared";
import { api } from "../api/client";

export interface ChallengeSetting {
  active: boolean;
  target: number;
}

export type ChallengeSettings = Record<TrackableCategory, ChallengeSetting>;

const DEFAULTS: ChallengeSettings = {
  WATER: { active: true, target: 2500 },
  DIET_CONTROL: { active: true, target: 5 },
  PHYSICAL_EXERCISE: { active: true, target: 60 },
  SLEEP: { active: true, target: 420 },
};

interface SettingsState {
  settings: ChallengeSettings;
  hydrated: boolean;
  toggleActive: (category: TrackableCategory) => void;
  updateTarget: (category: TrackableCategory, target: number) => void;
  syncFromServer: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULTS,
      hydrated: false,

      toggleActive: (category: TrackableCategory) => {
        set((state) => ({
          settings: {
            ...state.settings,
            [category]: {
              ...state.settings[category],
              active: !state.settings[category].active,
            },
          },
        }));
        api.put("/api/trackables/active", { category }).catch(() => {});
      },

      updateTarget: (category: TrackableCategory, target: number) => {
        set((state) => ({
          settings: {
            ...state.settings,
            [category]: { ...state.settings[category], target },
          },
        }));
        api.put("/api/trackables/goal", { category, target }).catch(() => {});
      },

      syncFromServer: async () => {
        try {
          const data = await api.get<{
            settings: Array<{
              category: string;
              isActive: boolean;
              target: number;
            }>;
          }>("/api/trackables/settings");

          if (!data?.settings) return;

          const current = get().settings;
          const merged = { ...current };

          for (const item of data.settings) {
            const cat = item.category as TrackableCategory;
            if (merged[cat]) {
              merged[cat] = { active: item.isActive, target: item.target };
            }
          }

          set({ settings: merged, hydrated: true });
        } catch {
          set({ hydrated: true });
        }
      },
    }),
    {
      name: "challenge-settings",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrated = true;
          state.syncFromServer();
        }
      },
    }
  )
);
