import { Stack } from "expo-router";
import { View } from "react-native";

import { Column, Screen } from "@/components/layout";
import { EmptyState } from "@/components/misc";
import { t } from "@/i18n";
import { getVerse, useTranslations, type Verse } from "@/lib/gita";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { spacing } from "@/theme";

import { VerseCard } from "./verse-row";

export function FavoritesScreen() {
  const { colors } = useTheme();
  const { favorites, language } = useProgress();
  const tr = useTranslations(language);
  const verses = favorites.map((id) => getVerse(id)).filter(Boolean) as Verse[];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: `${t("favorites", language)} · ${verses.length}` }} />
      <Screen>
        <Column gap={spacing.md}>
          {verses.length === 0 ? (
            <EmptyState icon="heart" title={t("noFavorites", language)} body={t("noFavoritesSub", language)} />
          ) : (
            verses.map((v) => <VerseCard key={v.id} verse={v} language={language} translation={tr.get(v.id)?.simple ?? ""} />)
          )}
        </Column>
      </Screen>
    </View>
  );
}
