import { ActivityIndicator, Pressable, View, type StyleProp, type ViewStyle } from "react-native";

import { tap } from "@/lib/haptics";
import { useTheme } from "@/providers/theme";
import { radius, spacing } from "@/theme";

import { Icon, type IconName } from "./icon";
import { Text } from "./text";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  icon,
  loading,
  disabled,
  style,
  accessibilityLabel,
}: {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: "sm" | "md";
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const { colors } = useTheme();
  const bg = {
    primary: colors.accent,
    secondary: colors.surfaceMuted,
    ghost: "transparent",
    destructive: colors.danger,
  }[variant];
  const fg = {
    primary: colors.onAccent,
    secondary: colors.ink,
    ghost: colors.accent,
    destructive: colors.background,
  }[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={
        onPress &&
        (() => {
          tap();
          onPress();
        })
      }
      style={({ pressed }) => [
        {
          minHeight: size === "md" ? 52 : 40,
          paddingHorizontal: size === "md" ? spacing.xl : spacing.lg,
          borderRadius: radius.full,
          backgroundColor: bg,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: spacing.sm,
          opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon && <Icon name={icon} size={size === "md" ? 18 : 16} color={fg} />}
          <Text variant={size === "md" ? "bodyStrong" : "footnote"} style={{ color: fg, fontWeight: "600" }}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  color,
  size = 22,
  tone = "plain",
  disabled,
  badge,
  style,
}: {
  icon: IconName;
  onPress?: () => void;
  label: string;
  color?: string;
  size?: number;
  tone?: "plain" | "filled" | "accent";
  disabled?: boolean;
  badge?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const bg = tone === "filled" ? colors.surfaceMuted : tone === "accent" ? colors.accent : "transparent";
  const fg = color ?? (tone === "accent" ? colors.onAccent : colors.ink);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      onPress={
        onPress &&
        (() => {
          tap();
          onPress();
        })
      }
      disabled={disabled}
      hitSlop={4}
      style={({ pressed }) => [
        {
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: pressed && tone === "plain" ? colors.surfaceMuted : bg,
          opacity: disabled ? 0.35 : pressed && tone !== "plain" ? 0.8 : 1,
        },
        style,
      ]}
    >
      <Icon name={icon} size={size} color={fg} />
      {badge && (
        <View
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.flame,
            borderWidth: 1.5,
            borderColor: colors.background,
          }}
        />
      )}
    </Pressable>
  );
}
