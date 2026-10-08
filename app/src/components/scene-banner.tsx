import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState, type ReactNode } from "react";
import { AccessibilityInfo, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { sceneArt } from "@/lib/gita";
import { radius, spacing } from "@/theme";

/**
 * The nine Gita scenes, crossfading slowly behind a line of scripture — the original
 * home banner, made quieter (8s per scene, long dissolve, still when Reduce Motion is on).
 */
export function SceneBanner({ children, style, start = 0 }: { children?: ReactNode; style?: StyleProp<ViewStyle>; start?: number }) {
  const [index, setIndex] = useState(start % sceneArt.length);
  const [still, setStill] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setStill).catch(() => {});
  }, []);

  useEffect(() => {
    if (still) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % sceneArt.length), 8000);
    return () => clearInterval(id);
  }, [still]);

  return (
    <View style={[{ borderRadius: radius.xl, borderCurve: "continuous", overflow: "hidden", backgroundColor: "#1b1f2e" }, style]}>
      <Image
        source={sceneArt[index]}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={1600}
        accessible={false}
      />
      <LinearGradient
        colors={["rgba(10,12,20,0.05)", "rgba(10,12,20,0.35)", "rgba(10,12,20,0.82)"]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={{ flex: 1, justifyContent: "flex-end", padding: spacing.xl, gap: spacing.sm }}>{children}</View>
    </View>
  );
}
