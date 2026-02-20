"use client";

import { useState, useEffect, useCallback } from "react";
import type { TrackableCategory } from "@meusdesafios/shared";

export interface ChallengeSetting {
  active: boolean;
  target: number; // base unit: ml, refeições, min, min
}

export type ChallengeSettings = Record<TrackableCategory, ChallengeSetting>;

const STORAGE_KEY = "challenge-settings";

const DEFAULTS: ChallengeSettings = {
  WATER: { active: true, target: 2500 },
  DIET_CONTROL: { active: true, target: 5 },
  PHYSICAL_EXERCISE: { active: true, target: 60 },
  SLEEP: { active: true, target: 420 },
};

function loadSettings(): ChallengeSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<ChallengeSettings>;
    // Merge with defaults so new categories always have a value
    return {
      WATER: { ...DEFAULTS.WATER, ...parsed.WATER },
      DIET_CONTROL: { ...DEFAULTS.DIET_CONTROL, ...parsed.DIET_CONTROL },
      PHYSICAL_EXERCISE: { ...DEFAULTS.PHYSICAL_EXERCISE, ...parsed.PHYSICAL_EXERCISE },
      SLEEP: { ...DEFAULTS.SLEEP, ...parsed.SLEEP },
    };
  } catch {
    return DEFAULTS;
  }
}

function saveSettings(settings: ChallengeSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

/** Read challenge settings from localStorage (SSR-safe, returns defaults on server) */
export function getChallengeSettings(): ChallengeSettings {
  return loadSettings();
}

export function useChallengeSettings() {
  const [settings, setSettings] = useState<ChallengeSettings>(DEFAULTS);
  const [mounted, setMounted] = useState(false);

  // Hydrate from DB on mount, fall back to localStorage
  useEffect(() => {
    let aborted = false;
    const localSettings = loadSettings();
    setSettings(localSettings);
    setMounted(true);

    // Fetch all trackable settings (active + inactive) from DB
    fetch("/api/trackables/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (aborted || !json?.data?.settings) return;
        const dbSettings = { ...localSettings };
        for (const item of json.data.settings) {
          const cat = item.category as TrackableCategory;
          if (dbSettings[cat]) {
            dbSettings[cat] = {
              active: item.isActive,
              target: item.target,
            };
          }
        }
        setSettings(dbSettings);
        saveSettings(dbSettings);
      })
      .catch(() => {
        // Keep localStorage values on failure
      });

    return () => { aborted = true; };
  }, []);

  // Persist on change (skip initial mount to avoid writing defaults)
  useEffect(() => {
    if (mounted) {
      saveSettings(settings);
    }
  }, [settings, mounted]);

  // Listen to storage events from other tabs
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        setSettings(loadSettings());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleActive = useCallback((category: TrackableCategory) => {
    setSettings((prev) => ({
      ...prev,
      [category]: { ...prev[category], active: !prev[category].active },
    }));

    // Persist to database
    fetch("/api/trackables/active", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category }),
    }).catch(() => {
      // Silent fail — localStorage is the optimistic fallback
    });
  }, []);

  const updateTarget = useCallback((category: TrackableCategory, target: number) => {
    setSettings((prev) => ({
      ...prev,
      [category]: { ...prev[category], target },
    }));

    // Persist to database
    fetch("/api/trackables/goal", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, target }),
    }).catch(() => {
      // Silent fail — localStorage is the optimistic fallback
    });
  }, []);

  return { settings, mounted, toggleActive, updateTarget };
}
