import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/icon";
import { Column } from "@/components/layout";
import { EmptyState, SearchField } from "@/components/misc";
import { MiniPlayer } from "@/components/mini-player";
import { ProgressBar } from "@/components/progress";
import { Text } from "@/components/text";
import { pick, t } from "@/i18n";
import { getChapter, useTranslations, versesInChapter } from "@/lib/gita";
import { useAudio } from "@/providers/audio";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { gutter, layout, radius, spacing } from "@/theme";

/** Now-playing strip for pushed screens that have no tab bar. */
export function FloatingPlayer() {
  const { currentVerse } = useAudio();
  const insets = useSafeAreaInsets();
  if (!currentVerse) return null;
  return (
    <View style={{ pointerEvents: "box-none", position: "absolute", left: 0, right: 0, bottom: insets.bottom + spacing.sm, paddingHorizontal: spacing.md, alignItems: "center" }}>
      <MiniPlayer showUpNext={false} />
    </View>
  );
}

export function ChapterVersesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const n = Number(id);
  const chapter = getChapter(n);
  const { colors } = useTheme();
  const { language, isCompleted, toggleCompleted } = useProgress();
  const tr = useTranslations(language);
  const [query, setQuery] = useState("");
  const insets = useSafeAreaInsets();
  const { currentVerse } = useAudio();

  if (!chapter) return null;
  const verses = versesInChapter(n);
  const done = verses.filter((v) => isCompleted(v.id)).length;
  const q = query.trim().toLowerCase();
  const list = verses.filter((v) => {
    if (!q) return true;
    const text = tr.get(v.id)?.simple ?? "";
    return `verse ${v.verse}`.includes(q) || `${v.verse}`.includes(q) || text.toLowerCase().includes(q) || v.sanskrit.toLowerCase().includes(q);
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: pick(chapter.title, language) }} />
      <FlatList
        data={list}
        keyExtractor={(v) => v.id}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{
          paddingTop: spacing.lg,
          paddingBottom: insets.bottom + (currentVerse ? layout.miniPlayerHeight + spacing.xxl : spacing.xxxl),
          width: "100%",
          maxWidth: layout.maxWidth + gutter * 2,
          alignSelf: "center",
        }}
        ListHeaderComponent={
          <Column style={{ paddingHorizontal: 0, marginBottom: spacing.lg }} gap={spacing.lg}>
            <View style={{ gap: spacing.sm, paddingHorizontal: gutter }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="footnote" tone="soft">
                  {t("chapterLabel", language)} {n} · {done} / {chapter.verseCount} {t("readLabel", language).toLowerCase()}
                </Text>
                <Text variant="footnote" tone="accent" style={{ fontWeight: "600" }}>
                  {Math.round((done / chapter.verseCount) * 100)}%
                </Text>
              </View>
              <ProgressBar value={done / chapter.verseCount} />
            </View>
            <View style={{ paddingHorizontal: gutter }}>
              <SearchField value={query} onChangeText={setQuery} placeholder={t("searchPlaceholder", language)} accessibilityLabel={t("searchPlaceholder", language)} />
            </View>
          </Column>
        }
        ListEmptyComponent={<EmptyState icon="search" title={t("nothingYet", language)} />}
        renderItem={({ item: v, index }) => {
          const completed = isCompleted(v.id);
          return (
            <View style={{ paddingHorizontal: gutter }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.surface,
                  borderTopLeftRadius: index === 0 ? radius.lg : 0,
                  borderTopRightRadius: index === 0 ? radius.lg : 0,
                  borderBottomLeftRadius: index === list.length - 1 ? radius.lg : 0,
                  borderBottomRightRadius: index === list.length - 1 ? radius.lg : 0,
                  borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
                  borderTopColor: colors.hairline,
                  overflow: "hidden",
                }}
              >
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: completed }}
                  accessibilityLabel={`${t("verseLabel", language)} ${v.verse}`}
                  hitSlop={6}
                  onPress={() => toggleCompleted(v.id)}
                  style={{ paddingLeft: spacing.lg, paddingRight: spacing.sm, paddingVertical: spacing.lg }}
                >
                  <Icon name={completed ? "checkCircle" : "circle"} size={22} color={completed ? colors.accent : colors.inkFaint} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push(`/verse/${v.id}`)}
                  style={({ pressed }) => ({
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.md,
                    paddingVertical: spacing.md,
                    paddingRight: spacing.lg,
                    paddingLeft: spacing.sm,
                    backgroundColor: pressed ? colors.surfaceMuted : "transparent",
                  })}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text variant="callout" style={{ fontWeight: "600" }}>
                      {t("verseLabel", language)} {v.verse}
                    </Text>
                    <Text variant="footnote" tone="soft" numberOfLines={1}>
                      {tr.get(v.id)?.simple ?? ""}
                    </Text>
                  </View>
                  <Icon name="chevronRight" size={14} color={colors.inkFaint} />
                </Pressable>
              </View>
            </View>
          );
        }}
      />
      <FloatingPlayer />
    </View>
  );
}
