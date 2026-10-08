import * as Updates from "expo-updates";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";

import { toast } from "@/components/toast";
import { t } from "@/i18n";
import { storage } from "@/lib/storage";

const MIN_CHECK_INTERVAL_MS = 15 * 60 * 1000;

/**
 * Over-the-air updates (EAS Update): whenever the app comes to the foreground, look for a
 * newly published update, download it quietly, and offer a gentle one-tap restart. Content or
 * text fixes therefore reach people within minutes, without a store release.
 */
export function useOtaUpdates() {
  const lastCheck = useRef(0);
  const offered = useRef(false);

  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) return;

    const check = async () => {
      if (offered.current || Date.now() - lastCheck.current < MIN_CHECK_INTERVAL_MS) return;
      lastCheck.current = Date.now();
      try {
        const result = await Updates.checkForUpdateAsync();
        if (!result.isAvailable) return;
        const fetched = await Updates.fetchUpdateAsync();
        if (!fetched.isNew) return;
        offered.current = true;
        const lang = storage.getString("gita_language") || "en";
        toast.info(t("updateReady", lang), {
          duration: 12000,
          action: { label: t("restart", lang), onPress: () => void Updates.reloadAsync() },
        });
      } catch {
        // Offline or the update server is unreachable; try again next time.
      }
    };

    void check();
    const sub = AppState.addEventListener("change", (s) => s === "active" && void check());
    return () => sub.remove();
  }, []);
}
