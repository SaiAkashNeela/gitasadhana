import { router, Stack, useLocalSearchParams } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { Column, Screen } from "@/components/layout";
import { Group } from "@/components/list";
import { Text } from "@/components/text";
import { LANGUAGES, t } from "@/i18n";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { gutter, spacing } from "@/theme";

export function LanguageScreen() {
  const { colors } = useTheme();
  const { language, setLanguage } = useProgress();
  const insets = useSafeAreaInsets();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const fromOnboarding = from === "onboarding" || !router.canGoBack();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: t("chooseLanguageTitle", language) }} />
      <Screen gap={spacing.lg}>
        <Column>
          <Text variant="callout" tone="soft">
            {t("chooseLanguageSub", language)}
          </Text>
          <Group>
            {LANGUAGES.map((l) => {
              const active = l.code === language;
              return (
                <Pressable
                  key={l.code}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  accessibilityLabel={`${l.name}, ${l.native}`}
                  onPress={() => setLanguage(l.code)}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.md,
                    paddingHorizontal: spacing.lg,
                    minHeight: 60,
                    backgroundColor: pressed ? colors.surfaceMuted : "transparent",
                  })}
                >
                  <View style={{ flex: 1 }}>
                    <Text variant="subheading">{l.native}</Text>
                    <Text variant="caption" tone="soft">
                      {l.name}
                    </Text>
                  </View>
                  <Icon name={active ? "checkCircle" : "circle"} size={22} color={active ? colors.accent : colors.inkFaint} />
                </Pressable>
              );
            })}
          </Group>
        </Column>
      </Screen>
      <View style={{ paddingHorizontal: gutter, paddingTop: spacing.md, paddingBottom: insets.bottom + spacing.lg, backgroundColor: colors.background, width: "100%", maxWidth: 560, alignSelf: "center" }}>
        <Button
          title={t("continueBtn", language)}
          onPress={() => (fromOnboarding ? router.replace("/home") : router.back())}
        />
      </View>
    </View>
  );
}
