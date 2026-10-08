import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { OmRule } from "@/components/ornament";
import { Text } from "@/components/text";
import { t } from "@/i18n";
import { art } from "@/lib/gita";
import { markOnboardingCompleted } from "@/lib/reminders-config";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { gutter, radius, spacing } from "@/theme";

export function PageDots({ index }: { index: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", justifyContent: "center", gap: spacing.sm }} accessible={false}>
      {[0, 1].map((i) => (
        <View
          key={i}
          style={{
            width: i === index ? 18 : 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: i === index ? colors.accent : colors.surfaceMuted,
          }}
        />
      ))}
    </View>
  );
}

export function OnboardingScreen() {
  const { colors } = useTheme();
  const { language } = useProgress();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const finish = () => {
    markOnboardingCompleted();
    router.replace("/language?from=onboarding");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ height: height * 0.52 }}>
        <Image source={art.listen} style={{ flex: 1 }} contentFit="cover" accessibilityLabel={t("onboardingSlideTitle2", language)} />
        <LinearGradient
          colors={["transparent", colors.background]}
          style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 120 }}
        />
        <View
          style={{
            position: "absolute",
            top: insets.top + spacing.sm,
            left: gutter,
            right: gutter,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <OverlayPill label={t("back", language)} onPress={() => (router.canGoBack() ? router.back() : router.replace("/welcome"))} />
          <OverlayPill label={t("skip", language)} onPress={() => finish()} />
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: gutter, alignItems: "center", justifyContent: "center", gap: spacing.lg }}>
        <OmRule />
        <Text variant="title" center accessibilityRole="header">
          {t("onboardingSlideTitle2", language)}
        </Text>
        <Text variant="callout" tone="soft" center style={{ maxWidth: 340 }}>
          {t("onboardingSlideBody2", language)}
        </Text>
      </View>

      <View style={{ paddingHorizontal: gutter, paddingBottom: insets.bottom + spacing.lg, gap: spacing.lg, width: "100%", maxWidth: 520, alignSelf: "center" }}>
        <Button title={t("continueBtn", language)} onPress={() => finish()} />
        <PageDots index={1} />
      </View>
    </View>
  );
}

function OverlayPill({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        height: 34,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.full,
        justifyContent: "center",
        backgroundColor: pressed ? "rgba(15,18,27,0.45)" : "rgba(15,18,27,0.30)",
      })}
    >
      <Text variant="footnote" tone="light" style={{ fontWeight: "600" }}>
        {label}
      </Text>
    </Pressable>
  );
}
