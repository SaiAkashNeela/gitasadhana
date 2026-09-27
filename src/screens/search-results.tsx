import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/misc";
import { Text } from "@/components/text";
import { t } from "@/i18n";
import { searchVerses, useTranslations } from "@/lib/gita";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { gutter, layout, spacing } from "@/theme";

import { VerseCard } from "./verse-row";

export function SearchResultsScreen() {
  const { q = "" } = useLocalSearchParams<{ q?: string }>();
  const { colors } = useTheme();
  const { language } = useProgress();
  const tr = useTranslations(language);
  const insets = useSafeAreaInsets();
  const results = tr.ready ? searchVerses(q, language) : [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: `“${q}”` }} />
      <FlatList
        data={results}
        keyExtractor={(v) => v.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingHorizontal: gutter,
          paddingTop: spacing.lg,
          paddingBottom: insets.bottom + spacing.xxxl,
          gap: spacing.md,
          width: "100%",
          maxWidth: layout.maxWidth + gutter * 2,
          alignSelf: "center",
        }}
        ListHeaderComponent={
          tr.ready ? (
            <Text variant="footnote" tone="soft">
              {results.length} {t("versesFound", language)}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          tr.ready ? (
            <EmptyState icon="search" title={t("nothingYet", language)} body={t("tryDifferentWord", language)} />
          ) : (
            <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xxxl }} />
          )
        }
        renderItem={({ item }) => <VerseCard verse={item} translation={tr.get(item.id)?.simple ?? ""} language={language} />}
      />
    </View>
  );
}
