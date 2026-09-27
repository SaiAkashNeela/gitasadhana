import { Stack, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { Column, Screen } from "@/components/layout";
import { OmRule } from "@/components/ornament";
import { Text } from "@/components/text";
import { t } from "@/i18n";
import { getVerse, normalizeVerseId, useTranslations } from "@/lib/gita";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { fonts, spacing } from "@/theme";

export function CommentaryScreen() {
  const { id: raw } = useLocalSearchParams<{ id: string }>();
  const id = normalizeVerseId(raw ?? "2.47");
  const verse = getVerse(id);
  const { colors } = useTheme();
  const { language, fontSize } = useProgress();
  const tr = useTranslations(language).get(id);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: `${t("commentary", language)} · ${id}` }} />
      <Screen>
        <Column gap={spacing.lg}>
          <Text selectable center style={{ fontFamily: fonts.devanagari, fontSize: fontSize + 4, lineHeight: (fontSize + 4) * 1.85, color: colors.ink }}>
            {verse?.sanskrit}
          </Text>
          <OmRule />
        </Column>
        <Column gap={spacing.md}>
          <Text variant="overline" tone="flame">
            {t("reflection", language)}
          </Text>
          <Text selectable style={{ fontFamily: fonts.serif, fontSize: fontSize + 2, lineHeight: (fontSize + 2) * 1.62, color: colors.ink }}>
            {tr?.deep}
          </Text>
        </Column>
        <Column gap={spacing.md}>
          <Text variant="overline" tone="accent">
            {t("deeperLook", language)}
          </Text>
          <Text selectable variant="body" tone="soft" style={{ fontSize, lineHeight: fontSize * 1.6 }}>
            {tr?.essence}
          </Text>
        </Column>
      </Screen>
    </View>
  );
}
