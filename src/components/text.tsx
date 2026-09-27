import { Text as RNText, type TextProps } from "react-native";

import { useTheme } from "@/providers/theme";
import { type, type TypeVariant, type Palette } from "@/theme";

export type Tone = "ink" | "soft" | "faint" | "accent" | "flame" | "onAccent" | "danger" | "light";

const toneKey: Record<Exclude<Tone, "light">, keyof Palette> = {
  ink: "ink",
  soft: "inkSoft",
  faint: "inkFaint",
  accent: "accent",
  flame: "flame",
  onAccent: "onAccent",
  danger: "danger",
};

export function Text({
  variant = "body",
  tone = "ink",
  center,
  style,
  ...props
}: TextProps & { variant?: TypeVariant; tone?: Tone; center?: boolean }) {
  const { colors } = useTheme();
  const color = tone === "light" ? "#FFFFFF" : colors[toneKey[tone]];
  return <RNText style={[type[variant], { color }, center && { textAlign: "center" }, style]} {...props} />;
}
