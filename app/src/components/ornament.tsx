import { StyleSheet, View } from "react-native";

import { useTheme } from "@/providers/theme";
import { fonts, spacing } from "@/theme";

import { Text } from "./text";

/** A hairline broken by a small Om — the one devotional mark used across the app. */
export function OmRule({ width = 44 }: { width?: number }) {
  const { colors } = useTheme();
  return (
    <View
      accessible={false}
      style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.md }}
    >
      <View style={{ width, height: StyleSheet.hairlineWidth * 2, backgroundColor: colors.flame, opacity: 0.45 }} />
      <Text style={{ fontFamily: fonts.devanagari, fontSize: 16, lineHeight: 24, color: colors.flame }}>ॐ</Text>
      <View style={{ width, height: StyleSheet.hairlineWidth * 2, backgroundColor: colors.flame, opacity: 0.45 }} />
    </View>
  );
}

export function Hairline() {
  const { colors } = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.hairline }} />;
}
