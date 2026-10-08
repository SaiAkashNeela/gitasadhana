import { router, Stack } from "expo-router";
import { View } from "react-native";

import { Column, Screen } from "@/components/layout";
import { Group, Row } from "@/components/list";
import { EmptyState } from "@/components/misc";
import { localeFor, pick, t } from "@/i18n";
import { getChapter } from "@/lib/gita";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";

function formatHistoryDate(value: string, lang: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(d, today)) return t("Today", lang);
  if (same(d, yesterday)) return t("yesterday", lang);
  return d.toLocaleDateString(localeFor(lang), { month: "short", day: "numeric", year: "numeric" });
}

export function HistoryScreen() {
  const { colors } = useTheme();
  const { history, language } = useProgress();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: t("readingHistory", language) }} />
      <Screen>
        <Column>
          {history.length === 0 ? (
            <EmptyState icon="history" title={t("historyEmpty", language)} />
          ) : (
            <Group>
              {history.map((h) => (
                <Row
                  key={h.id}
                  title={`${t("chapterLabel", language)} ${h.chapter}, ${t("verseLabel", language).toLowerCase()} ${h.verse}`}
                  subtitle={`${pick(getChapter(h.chapter)?.title, language)} · ${formatHistoryDate(h.date, language)}`}
                  onPress={() => router.push(`/verse/${h.chapter}.${h.verse}`)}
                />
              ))}
            </Group>
          )}
        </Column>
      </Screen>
    </View>
  );
}
