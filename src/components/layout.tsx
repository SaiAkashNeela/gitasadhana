import type { ReactNode } from "react";
import { ScrollView, View, type ScrollViewProps, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/providers/theme";
import { gutter, layout, spacing } from "@/theme";

import { Text } from "./text";

/**
 * Scrollable screen body. `inset` = "header" for stack screens (native header handles
 * the top), "top" for tab roots without a header. `bottom` reserves room for the tab
 * bar / mini player.
 */
export function Screen({
  children,
  inset = "header",
  bottom = "none",
  gap = spacing.xxl,
  contentStyle,
  ...rest
}: ScrollViewProps & {
  children: ReactNode;
  inset?: "header" | "top";
  bottom?: "none" | "tabs" | "player";
  gap?: number;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const bottomPad =
    bottom === "tabs"
      ? layout.tabBarHeight + layout.miniPlayerHeight + spacing.xxl + insets.bottom
      : bottom === "player"
        ? layout.miniPlayerHeight + spacing.xxl + insets.bottom
        : spacing.xxxl + insets.bottom;
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior={inset === "header" ? "automatic" : "never"}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={process.env.EXPO_OS !== "web"}
      {...rest}
      contentContainerStyle={[
        {
          paddingTop: inset === "top" ? insets.top + spacing.lg : spacing.lg,
          paddingBottom: bottomPad,
          gap,
        },
        contentStyle,
      ]}
    >
      {children}
    </ScrollView>
  );
}

/** Horizontal gutter + comfortable reading width on large screens. */
export function Column({ children, style, gap = spacing.lg }: { children: ReactNode; style?: StyleProp<ViewStyle>; gap?: number }) {
  return (
    <View style={[{ paddingHorizontal: gutter, width: "100%", maxWidth: layout.maxWidth + gutter * 2, alignSelf: "center", gap }, style]}>
      {children}
    </View>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 28 }}>
      <Text variant="overline" tone="soft" accessibilityRole="header">
        {title}
      </Text>
      {action}
    </View>
  );
}

/** Large page title for tab roots, which have no navigation bar. */
export function PageTitle({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: spacing.md }}>
      <View style={{ flex: 1, gap: spacing.xs }}>
        {subtitle ? (
          <Text variant="footnote" tone="soft">
            {subtitle}
          </Text>
        ) : null}
        <Text variant="display" accessibilityRole="header">
          {title}
        </Text>
      </View>
      {right ? <View style={{ flexDirection: "row", gap: spacing.xs, paddingBottom: spacing.xs }}>{right}</View> : null}
    </View>
  );
}
