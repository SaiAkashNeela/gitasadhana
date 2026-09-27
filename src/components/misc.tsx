import type { ReactNode } from "react";
import { Pressable, TextInput, View, type TextInputProps } from "react-native";

import { useTheme } from "@/providers/theme";
import { fonts, radius, spacing, type } from "@/theme";

import { Icon, type IconName } from "./icon";
import { Text } from "./text";

export function EmptyState({ icon, title, body, action }: { icon: IconName; title: string; body?: string; action?: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: "center", paddingVertical: spacing.xxxl, paddingHorizontal: spacing.xl, gap: spacing.md }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: colors.accentSoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={icon} size={30} weight="duotone" color={colors.accent} />
      </View>
      <Text variant="heading" center>
        {title}
      </Text>
      {body ? (
        <Text variant="callout" tone="soft" center style={{ maxWidth: 320 }}>
          {body}
        </Text>
      ) : null}
      {action}
    </View>
  );
}

export function SearchField({ onSubmit, ...props }: TextInputProps & { onSubmit?: () => void }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        height: 44,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
        borderCurve: "continuous",
        backgroundColor: colors.surfaceMuted,
      }}
    >
      <Icon name="search" size={17} color={colors.inkFaint} />
      <TextInput
        placeholderTextColor={colors.inkFaint}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        autoCorrect={false}
        clearButtonMode="while-editing"
        style={[type.callout, { flex: 1, color: colors.ink, height: 44, outlineStyle: "none" } as object]}
        {...props}
      />
    </View>
  );
}

export function Field({ label, multiline, ...props }: TextInputProps & { label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <Text variant="overline" tone="soft">
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.inkFaint}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        style={[
          type.callout,
          {
            color: colors.ink,
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            borderCurve: "continuous",
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            minHeight: multiline ? 128 : 48,
            outlineStyle: "none",
          } as object,
        ]}
        {...props}
      />
    </View>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: spacing.lg,
        height: 36,
        borderRadius: radius.full,
        justifyContent: "center",
        backgroundColor: selected ? colors.accent : pressed ? colors.surfaceMuted : colors.surface,
      })}
    >
      <Text variant="footnote" style={{ color: selected ? colors.onAccent : colors.ink, fontWeight: selected ? "600" : "400" }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      style={{ flexDirection: "row", padding: 3, borderRadius: radius.md, borderCurve: "continuous", backgroundColor: colors.surfaceMuted }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            style={{
              flex: 1,
              minHeight: 34,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: radius.sm + 1,
              borderCurve: "continuous",
              backgroundColor: active ? colors.surface : "transparent",
              boxShadow: active ? "0 1px 2px rgba(0,0,0,0.08)" : undefined,
              paddingHorizontal: spacing.sm,
            }}
          >
            <Text variant="footnote" numberOfLines={1} style={{ fontWeight: active ? "600" : "400", color: active ? colors.ink : colors.inkSoft }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Stat figure: a number in the serif face over a small label. */
export function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center", gap: 2 }}>
      <Text style={{ fontFamily: fonts.serifMedium, fontSize: 24, lineHeight: 30, fontVariant: ["lining-nums", "tabular-nums"] }}>{value}</Text>
      <Text variant="caption" tone="soft" center numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
