import { useRef, useState } from "react";
import { View, type GestureResponderEvent } from "react-native";

import { formatTime } from "@/providers/audio";
import { useTheme } from "@/providers/theme";
import { spacing } from "@/theme";

import { Text } from "./text";

/** Tap or drag to seek. Uses the responder system so it behaves the same on web. */
export function SeekBar({
  current,
  duration,
  onSeek,
  disabled,
}: {
  current: number;
  duration: number;
  onSeek: (seconds: number) => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  const width = useRef(1);
  const [drag, setDrag] = useState<number | null>(null);
  const active = !disabled && duration > 0;
  const shown = drag ?? current;
  const pct = active ? Math.max(0, Math.min(1, shown / duration)) : 0;

  const at = (e: GestureResponderEvent) => Math.max(0, Math.min(1, e.nativeEvent.locationX / width.current)) * duration;

  return (
    <View style={{ gap: spacing.xs }}>
      <View
        accessibilityRole="adjustable"
        accessibilityLabel="Playback position"
        accessibilityValue={{ min: 0, max: Math.round(duration), now: Math.round(shown), text: formatTime(shown) }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(e) => {
          if (!active) return;
          onSeek(Math.max(0, Math.min(duration, current + (e.nativeEvent.actionName === "increment" ? 10 : -10))));
        }}
        onLayout={(e) => (width.current = Math.max(1, e.nativeEvent.layout.width))}
        onStartShouldSetResponder={() => active}
        onMoveShouldSetResponder={() => active}
        onResponderGrant={(e) => setDrag(at(e))}
        onResponderMove={(e) => setDrag(at(e))}
        onResponderRelease={(e) => {
          onSeek(at(e));
          setDrag(null);
        }}
        onResponderTerminate={() => setDrag(null)}
        style={{ height: 24, justifyContent: "center" }}
      >
        <View style={{ pointerEvents: "none", height: 4, borderRadius: 2, backgroundColor: colors.surfaceMuted, overflow: "hidden" }}>
          <View style={{ width: `${pct * 100}%`, height: 4, backgroundColor: colors.accent }} />
        </View>
        {active && (
          <View
            style={{
              pointerEvents: "none",
              position: "absolute",
              left: `${pct * 100}%`,
              marginLeft: -7,
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: colors.accent,
              transform: [{ scale: drag != null ? 1.25 : 1 }],
            }}
          />
        )}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text variant="caption" tone="faint" style={{ fontVariant: ["tabular-nums"] }}>
          {formatTime(active ? shown : 0)}
        </Text>
        <Text variant="caption" tone="faint" style={{ fontVariant: ["tabular-nums"] }}>
          {formatTime(active ? duration : 0)}
        </Text>
      </View>
    </View>
  );
}
