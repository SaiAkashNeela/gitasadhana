import { getReminderConfig, saveReminderConfig } from "./reminders-config";

export * from "./reminders-config";

// Web has no scheduled local notifications; preferences are still saved and synced.
export const remindersSupported = false;

export async function hasNotificationPermission() {
  return false;
}
export async function cancelDailyReminder() {}
export async function scheduleDailyReminder(_time: string) {
  return false;
}
export async function updateReminderSettings(enabled: boolean, time: string) {
  saveReminderConfig({ enabled, time });
  return { scheduled: false, permissionDenied: false };
}
export async function rescheduleIfEnabled() {
  void getReminderConfig();
}
