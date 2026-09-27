import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { Column, Screen } from "@/components/layout";
import { EmptyState } from "@/components/misc";
import { Text } from "@/components/text";
import { t } from "@/i18n";
import { sceneArt, searchTranslations, useTranslations } from "@/lib/gita";
import { wisdomThemes } from "@/lib/themes";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { fonts, radius, spacing } from "@/theme";

import { VerseCard } from "./verse-row";

export function ThemeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = wisdomThemes.find((x) => x.id === id) ?? wisdomThemes[0];
  const { colors } = useTheme();
  const { language } = useProgress();
  const tr = useTranslations(language);
  const verses = tr.ready ? searchTranslations(theme.query, language, 700) : [];
  const title = t(theme.id, language);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title }} />
      <Screen>
        <Column>
          <View style={{ aspectRatio: 5 / 2, borderRadius: radius.lg, borderCurve: "continuous", overflow: "hidden" }}>
            <Image source={sceneArt[theme.scene]} style={StyleSheet.absoluteFill} contentFit="cover" />
            <LinearGradient colors={["transparent", "rgba(10,12,20,0.75)"]} style={StyleSheet.absoluteFill} />
            <View style={{ flex: 1, justifyContent: "flex-end", padding: spacing.lg }}>
              <Text style={{ fontFamily: fonts.display, fontSize: 20, lineHeight: 26, color: "#FFFFFF" }}>{title}</Text>
              <Text variant="caption" tone="light" style={{ opacity: 0.85 }}>
                {verses.length} {t("verses", language).toLowerCase()}
              </Text>
            </View>
          </View>
        </Column>
        <Column gap={spacing.md}>
          {!tr.ready ? (
            <ActivityIndicator color={colors.accent} />
          ) : verses.length === 0 ? (
            <EmptyState icon="sparkles" title={t("nothingYet", language)} />
          ) : (
            verses.map((v) => <VerseCard key={v.id} verse={v} translation={tr.get(v.id)?.simple ?? ""} language={language} />)
          )}
        </Column>
      </Screen>
    </View>
  );
}
