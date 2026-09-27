import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { IconButton } from "@/components/button";
import { Column, PageTitle, Screen } from "@/components/layout";
import { EmptyState, Segmented } from "@/components/misc";
import { Text } from "@/components/text";
import { t } from "@/i18n";
import { getVerse, quotesFor, useTranslations, type Quote, type Verse } from "@/lib/gita";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { radius, spacing } from "@/theme";

import { VerseCard } from "./verse-row";

/** Favourited quotes are stored by id (e.g. "en-3"); find their text in any language. */
function findQuote(id: string): Quote | undefined {
  const lang = id.split("-")[0];
  return quotesFor(lang).find((q) => q.id === id);
}

export function BookmarksScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<"bookmarks" | "favorites">(params.tab === "favorites" ? "favorites" : "bookmarks");
  const { colors } = useTheme();
  const { bookmarks, favorites, language, removeBookmark, toggleFavorite } = useProgress();
  const tr = useTranslations(language);

  const saved = bookmarks.map((id) => getVerse(id)).filter(Boolean) as Verse[];
  const favVerses = favorites.map((id) => getVerse(id)).filter(Boolean) as Verse[];
  const favQuotes = favorites.map(findQuote).filter(Boolean) as Quote[];
  const wisdomCount = favVerses.length + favQuotes.length;

  return (
    <Screen inset="top" bottom="tabs" gap={spacing.xl}>
      <Column>
        <PageTitle title={t("savedWisdom", language)} />
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: "bookmarks", label: `${t("verseSaves", language)} (${saved.length})` },
            { value: "favorites", label: `${t("wisdomSaves", language)} (${wisdomCount})` },
          ]}
        />
      </Column>

      <Column gap={spacing.md}>
        {tab === "bookmarks" ? (
          saved.length === 0 ? (
            <EmptyState icon="bookmark" title={t("noSavedBookmarks", language)} body={t("noSavedBookmarksSub", language)} />
          ) : (
            saved.map((v) => (
              <VerseCard
                key={v.id}
                verse={v}
                language={language}
                translation={tr.get(v.id)?.simple ?? ""}
                right={<IconButton icon="trash" label={t("delete", language)} size={17} color={colors.inkFaint} onPress={() => removeBookmark(v.id)} />}
              />
            ))
          )
        ) : wisdomCount === 0 ? (
          <EmptyState icon="heart" title={t("noFavorites", language)} body={t("noFavoritesSub", language)} />
        ) : (
          <>
            {favVerses.map((v) => (
              <VerseCard
                key={v.id}
                verse={v}
                language={language}
                translation={tr.get(v.id)?.simple ?? ""}
                right={<IconButton icon="trash" label={t("delete", language)} size={17} color={colors.inkFaint} onPress={() => toggleFavorite(v.id)} />}
              />
            ))}
            {favQuotes.map((q) => (
              <View key={q.id} style={{ padding: spacing.lg, gap: spacing.sm, borderRadius: radius.lg, borderCurve: "continuous", backgroundColor: colors.surface }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text variant="overline" tone="flame">
                    {t("gitaQuote", language)}
                  </Text>
                  <IconButton icon="trash" label={t("delete", language)} size={17} color={colors.inkFaint} onPress={() => toggleFavorite(q.id)} />
                </View>
                <Text selectable variant="scripture" style={{ fontSize: 17, lineHeight: 27 }}>
                  “{q.text}”
                </Text>
              </View>
            ))}
          </>
        )}
      </Column>
    </Screen>
  );
}

