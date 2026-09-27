import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { OmRule } from "@/components/ornament";
import { Text } from "@/components/text";
import { t } from "@/i18n";
import { art } from "@/lib/gita";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { spacing, gutter } from "@/theme";

import { PageDots } from "./onboarding";

export function WelcomeScreen() {
  const { colors } = useTheme();
  const { language } = useProgress();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ height: height * 0.52 }}>
        <Image source={art.welcome} style={{ flex: 1 }} contentFit="cover" accessibilityLabel="Bhagavad Gita" />
        <LinearGradient
          colors={["transparent", colors.background]}
          style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 120 }}
        />
      </View>

      <View style={{ flex: 1, paddingHorizontal: gutter, alignItems: "center", justifyContent: "center", gap: spacing.lg }}>
        <OmRule />
        <View style={{ alignItems: "center", gap: spacing.xs }}>
          <Text variant="subheading" tone="soft" center style={{ fontStyle: "italic" }}>
            {t("welcomeLine1", language)}
          </Text>
          <Text variant="display" center accessibilityRole="header">
            {t("welcomeLine2", language)}
          </Text>
        </View>
        <Text variant="callout" tone="soft" center style={{ maxWidth: 340 }}>
          {t("welcomeSub", language)}
        </Text>
      </View>

      <View style={{ paddingHorizontal: gutter, paddingBottom: insets.bottom + spacing.lg, gap: spacing.lg, width: "100%", maxWidth: 520, alignSelf: "center" }}>
        <Button title={t("Continue", language)} onPress={() => router.push("/onboarding")} />
        <PageDots index={0} />
      </View>
    </View>
  );
}
