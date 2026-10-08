import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect } from "react";

/** Tapping a reminder opens the screen it points at (daily → notifications, etc.). */
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
}
