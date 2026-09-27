import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, IconButton } from "@/components/button";
import { Icon } from "@/components/icon";
import { Column } from "@/components/layout";
import { EmptyState } from "@/components/misc";
import { OmRule } from "@/components/ornament";
import { ProgressRing } from "@/components/progress";
import { SeekBar } from "@/components/seek-bar";
import { Text } from "@/components/text";
import { toast } from "@/components/toast";
import { pick, t } from "@/i18n";
import { audioLanguageFor } from "@/lib/audio-source";
import { confirm } from "@/lib/confirm";
import { downloadsSupported } from "@/lib/downloads";
import { adjacentVerse, getChapter, getVerse, normalizeVerseId, useTranslations } from "@/lib/gita";
import { tap } from "@/lib/haptics";
import { shareText } from "@/lib/share";
import { useAudio } from "@/providers/audio";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { fonts, gutter, layout, radius, spacing } from "@/theme";

export function VerseScreen() {
  const params = useLocalSearchParams<{ id: string; autoplay?: string }>();
  const id = normalizeVerseId(params.id ?? "2.47");
  const verse = getVerse(id);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const progress = useProgress();
  const { language, fontSize, isBookmarked, addBookmark, removeBookmark, isCompleted, toggleCompleted, addHistory, markCompleted, autoPlayOnOpen } =
    progress;
  const audio = useAudio();
  const tr = useTranslations(language);
  const scroll = useRef<ScrollView>(null);

  const isCurrent = audio.currentVerse?.id === id;
  const playing = isCurrent && audio.isPlaying;

  // Opening a verse records it in history and marks it read, as before.
  useEffect(() => {
    if (!verse) return;
    addHistory(verse.chapter, verse.verse);
    markCompleted(id);
    scroll.current?.scrollTo({ y: 0, animated: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!verse) return;
    const wantsPlay = params.autoplay === "1" || autoPlayOnOpen;
    if (wantsPlay && !(isCurrent && audio.isPlaying)) audio.play(id, language);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!verse) {
    return <EmptyState icon="book" title={t("nothingYet", language)} />;
  }

  const chapter = getChapter(verse.chapter);
  const translation = tr.get(id);
  const saved = isBookmarked(id);
  const completed = isCompleted(id);
  const prev = adjacentVerse(id, -1);
  const next = adjacentVerse(id, 1);

  const go = (target: string | null, edge: "start" | "end") => {
    if (!target) {
      toast.info(t(edge === "start" ? "startOfChapterToast" : "endOfChapterToast", language));
      return;
    }
    router.replace(playing ? `/verse/${target}?autoplay=1` : `/verse/${target}`);
  };

  const onPlay = () => {
    tap();
    if (isCurrent) audio.toggle();
    else audio.play(id, language);
  };

  const scriptureSize = fontSize + 2;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          title: `${t("verseLabel", language)} ${id}`,
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: spacing.xxs }}>
              <IconButton
                icon={completed ? "checkCircle" : "circle"}
                label={completed ? t("verseUnmarked", language) : t("verseMarkedCompleted", language)}
                color={completed ? colors.accent : colors.inkSoft}
                onPress={() => toggleCompleted(id)}
              />
              <IconButton
                icon={saved ? "bookmarkFill" : "bookmark"}
                label={saved ? t("bookmarkRemovedToast", language) : t("bookmarkSavedToast", language)}
                color={saved ? colors.accent : colors.inkSoft}
                onPress={() => {
                  if (saved) {
                    removeBookmark(id);
                    toast.info(t("bookmarkRemovedToast", language));
                  } else {
                    addBookmark(id);
                    toast.success(t("bookmarkSavedToast", language));
                  }
                }}
              />
              <IconButton
                icon="share"
                label={t("share", language)}
                color={colors.inkSoft}
                onPress={() =>
                  shareText(
                    `Hare Krishna! \nCheck out this wisdom from Bhagavad Gita (Verse ${id}):\n\n"${translation?.simple ?? ""}"\n\nRead more in Gita Sadhana App.`,
                    { title: `Bhagavad Gita Verse ${id}`, url: "https://gitasadhana.com", copiedLabel: t("linkCopiedToast", language) },
                  )
                }
              />
            </View>
          ),
        }}
      />

      <ScrollView
        ref={scroll}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.xxl }}
      >
        <Column gap={spacing.xs}>
          <Text variant="overline" tone="flame" center>
            {t("chapterLabel", language)} {verse.chapter} · {pick(chapter?.title, language)}
          </Text>
        </Column>

        <Column gap={spacing.lg}>
          <Text
            selectable
            center
            style={{ fontFamily: fonts.devanagari, fontSize: scriptureSize + 4, lineHeight: (scriptureSize + 4) * 1.85, color: colors.ink }}
          >
            {verse.sanskrit}
          </Text>
          {verse.transliteration ? (
            <Text
              selectable
              center
              style={{ fontFamily: fonts.serifItalic, fontSize: scriptureSize - 2, lineHeight: (scriptureSize - 2) * 1.6, color: colors.inkSoft }}
            >
              {verse.transliteration}
            </Text>
          ) : null}
          <OmRule />
        </Column>

        <Column gap={spacing.md}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text variant="overline" tone="accent">
              {t("translation", language)}
            </Text>
            {language === "en" ? (
              <Pressable accessibilityRole="link" hitSlop={10} onPress={() => router.push(`/verse/${id}/words`)}>
                <Text variant="caption" tone="accent" style={{ fontWeight: "600" }}>
                  {t("wordMeaningsBtn", language)}
                </Text>
              </Pressable>
            ) : null}
          </View>
          {translation ? (
            <Text selectable style={{ fontFamily: fonts.serif, fontSize: scriptureSize, lineHeight: scriptureSize * 1.62, color: colors.ink }}>
              {translation.simple}
            </Text>
          ) : tr.error ? (
            <Button variant="secondary" size="sm" title="Retry" onPress={tr.retry} style={{ alignSelf: "flex-start" }} />
          ) : (
            <ActivityIndicator color={colors.accent} style={{ alignSelf: "flex-start" }} />
          )}
        </Column>

        {translation && (translation.deep || translation.essence) ? (
          <Column>
            <View
              style={{
                padding: spacing.xl,
                gap: spacing.md,
                borderRadius: radius.lg,
                borderCurve: "continuous",
                backgroundColor: colors.surface,
                borderLeftWidth: 3,
                borderLeftColor: colors.flame,
              }}
            >
              <Pressable
                accessibilityRole="link"
                onPress={() => router.push(`/verse/${id}/commentary`)}
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
              >
                <Text variant="overline" tone="flame">
                  {t("reflectionAndEssence", language)}
                </Text>
                <Icon name="chevronRight" size={12} color={colors.flame} />
              </Pressable>
              {translation.deep ? (
                <Text selectable style={{ fontFamily: fonts.serif, fontSize: fontSize + 1, lineHeight: (fontSize + 1) * 1.62, color: colors.ink }}>
                  {translation.deep}
                </Text>
              ) : null}
              {translation.deep && translation.essence ? <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.hairline }} /> : null}
              {translation.essence ? (
                <Text selectable variant="callout" tone="soft" style={{ fontSize: fontSize - 1, lineHeight: (fontSize - 1) * 1.55 }}>
                  {translation.essence}
                </Text>
              ) : null}
            </View>
          </Column>
        ) : null}
      </ScrollView>

      {/* Player dock */}
      <View
        style={{
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + spacing.md,
          paddingHorizontal: gutter,
          backgroundColor: colors.surface,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.hairline,
          gap: spacing.sm,
        }}
      >
        <View style={{ width: "100%", maxWidth: layout.maxWidth, alignSelf: "center", gap: spacing.sm }}>
          {isCurrent && audio.requestedLanguage !== audio.currentLanguage ? (
            <Text variant="caption" tone="soft" center>
              {t("audioFallbackNotice", language)}
            </Text>
          ) : null}
          <SeekBar current={isCurrent ? audio.currentTime : 0} duration={isCurrent ? audio.duration : 0} onSeek={audio.seek} disabled={!isCurrent} />
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <IconButton
              icon={audio.isLooping ? "repeatOne" : "repeat"}
              label={t(audio.isLooping ? "repeatDisabledToast" : "repeatEnabledToast", language)}
              color={audio.isLooping ? colors.accent : colors.inkFaint}
              onPress={audio.toggleLooping}
            />
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.lg }}>
              <IconButton icon="previous" label="Previous verse" onPress={() => go(prev, "start")} disabled={!prev} color={colors.ink} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={playing ? "Pause" : "Play"}
                onPress={onPlay}
                style={({ pressed }) => ({
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: colors.accent,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                {isCurrent && audio.isBuffering ? (
                  <ActivityIndicator color={colors.onAccent} />
                ) : (
                  <Icon name={playing ? "pause" : "play"} size={26} color={colors.onAccent} />
                )}
              </Pressable>
              <IconButton icon="next" label="Next verse" onPress={() => go(next, "end")} disabled={!next} color={colors.ink} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Playback speed ${audio.rate}x`}
                onPress={audio.cycleRate}
                hitSlop={6}
                style={({ pressed }) => ({
                  minWidth: 44,
                  height: 30,
                  paddingHorizontal: spacing.sm,
                  borderRadius: radius.full,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: pressed ? colors.surfaceMuted : colors.accentSoft,
                })}
              >
                <Text variant="caption" tone="accent" style={{ fontWeight: "700", fontVariant: ["tabular-nums"] }}>
                  {audio.rate}x
                </Text>
              </Pressable>
              {downloadsSupported ? <DownloadButton verseId={id} /> : null}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function DownloadButton({ verseId }: { verseId: string }) {
  const { colors } = useTheme();
  const { language, isVerseDownloaded, downloading, downloadVerse, deleteVerseDownload } = useProgress();
  const task = downloading[`verse:${verseId}`];
  if (task !== undefined) {
    return (
      <View style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }} accessibilityLabel={`Downloading ${task}%`}>
        <ProgressRing size={24} value={task / 100} color={colors.accent} />
      </View>
    );
  }
  if (isVerseDownloaded(verseId)) {
    return (
      <IconButton
        icon="downloaded"
        label={`${t("savedOfflineLabel", language)} — ${t("tapToDelete", language)}`}
        color={colors.accent}
        onPress={async () => {
          const ok = await confirm({
            title: `${t("deleteVerseConfirm", language)} ${verseId}?`,
            confirmLabel: t("delete", language),
            cancelLabel: t("cancel", language),
            destructive: true,
          });
          if (ok) deleteVerseDownload(verseId);
        }}
      />
    );
  }
  return (
    <IconButton
      icon="download"
      label={`${t("downloadForOffline", language)} (${audioLanguageFor(language)})`}
      color={colors.inkFaint}
      onPress={() => downloadVerse(verseId)}
    />
  );
}
