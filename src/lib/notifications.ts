import { LocalNotifications } from "@capacitor/local-notifications";
import { toast } from "sonner";

export interface ReminderConfig {
  enabled: boolean;
  time: string; // e.g. "07:00"
}

// Key for Local Storage
const REMINDER_STORAGE_KEY = "gita_reminder_config";

/**
 * Loads the current reminder configuration from local storage.
 * Default is enabled at 07:00 AM.
 */
export function getReminderConfig(): ReminderConfig {
  try {
    const raw = localStorage.getItem(REMINDER_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load reminder config:", e);
  }
  return { enabled: true, time: "07:00" };
}

/**
 * Checks and requests notifications permissions.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const status = await LocalNotifications.checkPermissions();
    if (status.display !== "granted") {
      const request = await LocalNotifications.requestPermissions();
      return request.display === "granted";
    }
    return true;
  } catch (e) {
    console.error("Failed to check/request notifications permissions:", e);
    return false;
  }
}

/**
 * Cancels all scheduled daily reminders.
 */
export async function cancelDailyReminder(): Promise<void> {
  try {
    const pending = await LocalNotifications.getPending();
    const reminders = pending.notifications.filter((n) => n.id === 1001);
    if (reminders.length > 0) {
      await LocalNotifications.cancel({ notifications: reminders });
      console.log("📅 Cancelled all active scheduled daily reminders.");
    }
  } catch (e) {
    console.error("Failed to cancel daily reminders:", e);
  }
}

/**
 * Schedules a daily reminder to read the Gita at the specified time.
 * @param timeString String in "HH:MM" format (24-hour)
 */
export async function scheduleDailyReminder(timeString: string): Promise<boolean> {
  try {
    // 1. Cancel previous notifications to prevent duplicates
    await cancelDailyReminder();

    // 2. Request permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn("⚠️ Notification permissions not granted. Skipping scheduling.");
      return false;
    }

    // 3. Parse hours and minutes
    const [hours, minutes] = timeString.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      console.error(`Invalid time string provided for reminder: ${timeString}`);
      return false;
    }

    // 4. Schedule local notification
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1001,
          title: "Daily Spiritual Reflection 🕉️",
          body: "Take 2 minutes to listen to the wisdom of the Bhagavad Gītā. Tap to read today's verse.",
          schedule: {
            on: {
              hour: hours,
              minute: minutes,
            },
            repeats: true,
            allowWhileIdle: true,
          },
          sound: "default",
          extra: {
            path: "/",
          },
        },
      ],
    });

    console.log(`📅 Successfully scheduled daily reminder for ${timeString} local time.`);
    return true;
  } catch (e) {
    console.error("Failed to schedule daily reminder:", e);
    return false;
  }
}

/**
 * Saves and applies new reminder settings.
 */
export async function updateReminderSettings(enabled: boolean, time: string): Promise<void> {
  const config: ReminderConfig = { enabled, time };
  localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(config));

  if (enabled) {
    const success = await scheduleDailyReminder(time);
    if (success) {
      toast.success(`Reminder set for ${formatTime12Hour(time)} daily!`);
    } else {
      toast.error("Failed to schedule reminders. Please check your notification settings.");
    }
  } else {
    await cancelDailyReminder();
    toast.info("Daily reminders disabled");
  }
}

/**
 * Helper to convert "HH:MM" string to a nice "HH:MM AM/PM" string.
 */
export function formatTime12Hour(timeString: string): string {
  const [hourStr, minStr] = timeString.split(":");
  const hours = parseInt(hourStr, 10);
  const minutes = parseInt(minStr, 10);
  if (isNaN(hours) || isNaN(minutes)) return timeString;

  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;

  return `${displayHours}:${displayMinutes} ${ampm}`;
}
