import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useWindowDimensions, View } from "react-native";

import { Button, IconButton } from "@/components/button";
import { Column, Screen } from "@/components/layout";
import { Stat } from "@/components/misc";
import { ProgressBar } from "@/components/progress";
import { Text } from "@/components/text";
import { pick, t, tf } from "@/i18n";
import { downloadsSupported } from "@/lib/downloads";
import { chapterArt, getChapter } from "@/lib/gita";
import { confirm } from "@/lib/confirm";
import { shareText } from "@/lib/share";
import { APPROX_MB_PER_VERSE } from "@/lib/audio-source";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { spacing } from "@/theme";

import { FloatingPlayer } from "./chapter-verses";

export function ChapterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const n = Number(id);
  const chapter = getChapter(n);
  const { colors } = useTheme();
  // Square on phones; full-width and at most 520pt tall on tablets.
  const { width } = useWindowDimensions();
  const { language, completedVerses, downloading, downloadChapter, deleteChapterDownload, isChapterDownloaded } = useProgress();

  if (!chapter) return null;
  const title = pick(chapter.title, language);
  const read = completedVerses.filter((v) => v.startsWith(`${n}.`)).length;
  const task = downloading[`chapter:${n}`];
  const offline = isChapterDownloaded(n);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          title: "",
          headerTransparent: true,
          headerStyle: { backgroundColor: "transparent" },
          headerTintColor: "#FFFFFF",
          headerRight: () => (
            <IconButton
              icon="share"
              label={t("share", language)}
              color="#FFFFFF"
              onPress={() =>
                shareText(tf("shareChapterMessage", language, { n, title, summary: pick(chapter.summary, language) }), {
                  title,
                  url: "https://gitasadhana.com",
                  copiedLabel: t("copiedToClipboardToast", language),
                })
              }
            />
          ),
        }}
      />
      <Screen contentInsetAdjustmentBehavior="never" bottom="player" contentStyle={{ paddingTop: 0 }}>
        <View style={{ height: Math.min(width, 520), width: "100%" }}>
          <Image source={chapterArt[n]} style={{ flex: 1 }} contentFit="cover" accessibilityLabel={title} />
          <LinearGradient
            colors={["rgba(10,12,20,0.55)", "transparent"]}
            style={{ position: "absolute", top: 0, left: 0, right: 0, height: 140 }}
          />
          <LinearGradient
            colors={["transparent", colors.background]}
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 160 }}
          />
        </View>

        <Column style={{ marginTop: -spacing.xxxl }} gap={spacing.md}>
          <Text variant="overline" tone="flame">
            {t("chapterLabel", language)} {n}
          </Text>
          <Text variant="display" accessibilityRole="header">
            {title}
          </Text>
          <Text variant="subheading" tone="soft" style={{ fontStyle: "italic" }}>
            {pick(chapter.summary, language)}
          </Text>
        </Column>

        <Column>
          <Text variant="body" tone="soft" selectable>
            {pick(chapter.fullSummary, language)}
          </Text>
        </Column>

        <Column>
          <View style={{ flexDirection: "row", paddingVertical: spacing.lg, backgroundColor: colors.surface, borderRadius: 18, borderCurve: "continuous" }}>
            <Stat value={chapter.verseCount} label={t("verses", language)} />
            <Stat value={`${Math.round((read / chapter.verseCount) * 100)}%`} label={t("readLabel", language)} />
            <Stat value={`~${Math.round(chapter.verseCount * 0.6)}m`} label={t("lengthLabel", language)} />
          </View>
        </Column>

        <Column gap={spacing.md}>
          <Button title={t("beginChapterBtn", language)} icon="book" onPress={() => router.push(`/chapter/${n}/verses`)} />
          {downloadsSupported &&
            (offline ? (
              <Button
                variant="secondary"
                icon="downloaded"
                title={t("chapterOfflineBtn", language)}
                onPress={async () => {
                  const ok = await confirm({
                    title: `${t("deleteChapterConfirm", language)} ${n}?`,
                    confirmLabel: t("delete", language),
                    cancelLabel: t("cancel", language),
                    destructive: true,
                  });
                  if (ok) deleteChapterDownload(n);
                }}
                accessibilityLabel={`${t("chapterOfflineBtn", language)}. ${t("tapToDelete", language)}`}
              />
            ) : task !== undefined ? (
              <View style={{ gap: spacing.sm, paddingHorizontal: spacing.xs }}>
                <Text variant="footnote" tone="soft">
                  {t("downloadingChapterBtn", language)} · {task}%
                </Text>
                <ProgressBar value={task / 100} />
              </View>
            ) : (
              <Button
                variant="secondary"
                icon="download"
                title={`${t("downloadChapterBtn", language)} · ~${Math.round(chapter.verseCount * APPROX_MB_PER_VERSE)} MB`}
                onPress={() => downloadChapter(n)}
              />
            ))}
        </Column>
      </Screen>
      <FloatingPlayer />
    </View>
  );
}
