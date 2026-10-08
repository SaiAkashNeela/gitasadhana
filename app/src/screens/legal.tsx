import { Stack } from "expo-router";
import { View } from "react-native";

import { Column, Screen } from "@/components/layout";
import { Text } from "@/components/text";
import { t } from "@/i18n";
import { legalFor, type LegalSection } from "@/lib/legal";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { spacing } from "@/theme";

function LegalPage({ title, updated, sections, note }: { title: string; updated: string; sections: LegalSection[]; note?: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title }} />
      <Screen gap={spacing.xl}>
        <Column>
          <Text variant="footnote" tone="soft">
            {updated}
          </Text>
          {note ? (
            <Text variant="caption" tone="faint">
              {note}
            </Text>
          ) : null}
        </Column>
        {sections.map((s) => (
          <Column key={s.title} gap={spacing.sm}>
            <Text variant="heading" accessibilityRole="header">
              {s.title}
            </Text>
            <Text variant="body" tone="soft" selectable>
              {s.body}
            </Text>
          </Column>
        ))}
      </Screen>
    </View>
  );
}

export function PrivacyScreen() {
  const { language } = useProgress();
  const text = legalFor(language);
  return <LegalPage title={t("privacyPolicyTitle", language)} updated={t("privacyLastUpdated", language)} sections={text.privacy} note={text.translated ? text.note : undefined} />;
}

export function TermsScreen() {
  const { language } = useProgress();
  const text = legalFor(language);
  return <LegalPage title={t("termsTitle", language)} updated={t("termsLastUpdated", language)} sections={text.terms} note={text.translated ? text.note : undefined} />;
}
