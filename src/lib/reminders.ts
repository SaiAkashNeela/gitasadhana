import * as Notifications from "expo-notifications";

import { localizedReminders } from "@/i18n/reminders";

import { getReminderConfig, hasCompletedOnboarding, lastReadVerse, saveReminderConfig } from "./reminders-config";
import { storage } from "./storage";

export * from "./reminders-config";

const IDS = ["gita-daily", "gita-continue", "gita-streak"] as const;
const CHANNEL = "daily-reminders";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const remindersSupported = true;

export async function hasNotificationPermission() {
  const status = await Notifications.getPermissionsAsync();
  return status.granted;
}

async function ensurePermission() {
  if (!hasCompletedOnboarding()) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const req = await Notifications.requestPermissionsAsync();
  storage.set("gita_notifications_permission_closed", req.granted ? "false" : "true");
  return req.granted;
}

export async function cancelDailyReminder() {
  await Promise.all(IDS.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})));
}

/**
 * Daily reminder at the chosen time, "continue reading" 2h later and a streak nudge
 * 6h later — the same three reminders the Capacitor app scheduled.
 */
export async function scheduleDailyReminder(time: string): Promise<boolean> {
  if (!hasCompletedOnboarding()) return false;
  await cancelDailyReminder();
  if (!(await ensurePermission())) return false;

  const [hour, minute] = time.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return false;

  if (process.env.EXPO_OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: "Daily reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const lang = storage.getString("gita_language") || "en";
  const dict = localizedReminders[lang] ?? localizedReminders.en;
  const last = lastReadVerse();

  const items = [
    { id: IDS[0], title: dict.dailyTitle, body: dict.dailyBody, offset: 0, path: "/notifications" },
    { id: IDS[1], title: dict.continueTitle, body: dict.continueBody.replace("{verse}", last), offset: 2, path: `/verse/${last}` },
    { id: IDS[2], title: dict.streakTitle, body: dict.streakBody, offset: 6, path: "/journey" },
  ];

  for (const item of items) {
    await Notifications.scheduleNotificationAsync({
      identifier: item.id,
      content: { title: item.title, body: item.body, sound: "default", data: { path: item.path } },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: (hour + item.offset) % 24,
        minute,
        channelId: CHANNEL,
      },
    });
  }
  return true;
}

export async function updateReminderSettings(enabled: boolean, time: string) {
  saveReminderConfig({ enabled, time });
  if (!enabled) {
    await cancelDailyReminder();
    return { scheduled: false, permissionDenied: false };
  }
  const ok = await scheduleDailyReminder(time);
  return { scheduled: ok, permissionDenied: !ok };
}

/** Re-apply after language changes so reminders speak the new language. */
export async function rescheduleIfEnabled() {
  const config = getReminderConfig();
  if (config.enabled && hasCompletedOnboarding()) await scheduleDailyReminder(config.time).catch(() => {});
}
