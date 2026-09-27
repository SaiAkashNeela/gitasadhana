import { Image } from "expo-image";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, View } from "react-native";

import { t } from "@/i18n";
import { chapterArt, getVerse, useTranslations } from "@/lib/gita";
import { useAudio } from "@/providers/audio";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { radius, spacing, layout } from "@/theme";

import { IconButton } from "./button";
import { Text } from "./text";

/**
 * Now-playing strip. When nothing has been played yet it offers verse 1.1 as
 * "up next", like the original app's always-present mini player.
 */
export function MiniPlayer({ showUpNext = true }: { showUpNext?: boolean }) {
  const { colors } = useTheme();
  const audio = useAudio();
  const { language } = useProgress();
  const tr = useTranslations(language);

  const verse = audio.currentVerse ?? (showUpNext ? getVerse("1.1") : null);
  if (!verse) return null;
  const loaded = !!audio.currentVerse;
  const line = tr.get(verse.id)?.simple ?? "";

  const onPlay = () => {
    if (loaded) audio.toggle();
    else audio.play(verse.id, language);
  };

  return (
    <View
      style={{
        height: layout.miniPlayerHeight,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingLeft: spacing.md,
        paddingRight: spacing.sm,
        marginHorizontal: spacing.md,
        borderRadius: radius.lg,
        borderCurve: "continuous",
        backgroundColor: colors.surfaceRaised,
        boxShadow: "0 2px 10px rgba(15,18,27,0.10)",
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("nowPlaying", language)}
        onPress={() => (loaded ? router.push("/player") : router.push(`/verse/${verse.id}`))}
        style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.md }}
      >
        <Image
          source={chapterArt[verse.chapter]}
          style={{ width: 44, height: 44, borderRadius: radius.sm }}
          contentFit="cover"
        />
        <View style={{ flex: 1, gap: 1 }}>
          <Text variant="footnote" numberOfLines={1} style={{ fontWeight: "600" }}>
            {t("chapterLabel", language)} {verse.chapter} · {t("verseLabel", language)} {verse.verse}
            {!loaded ? <Text variant="caption" tone="accent">{`  ${t("upNext", language)}`}</Text> : null}
          </Text>
          <Text variant="caption" tone="soft" numberOfLines={1}>
            {line}
          </Text>
        </View>
      </Pressable>
      {audio.isBuffering && audio.isPlaying ? (
        <View style={{ width: 40, alignItems: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <IconButton
          icon={loaded && audio.isPlaying ? "pause" : "play"}
          label={loaded && audio.isPlaying ? "Pause" : "Play"}
          onPress={onPlay}
          size={20}
          color={colors.accent}
        />
      )}
    </View>
  );
}
