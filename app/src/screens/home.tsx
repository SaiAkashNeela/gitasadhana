import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";

import { IconButton } from "@/components/button";
import { Icon } from "@/components/icon";
import { Column, PageTitle, Screen, SectionHeader, useColumnInset } from "@/components/layout";
import { ProgressRing } from "@/components/progress";
import { SceneBanner } from "@/components/scene-banner";
import { Text } from "@/components/text";
import { pick, t } from "@/i18n";
import { pickDaily } from "@/lib/daily";
import { allVerses, chapterArt, chapters, getChapter, quotesFor, useTranslations } from "@/lib/gita";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { fonts, gutter, layout, radius, spacing } from "@/theme";

export function HomeScreen() {
  const { colors } = useTheme();
  const inset = useColumnInset();
  // 4:5 at column width, but never taller than 60% of the screen (landscape tablets).
  const { width, height } = useWindowDimensions();
  const bannerHeight = Math.min((Math.min(width - gutter * 2, layout.maxWidth) * 5) / 4, Math.max(360, height * 0.6));
  const { profile, language, notifications, completedVerses, history } = useProgress();
  const tr = useTranslations(language);

  const dailyVerse = useMemo(() => pickDaily("verse", allVerses), []);
  const quotes = quotesFor(language);
  const dailyQuote = useMemo(() => pickDaily("wisdom", quotes), [quotes]);
  const hasUnread = notifications.some((n) => !n.read);

  const verseId = dailyVerse?.id ?? "2.47";
  const verseText = tr.get(verseId)?.simple ?? (tr.ready ? "" : " ");
  const last = history[0];
  const lastChapter = last ? getChapter(last.chapter) : null;

  const chapterProgress = (n: number, total: number) =>
    total > 0 ? completedVerses.filter((id) => id.startsWith(`${n}.`)).length / total : 0;

  return (
    <Screen inset="top" bottom="tabs">
      <Column>
        <PageTitle
          subtitle={`${t("hariOm", language)}, ${profile.name === "Seeker" ? t("seeker", language) : profile.name}`}
          title={t("todaysVerse", language)}
          right={
            <>
              <IconButton icon="chat" label="Gita AI" onPress={() => router.push("/gita-ai")} color={colors.accent} />
              <IconButton
                icon="bell"
                label={t("notifications", language)}
                onPress={() => router.push("/notifications")}
                badge={hasUnread}
              />
            </>
          }
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t("verseOfTheDay", language)}, ${verseId}`}
          onPress={() => router.push(`/verse/${verseId}`)}
          style={({ pressed }) => ({ opacity: pressed ? 0.94 : 1 })}
        >
          <SceneBanner style={{ height: bannerHeight }}>
            <Text variant="overline" tone="light" style={{ opacity: 0.85 }}>
              {t("verseOfTheDay", language)}
            </Text>
            <Text
              style={{ fontFamily: fonts.serif, fontSize: 20, lineHeight: 28, color: "#FFFFFF" }}
              numberOfLines={7}
            >
              {verseText ? `“${verseText}”` : ""}
            </Text>
            <Text variant="footnote" tone="light" style={{ opacity: 0.8 }}>
              {t("bhagavadGita", language)} {verseId}
            </Text>
          </SceneBanner>
        </Pressable>

        {last && lastChapter ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(`/verse/${last.chapter}.${last.verse}`)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.md,
                padding: spacing.md,
                borderRadius: radius.lg,
                borderCurve: "continuous",
                backgroundColor: pressed ? colors.surfaceMuted : colors.surface,
              })}
            >
              <Image source={chapterArt[last.chapter]} style={{ width: 52, height: 52, borderRadius: radius.md }} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="caption" tone="soft">
                  {t("continueReading", language)}
                </Text>
                <Text variant="callout" numberOfLines={1} style={{ fontWeight: "600" }}>
                  {t("chapterLabel", language)} {last.chapter}, {t("verseLabel", language)} {last.verse}
                </Text>
                <Text variant="caption" tone="soft" numberOfLines={1}>
                  {pick(lastChapter.title, language)}
                </Text>
              </View>
              <Icon name="chevronRight" size={14} color={colors.inkFaint} />
            </Pressable>
        ) : null}
      </Column>

      <View style={{ gap: spacing.md }}>
        <Column>
          <SectionHeader
            title={t("chapters", language)}
            action={<TextLink label={t("allBtn", language)} onPress={() => router.navigate("/chapters")} />}
          />
        </Column>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: inset, gap: spacing.lg }}
        >
          {chapters.map((c) => (
            <Pressable
              key={c.number}
              accessibilityRole="button"
              accessibilityLabel={`${t("chapterLabel", language)} ${c.number}, ${pick(c.title, language)}`}
              onPress={() => router.push(`/chapter/${c.number}`)}
              style={({ pressed }) => ({ width: 84, alignItems: "center", gap: spacing.sm, opacity: pressed ? 0.8 : 1 })}
            >
              <View style={{ width: 76, height: 76, alignItems: "center", justifyContent: "center" }}>
                <ProgressRing size={76} value={chapterProgress(c.number, c.verseCount)} />
                <Image source={chapterArt[c.number]} style={{ width: 66, height: 66, borderRadius: 33 }} />
              </View>
              <Text variant="caption" center numberOfLines={2} style={{ fontFamily: fonts.display, fontSize: 12.5, lineHeight: 16 }}>
                {pick(c.title, language)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <Column>
        <SectionHeader
          title={t("yourJourney", language)}
          action={<TextLink label={t("viewBtn", language)} onPress={() => router.push("/journey")} />}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/journey")}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.lg,
            padding: spacing.lg,
            borderRadius: radius.lg,
            borderCurve: "continuous",
            backgroundColor: pressed ? colors.surfaceMuted : colors.surface,
          })}
        >
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.flameSoft, alignItems: "center", justifyContent: "center" }}>
            <Icon name="flameFill" size={22} color={colors.flame} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="heading">
              {profile.streak} {t("dayStreak", language)}
            </Text>
            <Text variant="footnote" tone="soft">
              {profile.versesRead} {t("verses", language).toLowerCase()} · {profile.minutes} {t("minutes", language).toLowerCase()}
            </Text>
          </View>
          <Icon name="chevronRight" size={14} color={colors.inkFaint} />
        </Pressable>
      </Column>

      <Column>
        <SectionHeader
          title={t("wisdomForToday", language)}
          action={<TextLink label={t("exploreBtn", language)} onPress={() => router.navigate("/wisdom")} />}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => router.navigate("/wisdom")}
          style={({ pressed }) => ({
            padding: spacing.xl,
            gap: spacing.md,
            borderRadius: radius.lg,
            borderCurve: "continuous",
            backgroundColor: pressed ? colors.surfaceMuted : colors.surface,
          })}
        >
          <Text style={{ fontFamily: fonts.devanagariMedium, fontSize: 22, lineHeight: 30, color: colors.flame }}>ॐ</Text>
          <Text variant="scripture">“{dailyQuote?.text ?? ""}”</Text>
          <Text variant="footnote" tone="soft">
            {t("gitaQuote", language)}
          </Text>
        </Pressable>
      </Column>
    </Screen>
  );
}

export function TextLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="link" onPress={onPress} hitSlop={10}>
      {({ pressed }) => (
        <Text variant="footnote" tone="accent" style={{ fontWeight: "600", opacity: pressed ? 0.6 : 1 }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
