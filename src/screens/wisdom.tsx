import { router } from "expo-router";
import { useMemo } from "react";
import { ScrollView, View } from "react-native";

import { IconButton } from "@/components/button";
import { Column, PageTitle, Screen, SectionHeader } from "@/components/layout";
import { Chip } from "@/components/misc";
import { SceneBanner } from "@/components/scene-banner";
import { Text } from "@/components/text";
import { toast } from "@/components/toast";
import { t } from "@/i18n";
import { pickDaily } from "@/lib/daily";
import { quotesFor } from "@/lib/gita";
import { shareText } from "@/lib/share";
import { wisdomThemes } from "@/lib/themes";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { fonts, gutter, radius, spacing } from "@/theme";

import { TextLink } from "./home";

export function WisdomScreen() {
  const { colors } = useTheme();
  const { language, isFavorite, toggleFavorite } = useProgress();
  const quotes = quotesFor(language);
  const daily = useMemo(() => pickDaily("wisdom", quotes), [quotes]);
  const rest = quotes.filter((q) => q.id !== daily?.id);

  return (
    <Screen inset="top" bottom="tabs">
      <Column>
        <PageTitle title={t("wisdom", language)} />
        <SceneBanner style={{ aspectRatio: 16 / 11 }} start={3}>
          <Text variant="overline" tone="light" style={{ opacity: 0.85 }}>
            {t("dailyWisdom", language)}
          </Text>
          <Text style={{ fontFamily: fonts.serif, fontSize: 19, lineHeight: 26, color: "#FFFFFF" }} numberOfLines={6}>
            “{daily?.text ?? "When meditation is mastered, the mind is unwavering like the flame of a lamp in a windless place."}”
          </Text>
          <Text variant="footnote" tone="light" style={{ opacity: 0.8 }}>
            {t("gitaQuote", language)}
          </Text>
        </SceneBanner>
      </Column>

      <View style={{ gap: spacing.md }}>
        <Column>
          <SectionHeader
            title={t("wisdomThemesTitle", language)}
            action={<TextLink label={t("viewBtn", language)} onPress={() => router.push("/wisdom/themes")} />}
          />
        </Column>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: gutter, gap: spacing.sm }}>
          {wisdomThemes.map((th) => (
            <Chip key={th.id} label={t(th.id, language)} onPress={() => router.push(`/wisdom/theme/${th.id}`)} />
          ))}
        </ScrollView>
      </View>

      <Column gap={spacing.md}>
        {rest.map((q, i) => {
          const fav = isFavorite(q.id);
          return (
            <View key={q.id} style={{ padding: spacing.xl, gap: spacing.md, borderRadius: radius.lg, borderCurve: "continuous", backgroundColor: colors.surface }}>
              <View style={{ flexDirection: "row", gap: spacing.md }}>
                <Text variant="caption" tone="flame" style={{ width: 22, textAlign: "right", fontVariant: ["tabular-nums"], paddingTop: 4 }}>
                  {i + 1}
                </Text>
                <Text selectable variant="scripture" style={{ flex: 1, fontSize: 17, lineHeight: 27 }}>
                  “{q.text}”
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", paddingLeft: 34 }}>
                <Text variant="caption" tone="soft" style={{ flex: 1 }}>
                  {t("gitaQuote", language)}
                </Text>
                <IconButton
                  icon={fav ? "bookmarkFill" : "bookmark"}
                  label={fav ? t("removedFromFavoritesToast", language) : t("addedToFavoritesToast", language)}
                  color={fav ? colors.accent : colors.inkFaint}
                  size={19}
                  onPress={() => {
                    toggleFavorite(q.id);
                    toast.success(fav ? t("removedFromFavoritesToast", language) : t("addedToFavoritesToast", language));
                  }}
                />
                <IconButton
                  icon="share"
                  label={t("share", language)}
                  color={colors.inkFaint}
                  size={19}
                  onPress={() => shareText(`“${q.text}”\n— Bhagavad Gita`, { url: "https://gitasadhana.com", copiedLabel: t("copiedToClipboardToast", language) })}
                />
              </View>
            </View>
          );
        })}
      </Column>
    </Screen>
  );
}
