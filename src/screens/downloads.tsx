import { router, Stack } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button, IconButton } from "@/components/button";
import { Icon } from "@/components/icon";
import { Column, Screen } from "@/components/layout";
import { EmptyState, Segmented } from "@/components/misc";
import { ProgressBar } from "@/components/progress";
import { Text } from "@/components/text";
import { languageName, pick, t } from "@/i18n";
import { APPROX_MB_PER_VERSE, audioLanguageFor } from "@/lib/audio-source";
import { confirm } from "@/lib/confirm";
import { downloadsSupported } from "@/lib/downloads";
import { chapters, TOTAL_VERSES } from "@/lib/gita";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { fonts, radius, spacing } from "@/theme";

const mb = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1);
const gb = (verses: number) => ((verses * APPROX_MB_PER_VERSE) / 1024).toFixed(1);

export function DownloadsScreen() {
  const { colors } = useTheme();
  const p = useProgress();
  const { language } = p;
  const [tab, setTab] = useState<"library" | "download">("library");

  const individual = p.downloadedVerses.filter((id) => !p.downloadedChapters.includes(Number(id.split(".")[0])));
  const ask = (title: string) => confirm({ title, confirmLabel: t("delete", language), cancelLabel: t("cancel", language), destructive: true });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: t("offlineLibrary", language) }} />
      <Screen>
        <Column>
          <Text variant="footnote" tone="soft">
            {t("offlineLibrarySub", language)}
          </Text>
          {!downloadsSupported ? (
            <EmptyState icon="download" title={t("offlineLibrary", language)} body={t("offlineWebNotice", language)} />
          ) : (
            <>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.lg, padding: spacing.lg, borderRadius: radius.lg, borderCurve: "continuous", backgroundColor: colors.surface }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accentSoft, alignItems: "center", justifyContent: "center" }}>
                  <Icon name="headphones" size={20} color={colors.accent} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="overline" tone="soft">
                    {t("localStorageTitle", language)}
                  </Text>
                  <Text style={{ fontFamily: fonts.display, fontSize: 18, lineHeight: 24, color: colors.ink }}>
                    {mb(p.usedBytes)} MB {t("usedSpace", language)}
                  </Text>
                  <Text variant="caption" tone="soft">
                    {p.downloadedVerses.length} / {TOTAL_VERSES} {t("verses", language).toLowerCase()} · {languageName(audioLanguageFor(language))}
                  </Text>
                </View>
              </View>
              <Segmented
                value={tab}
                onChange={setTab}
                options={[
                  { value: "library", label: `${t("myLibrary", language)} (${p.downloadedChapters.length + individual.length})` },
                  { value: "download", label: t("browseAndDownload", language) },
                ]}
              />
            </>
          )}
        </Column>

        {downloadsSupported && tab === "library" && (
          <Column gap={spacing.md}>
            {p.downloadedChapters.length === 0 && individual.length === 0 ? (
              <EmptyState icon="headphones" title={t("yourLibraryIsEmpty", language)} body={t("libraryIsEmptySub", language)} />
            ) : (
              <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, borderCurve: "continuous", overflow: "hidden" }}>
                {p.isGitaDownloaded && (
                  <LibraryRow
                    title={t("completeBhagavadGita", language)}
                    subtitle={t("all18ChaptersOffline", language)}
                    onDelete={async () => (await ask(t("clearAllDownloadsConfirm", language))) && p.deleteWholeGita()}
                  />
                )}
                {!p.isGitaDownloaded &&
                  p.downloadedChapters.map((n, i) => (
                    <LibraryRow
                      key={`c${n}`}
                      divider={i > 0}
                      title={`${t("chapterLabel", language)} ${n} — ${pick(chapters[n - 1]?.title, language)}`}
                      subtitle={t("completeChapterRecitation", language)}
                      onDelete={async () => (await ask(`${t("deleteChapterConfirm", language)} ${n}?`)) && p.deleteChapterDownload(n)}
                    />
                  ))}
                {individual.map((id, i) => (
                  <LibraryRow
                    key={id}
                    divider={i > 0 || p.downloadedChapters.length > 0}
                    title={`${t("verseLabel", language)} ${id}`}
                    subtitle={t("individualVerseRecitation", language)}
                    onOpen={() => router.push(`/verse/${id}`)}
                    onDelete={async () => (await ask(`${t("deleteVerseConfirm", language)} ${id}?`)) && p.deleteVerseDownload(id)}
                  />
                ))}
              </View>
            )}
          </Column>
        )}

        {downloadsSupported && tab === "download" && (
          <>
            <Column>
              <View style={{ padding: spacing.xl, gap: spacing.md, borderRadius: radius.xl, borderCurve: "continuous", backgroundColor: colors.accent }}>
                <Text style={{ fontFamily: fonts.devanagariMedium, fontSize: 26, lineHeight: 34, color: colors.onAccent }}>ॐ</Text>
                <Text style={{ fontFamily: fonts.display, fontSize: 20, lineHeight: 26, color: colors.onAccent }}>{t("fullGitaAudioTitle", language)}</Text>
                <Text variant="footnote" style={{ color: colors.onAccent, opacity: 0.85 }}>
                  {t("fullGitaAudioDesc", language)} ({t("sizeApprox", language)} {gb(TOTAL_VERSES)} GB)
                </Text>
                {p.isGitaDownloaded ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                    <Icon name="checkCircle" size={18} color={colors.onAccent} />
                    <Text variant="footnote" style={{ color: colors.onAccent, fontWeight: "600" }}>
                      {t("offlineReady", language)}
                    </Text>
                  </View>
                ) : p.downloading.gita !== undefined ? (
                  <View style={{ gap: spacing.sm }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text variant="footnote" style={{ color: colors.onAccent }}>
                        {t("downloadingEntireGita", language)}
                      </Text>
                      <Text variant="footnote" style={{ color: colors.onAccent, fontWeight: "600" }}>
                        {p.downloading.gita}%
                      </Text>
                    </View>
                    <ProgressBar value={p.downloading.gita / 100} color={colors.onAccent} />
                    <Button size="sm" variant="secondary" title={t("cancel", language)} onPress={p.cancelDownloads} style={{ alignSelf: "flex-start" }} />
                  </View>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    icon="download"
                    title={t("downloadCompleteGita", language)}
                    style={{ alignSelf: "flex-start" }}
                    onPress={async () => {
                      const ok = await confirm({
                        title: t("downloadCompleteGita", language),
                        message: `${t("sizeApprox", language)} ${gb(TOTAL_VERSES - p.downloadedVerses.length)} GB`,
                        confirmLabel: t("download", language),
                        cancelLabel: t("cancel", language),
                      });
                      if (ok) void p.downloadWholeGita();
                    }}
                  />
                )}
              </View>
            </Column>

            <Column gap={spacing.md}>
              <Text variant="overline" tone="soft">
                {t("chaptersRecitations", language)}
              </Text>
              <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, borderCurve: "continuous", overflow: "hidden" }}>
                {chapters.map((c, i) => {
                  const task = p.downloading[`chapter:${c.number}`];
                  const done = p.isChapterDownloaded(c.number);
                  return (
                    <View
                      key={c.number}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: spacing.md,
                        paddingHorizontal: spacing.lg,
                        paddingVertical: spacing.md,
                        borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
                        borderTopColor: colors.hairline,
                      }}
                    >
                      <View style={{ flex: 1, gap: 3 }}>
                        <Text variant="callout" numberOfLines={1} style={{ fontWeight: "600" }}>
                          {t("chapterLabel", language)} {c.number} — {pick(c.title, language)}
                        </Text>
                        <Text variant="caption" tone="soft">
                          {c.verseCount} {t("verses", language).toLowerCase()} · ~{Math.round(c.verseCount * APPROX_MB_PER_VERSE)} MB
                        </Text>
                        {task !== undefined && <ProgressBar value={task / 100} height={3} />}
                      </View>
                      {done ? (
                        <IconButton
                          icon="downloaded"
                          label={`${t("offline", language)} — ${t("tapToDelete", language)}`}
                          color={colors.accent}
                          onPress={async () => (await ask(`${t("deleteChapterConfirm", language)} ${c.number}?`)) && p.deleteChapterDownload(c.number)}
                        />
                      ) : task !== undefined ? (
                        <Text variant="caption" tone="accent" style={{ width: 40, textAlign: "center", fontWeight: "700" }}>
                          {task}%
                        </Text>
                      ) : (
                        <IconButton icon="download" label={t("downloadChapterBtn", language)} color={colors.accent} onPress={() => p.downloadChapter(c.number)} />
                      )}
                    </View>
                  );
                })}
              </View>
            </Column>
          </>
        )}
      </Screen>
    </View>
  );
}

function LibraryRow({ title, subtitle, onDelete, onOpen, divider }: { title: string; subtitle: string; onDelete: () => void; onOpen?: () => void; divider?: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingLeft: spacing.lg,
        paddingRight: spacing.sm,
        paddingVertical: spacing.sm,
        borderTopWidth: divider ? StyleSheet.hairlineWidth : 0,
        borderTopColor: colors.hairline,
      }}
    >
      <Icon name="headphones" size={18} color={colors.accent} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="callout" numberOfLines={1}>
          {title}
        </Text>
        <Text variant="caption" tone="soft">
          {subtitle}
        </Text>
      </View>
      {onOpen && <IconButton icon="book" label="Open" size={18} color={colors.accent} onPress={onOpen} />}
      <IconButton icon="trash" label="Delete" size={18} color={colors.danger} onPress={onDelete} />
    </View>
  );
}
