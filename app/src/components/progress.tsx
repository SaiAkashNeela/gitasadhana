import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { useTheme } from "@/providers/theme";

export function ProgressBar({ value, height = 4, color }: { value: number; height?: number; color?: string }) {
  const { colors } = useTheme();
  const pct = Math.max(0, Math.min(1, value || 0));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}
      style={{ height, borderRadius: height, backgroundColor: colors.surfaceMuted, overflow: "hidden" }}
    >
      <View style={{ width: `${pct * 100}%`, height, borderRadius: height, backgroundColor: color ?? colors.accent }} />
    </View>
  );
}

export function ProgressRing({ value, size, stroke = 2.5, color }: { value: number; size: number; stroke?: number; color?: string }) {
  const { colors } = useTheme();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value || 0));
  return (
    <Svg width={size} height={size} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.hairline} strokeWidth={stroke} fill="none" />
      {pct > 0 && (
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color ?? colors.flame}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c - pct * c}
          strokeLinecap="round"
        />
      )}
    </Svg>
  );
}
