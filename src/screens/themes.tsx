import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { Column, Screen } from "@/components/layout";
import { Text } from "@/components/text";
import { t } from "@/i18n";
import { sceneArt, searchTranslations, useTranslations } from "@/lib/gita";
import { wisdomThemes } from "@/lib/themes";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { fonts, radius, spacing } from "@/theme";

export function ThemesScreen() {
  const { colors } = useTheme();
  const { language } = useProgress();
  const tr = useTranslations(language);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: t("wisdomThemesTitle", language) }} />
      <Screen>
        <Column>
          <Text variant="callout" tone="soft">
            {t("wisdomThemesSubtitle", language)}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
            {wisdomThemes.map((th) => {
              const count = tr.ready ? searchTranslations(th.query, language, 700).length : null;
              return (
                <Pressable
                  key={th.id}
                  accessibilityRole="button"
                  accessibilityLabel={t(th.id, language)}
                  onPress={() => router.push(`/wisdom/theme/${th.id}`)}
                  style={({ pressed }) => ({
                    width: "47.5%",
                    flexGrow: 1,
                    aspectRatio: 1,
                    borderRadius: radius.lg,
                    borderCurve: "continuous",
                    overflow: "hidden",
                    opacity: pressed ? 0.9 : 1,
                  })}
                >
                  <Image source={sceneArt[th.scene]} style={StyleSheet.absoluteFill} contentFit="cover" />
                  <LinearGradient colors={["transparent", "rgba(10,12,20,0.8)"]} style={StyleSheet.absoluteFill} />
                  <View style={{ flex: 1, justifyContent: "space-between", padding: spacing.lg }}>
                    <Text style={{ fontFamily: fonts.devanagariMedium, fontSize: 20, lineHeight: 28, color: "#FFFFFF", opacity: 0.85 }}>ॐ</Text>
                    <View>
                      <Text style={{ fontFamily: fonts.display, fontSize: 18, lineHeight: 24, color: "#FFFFFF" }}>{t(th.id, language)}</Text>
                      {count != null ? (
                        <Text variant="caption" tone="light" style={{ opacity: 0.8 }}>
                          {count} {t("verses", language).toLowerCase()}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Column>
      </Screen>
    </View>
  );
}
