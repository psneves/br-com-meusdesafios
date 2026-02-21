import { getDataSource, UserNotificationPreference } from "@meusdesafios/db";

interface NotificationPrefs {
  dailyReminderEnabled: boolean;
  reminderTimeLocal: string | null;
  timezone: string | null;
}

const DEFAULTS: NotificationPrefs = {
  dailyReminderEnabled: true,
  reminderTimeLocal: null,
  timezone: null,
};

export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPrefs> {
  const ds = await getDataSource();
  const repo = ds.getRepository(UserNotificationPreference);

  const pref = await repo.findOne({ where: { userId } });
  if (!pref) return DEFAULTS;

  return {
    dailyReminderEnabled: pref.dailyReminderEnabled,
    reminderTimeLocal: pref.reminderTimeLocal,
    timezone: pref.timezone,
  };
}

export async function upsertNotificationPreferences(
  userId: string,
  input: Partial<NotificationPrefs>
): Promise<NotificationPrefs> {
  const ds = await getDataSource();
  const repo = ds.getRepository(UserNotificationPreference);

  let pref = await repo.findOne({ where: { userId } });

  if (pref) {
    if (input.dailyReminderEnabled !== undefined) {
      pref.dailyReminderEnabled = input.dailyReminderEnabled;
    }
    if (input.reminderTimeLocal !== undefined) {
      pref.reminderTimeLocal = input.reminderTimeLocal;
    }
    if (input.timezone !== undefined) {
      pref.timezone = input.timezone;
    }
    await repo.save(pref);
  } else {
    pref = repo.create({
      userId,
      dailyReminderEnabled: input.dailyReminderEnabled ?? DEFAULTS.dailyReminderEnabled,
      reminderTimeLocal: input.reminderTimeLocal ?? DEFAULTS.reminderTimeLocal,
      timezone: input.timezone ?? DEFAULTS.timezone,
    });
    await repo.save(pref);
  }

  return {
    dailyReminderEnabled: pref.dailyReminderEnabled,
    reminderTimeLocal: pref.reminderTimeLocal,
    timezone: pref.timezone,
  };
}
