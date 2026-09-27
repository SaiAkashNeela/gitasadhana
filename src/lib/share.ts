import * as Clipboard from "expo-clipboard";
import { Share } from "react-native";

import { toast } from "@/components/toast";

/** Native share sheet; on web uses the Web Share API or copies to the clipboard. */
export async function shareText(message: string, opts: { title?: string; url?: string; copiedLabel?: string } = {}) {
  try {
    if (process.env.EXPO_OS === "web") {
      const nav = globalThis.navigator as Navigator | undefined;
      if (nav?.share) {
        await nav.share({ title: opts.title, text: message, url: opts.url });
        return;
      }
      await Clipboard.setStringAsync(opts.url ? `${message}\n${opts.url}` : message);
      toast.success(opts.copiedLabel ?? "Copied to clipboard");
      return;
    }
    await Share.share(
      process.env.EXPO_OS === "ios" && opts.url ? { message, url: opts.url, title: opts.title } : { message: opts.url ? `${message}\n${opts.url}` : message, title: opts.title },
    );
  } catch {
    // Dismissed share sheets reject on some platforms; nothing to report.
  }
}
