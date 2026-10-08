import { Children, Fragment, type ReactNode } from "react";
import { Pressable, StyleSheet, Switch, View, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "@/providers/theme";
import { radius, spacing } from "@/theme";

import { Icon, type IconName } from "./icon";
import { Text } from "./text";

/** Inset grouped section: one surface, hairline separators, no boxes-in-boxes. */
export function Group({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  const rows = Children.toArray(children).filter(Boolean);
  return (
    <View
      style={[
        { backgroundColor: colors.surface, borderRadius: radius.lg, borderCurve: "continuous", overflow: "hidden" },
        style,
      ]}
    >
      {rows.map((row, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.hairline, marginLeft: spacing.lg }} />
          )}
          {row}
        </Fragment>
      ))}
    </View>
  );
}

export function Row({
  icon,
  title,
  subtitle,
  value,
  onPress,
  chevron = !!onPress,
  destructive,
  right,
  accessibilityLabel,
}: {
  icon?: IconName;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  chevron?: boolean;
  destructive?: boolean;
  right?: ReactNode;
  accessibilityLabel?: string;
}) {
  const { colors } = useTheme();
  const content = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, minHeight: 52, paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
      {icon && <Icon name={icon} size={22} weight="duotone" color={destructive ? colors.danger : colors.accent} />}
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="callout" tone={destructive ? "danger" : "ink"}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="footnote" tone="soft">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text variant="footnote" tone="soft" numberOfLines={1} style={{ maxWidth: "45%" }}>
          {value}
        </Text>
      ) : null}
      {right}
      {chevron && <Icon name="chevronRight" size={14} color={colors.inkFaint} />}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      style={({ pressed }) => ({ backgroundColor: pressed ? colors.surfaceMuted : "transparent" })}
    >
      {content}
    </Pressable>
  );
}

export function SwitchRow({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
}: {
  icon?: IconName;
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  const { colors } = useTheme();
  return (
    <Row
      icon={icon}
      title={title}
      subtitle={subtitle}
      chevron={false}
      right={
        <Switch
          accessibilityLabel={title}
          value={value}
          onValueChange={onValueChange}
          trackColor={{ true: colors.accent, false: colors.surfaceMuted }}
          thumbColor={process.env.EXPO_OS === "android" ? (value ? "#FFFFFF" : colors.inkFaint) : undefined}
          {...(process.env.EXPO_OS === "web" ? ({ activeThumbColor: "#FFFFFF" } as object) : {})}
        />
      }
    />
  );
}
