import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { IconButton } from "@/components/button";
import { Icon } from "@/components/icon";
import { Column, PageTitle, Screen } from "@/components/layout";
import { EmptyState, SearchField } from "@/components/misc";
import { ProgressBar } from "@/components/progress";
import { Text } from "@/components/text";
import { pick, t } from "@/i18n";
import { chapterArt, chapters } from "@/lib/gita";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { radius, spacing, fonts } from "@/theme";

export function ChaptersScreen() {
  const { colors } = useTheme();
  const { language, completedVerses } = useProgress();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const list = chapters.filter(
    (c) => !q || pick(c.title, language).toLowerCase().includes(q) || pick(c.summary, language).toLowerCase().includes(q),
  );

  return (
    <Screen inset="top" bottom="tabs" gap={spacing.xl}>
      <Column>
        <PageTitle
          title={t("chapters", language)}
          right={<IconButton icon="search" label={t("searchTitle", language)} onPress={() => router.push("/search")} />}
        />
        <Text variant="callout" tone="soft" style={{ fontStyle: "italic" }}>
          {t("exploreChaptersDesc", language)}
        </Text>
        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder={t("searchChaptersPlaceholder", language)}
          accessibilityLabel={t("searchChaptersPlaceholder", language)}
        />
      </Column>

      <Column gap={0}>
        {list.length === 0 ? (
          <EmptyState icon="book" title={t("noMatchingChapters", language)} />
        ) : (
          <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, borderCurve: "continuous", overflow: "hidden" }}>
            {list.map((c, i) => {
              const read = completedVerses.filter((id) => id.startsWith(`${c.number}.`)).length;
              return (
                <Pressable
                  key={c.number}
                  accessibilityRole="button"
                  accessibilityLabel={`${t("chapterLabel", language)} ${c.number}, ${pick(c.title, language)}`}
                  onPress={() => router.push(`/chapter/${c.number}`)}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.lg,
                    padding: spacing.md,
                    backgroundColor: pressed ? colors.surfaceMuted : "transparent",
                    borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
                    borderTopColor: colors.hairline,
                  })}
                >
                  <Image
                    source={chapterArt[c.number]}
                    style={{ width: 76, height: 76, borderRadius: radius.md }}
                    contentFit="cover"
                  />
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text variant="overline" tone="flame">
                      {t("chapterLabel", language)} {c.number}
                    </Text>
                    <Text variant="subheading" numberOfLines={1} style={{ fontFamily: fonts.display }}>
                      {pick(c.title, language)}
                    </Text>
                    <Text variant="footnote" tone="soft" numberOfLines={1}>
                      {pick(c.summary, language)}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: 4 }}>
                      <View style={{ flex: 1 }}>
                        <ProgressBar value={read / c.verseCount} height={3} />
                      </View>
                      <Text variant="caption" tone="faint" style={{ fontVariant: ["tabular-nums"] }}>
                        {read}/{c.verseCount}
                      </Text>
                    </View>
                  </View>
                  <Icon name="chevronRight" size={14} color={colors.inkFaint} />
                </Pressable>
              );
            })}
          </View>
        )}
      </Column>
    </Screen>
  );
}
