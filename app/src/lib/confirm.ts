import { Alert } from "react-native";

import { t } from "@/i18n";

import { storage } from "./storage";

/** Native confirmation for uncommon, irreversible actions. */
export function confirm(opts: { title: string; message?: string; confirmLabel: string; cancelLabel?: string; destructive?: boolean }) {
  return new Promise<boolean>((resolve) => {
    if (process.env.EXPO_OS === "web") {
      resolve(globalThis.confirm?.(opts.message ? `${opts.title}\n\n${opts.message}` : opts.title) ?? false);
      return;
    }
    Alert.alert(opts.title, opts.message, [
      { text: opts.cancelLabel ?? t("cancel", storage.getString("gita_language") || "en"), style: "cancel", onPress: () => resolve(false) },
      { text: opts.confirmLabel, style: opts.destructive ? "destructive" : "default", onPress: () => resolve(true) },
    ]);
  });
}
