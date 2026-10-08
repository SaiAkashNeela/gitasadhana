import { Image } from "expo-image";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconButton } from "@/components/button";
import { Icon } from "@/components/icon";
import { EmptyState } from "@/components/misc";
import { SeekBar } from "@/components/seek-bar";
import { Text } from "@/components/text";
import { toast } from "@/components/toast";
import { pick, t, tf } from "@/i18n";
import { chapterArt, getChapter, useTranslations } from "@/lib/gita";
import { tap } from "@/lib/haptics";
import { shareText } from "@/lib/share";
import { useAudio } from "@/providers/audio";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { fonts, gutter, radius, spacing } from "@/theme";

export function PlayerScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  // Artwork grows on tall screens (tablets) instead of staying phone-sized.
  const { height } = useWindowDimensions();
  const audio = useAudio();
  const { language, isFavorite, toggleFavorite } = useProgress();
  const tr = useTranslations(audio.requestedLanguage || language);
  const verse = audio.currentVerse;

  const close = () => (router.canGoBack() ? router.back() : router.replace("/home"));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: process.env.EXPO_OS === "ios" ? spacing.lg : insets.top + spacing.sm }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md }}>
        <IconButton icon="chevronDown" label={t("back", language)} onPress={close} />
        <Text variant="overline" tone="soft">
          {t("nowPlaying", language)}
        </Text>
        {verse ? (
          <IconButton
            icon="share"
            label={t("share", language)}
            onPress={() =>
              shareText(tf("shareVerseMessage", language, { id: verse.id, text: tr.get(verse.id)?.simple ?? "" }), {
                url: "https://gitasadhana.com",
                copiedLabel: t("copiedToClipboardToast", language),
              })
            }
          />
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {!verse ? (
        <EmptyState icon="headphones" title={t("noAudioLoadedTitle", language)} body={t("noAudioLoadedSub", language)} />
      ) : (
        <View style={{ flex: 1, paddingHorizontal: gutter, paddingBottom: insets.bottom + spacing.xl, justifyContent: "space-evenly", width: "100%", maxWidth: 520, alignSelf: "center" }}>
          <Image
            source={chapterArt[verse.chapter]}
            style={{ width: "100%", aspectRatio: 1, maxHeight: Math.min(480, Math.max(360, height * 0.38)), alignSelf: "center", borderRadius: radius.xl }}
            contentFit="cover"
            accessibilityLabel={pick(getChapter(verse.chapter)?.title, language)}
          />
          <View style={{ gap: spacing.sm, alignItems: "center" }}>
            <Text variant="title" center>
              {t("chapterLabel", language)} {verse.chapter}, {t("verseLabel", language)} {verse.verse}
            </Text>
            <Text variant="footnote" tone="soft" center>
              {pick(getChapter(verse.chapter)?.title, language)} · {t("recitationAndCommentary", language)}
            </Text>
            <Text variant="callout" tone="soft" center numberOfLines={3} style={{ fontFamily: fonts.serifItalic, marginTop: spacing.xs }}>
              “{tr.get(verse.id)?.simple ?? ""}”
            </Text>
            {audio.requestedLanguage !== audio.currentLanguage ? (
              <Text variant="caption" tone="faint" center>
                {t("audioFallbackNotice", language)}
              </Text>
            ) : null}
          </View>
          <SeekBar current={audio.currentTime} duration={audio.duration} onSeek={audio.seek} />
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xxl }}>
            <IconButton icon="back10" label={t("back10", language)} size={26} onPress={() => audio.seek(audio.currentTime - 10)} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t(audio.isPlaying ? "pause" : "play", language)}
              onPress={() => {
                tap();
                audio.toggle();
              }}
              style={({ pressed }) => ({
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: colors.accent,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.85 : 1,
              })}
            >
              {audio.isBuffering ? <ActivityIndicator color={colors.onAccent} /> : <Icon name={audio.isPlaying ? "pause" : "play"} size={30} color={colors.onAccent} />}
            </Pressable>
            <IconButton icon="forward10" label={t("forward10", language)} size={26} onPress={() => audio.seek(Math.min(audio.duration, audio.currentTime + 10))} />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={tf("playbackSpeedRate", language, { rate: audio.rate })}
              onPress={audio.cycleRate}
              style={({ pressed }) => ({
                minWidth: 52,
                height: 36,
                paddingHorizontal: spacing.md,
                borderRadius: radius.full,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: pressed ? colors.surfaceMuted : colors.accentSoft,
              })}
            >
              <Text variant="footnote" tone="accent" style={{ fontWeight: "700" }}>
                {audio.rate}x
              </Text>
            </Pressable>
            <IconButton
              icon={isFavorite(verse.id) ? "heartFill" : "heart"}
              label={t("favorites", language)}
              color={isFavorite(verse.id) ? colors.flame : colors.inkSoft}
              onPress={() => {
                const was = isFavorite(verse.id);
                toggleFavorite(verse.id);
                toast.success(t(was ? "removedFromFavoritesToast" : "addedToFavoritesToast", language));
              }}
            />
            <IconButton
              icon="book"
              label={t("verseLabel", language)}
              color={colors.inkSoft}
              onPress={() => {
                close();
                router.push(`/verse/${verse.id}`);
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}
