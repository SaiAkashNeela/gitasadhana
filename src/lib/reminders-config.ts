import { storage, useStored } from "./storage";

export type ReminderConfig = { enabled: boolean; time: string /* "07:00" */ };

const REMINDER_KEY = "gita_reminder_config";
const ONBOARDING_KEY = "gita_onboarding_complete";
const DEFAULT_CONFIG: ReminderConfig = { enabled: true, time: "07:00" };

export function hasCompletedOnboarding() {
  return storage.getString(ONBOARDING_KEY) === "true";
}

export function markOnboardingCompleted() {
  storage.set(ONBOARDING_KEY, "true");
}

/** Default is enabled at 07:00, as in the original app. */
export function getReminderConfig(): ReminderConfig {
  return storage.get<ReminderConfig>(REMINDER_KEY, DEFAULT_CONFIG);
}

/** Reactive read of the reminder settings. */
export function useReminderConfig() {
  return useStored<ReminderConfig>(REMINDER_KEY, DEFAULT_CONFIG)[0];
}

export function saveReminderConfig(config: ReminderConfig) {
  storage.set(REMINDER_KEY, config);
}

export function formatTime12Hour(time: string) {
  const [h, m] = time.split(":").map((x) => parseInt(x, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return time;
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function lastReadVerse() {
  const history = storage.get<{ chapter: number; verse: number }[]>("gita_history", []);
  const first = history[0];
  return first?.chapter && first?.verse ? `${first.chapter}.${first.verse}` : "1.1";
}
