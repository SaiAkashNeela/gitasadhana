import { router, Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

import { Button } from "@/components/button";
import { Column, Screen } from "@/components/layout";
import { EmptyState } from "@/components/misc";
import { Text } from "@/components/text";
import { t } from "@/i18n";
import { getVerse, normalizeVerseId, parseWordMeanings } from "@/lib/gita";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { fonts, radius, spacing } from "@/theme";

export function WordsScreen() {
  const { id: raw } = useLocalSearchParams<{ id: string }>();
  const id = normalizeVerseId(raw ?? "2.47");
  const verse = getVerse(id);
  const { colors } = useTheme();
  const { language } = useProgress();
  const words = parseWordMeanings(verse?.wordMeanings ?? "");

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: `${t("wordMeanings", language)} · ${id}` }} />
      <Screen>
        {language !== "en" ? (
          <EmptyState
            icon="language"
            title={t("languageNotSupported", language)}
            body={t("wordBreakdownAvailableEnglish", language)}
            action={<Button size="sm" title={t("switchToEnglish", language)} onPress={() => router.push("/language")} />}
          />
        ) : (
          <>
            <Column>
              <Text selectable center style={{ fontFamily: fonts.devanagari, fontSize: 20, lineHeight: 36, color: colors.ink }}>
                {verse?.sanskrit}
              </Text>
            </Column>
            <Column>
              {words.length === 0 ? (
                <EmptyState icon="words" title={t("noWordBreakdown", language)} />
              ) : (
                <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, borderCurve: "continuous", overflow: "hidden" }}>
                  {words.map((w, i) => (
                    <View
                      key={`${w.word}-${i}`}
                      style={{
                        flexDirection: "row",
                        gap: spacing.lg,
                        paddingHorizontal: spacing.lg,
                        paddingVertical: spacing.md,
                        borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
                        borderTopColor: colors.hairline,
                      }}
                    >
                      <Text selectable style={{ flex: 1, fontFamily: fonts.serifItalic, fontSize: 16, lineHeight: 24, color: colors.ink }}>
                        {w.word}
                      </Text>
                      <Text selectable variant="callout" tone="soft" style={{ flex: 1, textAlign: "right" }}>
                        {w.meaning}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </Column>
          </>
        )}
      </Screen>
    </View>
  );
}
