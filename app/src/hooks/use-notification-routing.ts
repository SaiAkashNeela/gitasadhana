import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect } from "react";
import { AppState } from "react-native";

import { rescheduleIfEnabled } from "@/lib/reminders";

/**
 * Tapping a reminder opens the screen it points at (daily → notifications, etc.), and leaving
 * the app refreshes the reminders so "continue reading" points at the latest verse.
 */
export function useNotificationRouting() {
  useEffect(() => {
    const open = (n: Notifications.Notification) => {
      const path = n.request.content.data?.path;
      if (typeof path === "string") router.push(path as never);
    };
    const last = Notifications.getLastNotificationResponse();
    if (last) open(last.notification);
    const sub = Notifications.addNotificationResponseReceivedListener((r) => open(r.notification));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background") void rescheduleIfEnabled();
    });
    return () => sub.remove();
  }, []);
}
