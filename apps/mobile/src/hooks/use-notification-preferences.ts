import { useState, useCallback, useEffect } from "react";
import { api } from "../api/client";

export interface NotificationPreferences {
  dailyReminderEnabled: boolean;
  reminderTimeLocal: string | null;
  timezone: string | null;
}

export interface UseNotificationPreferencesResult {
  prefs: NotificationPreferences | null;
  isLoading: boolean;
  isSaving: boolean;
  update: (input: Partial<NotificationPreferences>) => Promise<void>;
  refresh: () => Promise<void>;
}

const DEFAULTS: NotificationPreferences = {
  dailyReminderEnabled: true,
  reminderTimeLocal: null,
  timezone: null,
};

export function useNotificationPreferences(): UseNotificationPreferencesResult {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPrefs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get<NotificationPreferences>(
        "/api/notifications/preferences"
      );
      setPrefs(data ?? DEFAULTS);
    } catch {
      setPrefs(DEFAULTS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrefs();
  }, [fetchPrefs]);

  const update = useCallback(
    async (input: Partial<NotificationPreferences>) => {
      const current = prefs ?? DEFAULTS;
      const merged = { ...current, ...input };

      // Optimistic update
      setPrefs(merged);
      setIsSaving(true);

      try {
        // Auto-detect timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const result = await api.put<NotificationPreferences>(
          "/api/notifications/preferences",
          { ...merged, timezone }
        );
        setPrefs(result);
      } catch {
        // Revert on error
        setPrefs(current);
      } finally {
        setIsSaving(false);
      }
    },
    [prefs]
  );

  return { prefs, isLoading, isSaving, update, refresh: fetchPrefs };
}
