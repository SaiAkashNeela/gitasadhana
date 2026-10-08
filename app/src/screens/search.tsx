import { router, Stack } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Icon } from "@/components/icon";
import { Column, Screen, SectionHeader } from "@/components/layout";
import { Group, Row } from "@/components/list";
import { Chip, SearchField } from "@/components/misc";
import { t } from "@/i18n";
import { useStored } from "@/lib/storage";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { spacing } from "@/theme";

const SUGGESTED = ["searchKarma", "searchSoul", "searchDevotion", "searchFear", "searchMeditation", "searchDuty"];

export function SearchScreen() {
  const { colors } = useTheme();
  const { language } = useProgress();
  const [q, setQ] = useState("");
  const [recent, setRecent] = useStored<string[]>("gita_recent_searches", []);

  const run = (term: string) => {
    const value = term.trim();
    if (!value) return;
    setRecent([value, ...recent.filter((r) => r !== value)].slice(0, 6));
    router.push({ pathname: "/search/results", params: { q: value } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: t("searchTitle", language) }} />
      <Screen>
        <Column>
          <SearchField
            autoFocus
            value={q}
            onChangeText={setQ}
            onSubmit={() => run(q)}
            placeholder={t("searchPlaceholder", language)}
            accessibilityLabel={t("searchTitle", language)}
          />
        </Column>
        <Column gap={spacing.md}>
          <SectionHeader title={t("suggestedLabel", language)} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {SUGGESTED.map((key) => t(key, language)).map((s) => (
              <Chip key={s} label={s} onPress={() => run(s)} />
            ))}
          </View>
        </Column>
        {recent.length > 0 && (
          <Column gap={spacing.md}>
            <SectionHeader title={t("recentLabel", language)} />
            <Group>
              {recent.map((r) => (
                <Row key={r} title={r} onPress={() => run(r)} chevron={false} right={<Icon name="clock" size={16} color={colors.inkFaint} />} />
              ))}
            </Group>
          </Column>
        )}
      </Screen>
    </View>
  );
}
