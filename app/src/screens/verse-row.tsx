import { router } from "expo-router";
import { Pressable, View } from "react-native";

import { Text } from "@/components/text";
import { t } from "@/i18n";
import type { Verse } from "@/lib/gita";
import { useTheme } from "@/providers/theme";
import { fonts, radius, spacing } from "@/theme";

/** A verse as it appears in lists: reference, first line of Sanskrit, translation. */
export function VerseCard({ verse, translation, language, right }: { verse: Verse; translation: string; language: string; right?: React.ReactNode }) {
  const { colors } = useTheme();
  const firstLine = verse.sanskrit.split("\n")[0];
  return (
    <View>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t("verseLabel", language)} ${verse.id}`}
      onPress={() => router.push(`/verse/${verse.id}`)}
      style={({ pressed }) => ({
        padding: spacing.lg,
        gap: spacing.sm,
        borderRadius: radius.lg,
        borderCurve: "continuous",
        backgroundColor: pressed ? colors.surfaceMuted : colors.surface,
      })}
    >
      <View style={{ minHeight: right ? 28 : undefined, justifyContent: "center", paddingRight: right ? 40 : 0 }}>
        <Text variant="overline" tone="flame">
          {t("verseLabel", language)} {verse.id}
        </Text>
      </View>
      <Text numberOfLines={1} style={{ fontFamily: fonts.devanagari, fontSize: 16, lineHeight: 28, color: colors.inkSoft }}>
        {firstLine}
      </Text>
      <Text numberOfLines={3} style={{ fontFamily: fonts.serif, fontSize: 16, lineHeight: 23, color: colors.ink }}>
        {translation}
      </Text>
    </Pressable>
      {right ? <View style={{ position: "absolute", top: spacing.sm, right: spacing.sm }}>{right}</View> : null}
    </View>
  );
}
