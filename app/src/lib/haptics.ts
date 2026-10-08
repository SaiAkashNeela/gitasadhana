import * as Haptics from "expo-haptics";

/** A soft tick on meaningful taps (play, save, tab change). iOS only, per platform norms. */
export function tap() {
  if (process.env.EXPO_OS === "ios") Haptics.selectionAsync().catch(() => {});
}
