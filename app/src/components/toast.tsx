import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/providers/theme";
import { radius, shadows, spacing, layout } from "@/theme";

import { Text } from "./text";

type ToastKind = "success" | "info" | "error";
type ToastItem = { id: number; kind: ToastKind; message: string; action?: { label: string; onPress: () => void } };

let items: ToastItem[] = [];
let seq = 0;
const listeners = new Set<(i: ToastItem[]) => void>();
const emit = () => listeners.forEach((l) => l(items));

function show(kind: ToastKind, message: string, opts?: { action?: ToastItem["action"]; duration?: number }) {
  const item: ToastItem = { id: ++seq, kind, message, action: opts?.action };
  items = [...items.slice(-1), item];
  emit();
  setTimeout(() => dismiss(item.id), opts?.duration ?? (opts?.action ? 5000 : 2200));
}

function dismiss(id: number) {
  items = items.filter((i) => i.id !== id);
  emit();
}

/** Quiet, bottom-anchored confirmations — the app's replacement for sonner. */
export const toast = {
  success: (m: string, o?: { action?: ToastItem["action"]; duration?: number }) => show("success", m, o),
  info: (m: string, o?: { action?: ToastItem["action"]; duration?: number }) => show("info", m, o),
  error: (m: string, o?: { action?: ToastItem["action"]; duration?: number }) => show("error", m, o),
};

export function ToastHost() {
  const [list, setList] = useState(items);
  const insets = useSafeAreaInsets();
  const { colors, scheme } = useTheme();

  useEffect(() => {
    listeners.add(setList);
    return () => {
      listeners.delete(setList);
    };
  }, []);

  return (
    <View
      style={{
        pointerEvents: "box-none",
        position: "absolute",
        left: 0,
        right: 0,
        bottom: insets.bottom + layout.tabBarHeight + spacing.lg,
        alignItems: "center",
        gap: spacing.sm,
        paddingHorizontal: spacing.xl,
      }}
    >
      {list.map((item) => (
        <Animated.View
          key={item.id}
          entering={FadeInDown.duration(180)}
          exiting={FadeOutDown.duration(160)}
          accessibilityLiveRegion="polite"
          style={{
            maxWidth: 520,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            borderRadius: radius.lg,
            borderCurve: "continuous",
            backgroundColor: scheme === "dark" ? colors.surfaceRaised : colors.ink,
            boxShadow: shadows.raised,
          }}
        >
          {item.kind !== "info" && (
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: item.kind === "error" ? colors.danger : colors.flame,
              }}
            />
          )}
          <Text
            variant="footnote"
            style={{ color: scheme === "dark" ? colors.ink : colors.background, flexShrink: 1 }}
            selectable
          >
            {item.message}
          </Text>
          {item.action && (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                item.action?.onPress();
                dismiss(item.id);
              }}
              hitSlop={8}
            >
              <Text variant="footnote" style={{ color: scheme === "dark" ? colors.accent : colors.flameSoft, fontWeight: "600" }}>
                {item.action.label}
              </Text>
            </Pressable>
          )}
        </Animated.View>
      ))}
    </View>
  );
}
