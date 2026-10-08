import { createContext, use, useEffect, type ReactNode } from "react";
import { Appearance, useColorScheme } from "react-native";

import { useStored } from "@/lib/storage";
import { palettes, type Palette, type SchemeName } from "@/theme";

export type ThemePreference = "system" | "light" | "dark";

type ThemeCtx = {
  colors: Palette;
  scheme: SchemeName;
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
};

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useStored<ThemePreference>("gita_theme", "system");
  const system = useColorScheme();
  const scheme: SchemeName = preference === "system" ? (system === "dark" ? "dark" : "light") : preference;

  useEffect(() => {
    // Keeps native chrome (alerts, keyboards, status bar) in step with the in-app choice.
    if (process.env.EXPO_OS !== "web") {
      Appearance.setColorScheme(preference === "system" ? "unspecified" : preference);
    }
  }, [preference]);

  return <Ctx value={{ colors: palettes[scheme], scheme, preference, setPreference }}>{children}</Ctx>;
}

export function useTheme() {
  const ctx = use(Ctx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
