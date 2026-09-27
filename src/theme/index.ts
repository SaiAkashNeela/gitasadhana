import { Platform, type TextStyle } from "react-native";

/**
 * Gita Sadhana — "lamp in the evening temple".
 * A quiet ink-and-stone palette so the golden chapter art glows. Krishna-blue (shyam)
 * is the single accent; the diya flame colour is reserved for devotional marks
 * (Om, streak, verse numbers). Light and dark are declared pairs.
 */
const light = {
  background: "#F4F1EA",
  surface: "#FFFFFF",
  surfaceRaised: "#FBF9F4",
  surfaceMuted: "#EAE6DC",
  ink: "#1B1F2E",
  inkSoft: "#555A6B",
  inkFaint: "#8A8D99",
  hairline: "rgba(27, 31, 46, 0.10)",
  accent: "#2F4A8A",
  accentPressed: "#243B70",
  onAccent: "#FFFFFF",
  accentSoft: "#E4E8F3",
  flame: "#A96A1F",
  flameSoft: "#F3E7D4",
  danger: "#B3261E",
  dangerSoft: "#F8E3E1",
  scrim: "rgba(10, 12, 20, 0.55)",
  overlay: "rgba(10, 12, 20, 0.40)",
};

const dark: typeof light = {
  background: "#0F121B",
  surface: "#171B27",
  surfaceRaised: "#1D2231",
  surfaceMuted: "#252B3B",
  ink: "#EDE8DE",
  inkSoft: "#A6AAB7",
  inkFaint: "#6F7485",
  hairline: "rgba(237, 232, 222, 0.10)",
  accent: "#A9BCF0",
  accentPressed: "#8FA6E3",
  onAccent: "#0F121B",
  accentSoft: "#222B45",
  flame: "#E3AA58",
  flameSoft: "#2B2418",
  danger: "#F2B8B5",
  dangerSoft: "#3A1E1D",
  scrim: "rgba(5, 6, 10, 0.62)",
  overlay: "rgba(5, 6, 10, 0.45)",
};

export const palettes = { light, dark };
export type Palette = typeof light;
export type SchemeName = keyof typeof palettes;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

/** Screen edge padding, used everywhere. */
export const gutter = spacing.xl;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 26,
  full: 9999,
} as const;

export const shadows = {
  soft: "0 1px 2px rgba(15, 18, 27, 0.06)",
  raised: "0 6px 18px rgba(15, 18, 27, 0.10)",
} as const;

export const motion = {
  fast: 140,
  base: 240,
  slow: 420,
} as const;

/**
 * Marcellus — lettering modelled on classical inscriptions — for titles; EB Garamond,
 * a book face, for scripture and reflections; the system face for interface text.
 * Non-Latin scripts fall back to the platform's Indic fonts.
 */
export const fonts = {
  display: "Marcellus_400Regular",
  serif: "EBGaramond_400Regular",
  serifItalic: "EBGaramond_400Regular_Italic",
  serifMedium: "EBGaramond_500Medium",
  serifSemibold: "EBGaramond_600SemiBold",
  devanagari: "NotoSerifDevanagari_400Regular",
  devanagariMedium: "NotoSerifDevanagari_500Medium",
  ui: Platform.select({ ios: "System", android: "sans-serif", default: "system-ui" }) as string,
  uiMedium: Platform.select({ ios: "System", android: "sans-serif-medium", default: "system-ui" }) as string,
};

/** Named text styles; colours are applied by <Text tone>. */
export const type = {
  display: { fontFamily: fonts.display, fontSize: 28, lineHeight: 36 },
  title: { fontFamily: fonts.display, fontSize: 22, lineHeight: 30 },
  heading: { fontFamily: fonts.display, fontSize: 18, lineHeight: 25 },
  subheading: { fontFamily: fonts.serifMedium, fontSize: 17, lineHeight: 23 },
  body: { fontFamily: fonts.ui, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.uiMedium, fontSize: 15, lineHeight: 22, fontWeight: "600" },
  callout: { fontFamily: fonts.ui, fontSize: 14, lineHeight: 20 },
  footnote: { fontFamily: fonts.ui, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.ui, fontSize: 12, lineHeight: 16 },
  overline: {
    fontFamily: fonts.uiMedium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  scripture: { fontFamily: fonts.serif, fontSize: 18, lineHeight: 27 },
  sanskrit: { fontFamily: fonts.devanagari, fontSize: 19, lineHeight: 34 },
} as const satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;

export const layout = {
  /** Keeps reading columns comfortable on tablets and wide web windows. */
  maxWidth: 640,
  tabBarHeight: 56,
  miniPlayerHeight: 64,
} as const;
