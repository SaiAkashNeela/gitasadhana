import { router, Stack } from "expo-router";
import { useState } from "react";
import { Linking, View } from "react-native";

import { Button } from "@/components/button";
import { Column, Screen, SectionHeader } from "@/components/layout";
import { Group, SwitchRow } from "@/components/list";
import { Chip } from "@/components/misc";
import { Text } from "@/components/text";
import { toast } from "@/components/toast";
import { t, tf } from "@/i18n";
import { formatTime12Hour, getReminderConfig, remindersSupported, updateReminderSettings } from "@/lib/reminders";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { radius, spacing } from "@/theme";

const TIMES = ["05:00", "06:00", "07:00", "08:00", "09:00", "21:00"];

export function RemindersScreen() {
  const { colors } = useTheme();
  const { language } = useProgress();
  const [initial] = useState(getReminderConfig);
  const [enabled, setEnabled] = useState(initial.enabled);
  const [time, setTime] = useState(initial.time);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await updateReminderSettings(enabled, time);
      if (!enabled) toast.info(t("remindersDisabledToast", language));
      else if (res.scheduled) toast.success(tf("reminderSetToast", language, { time: formatTime12Hour(time) }));
      else if (res.permissionDenied)
        toast.error(t("notificationsClosedToast", language), {
          action: { label: t("openSettings", language), onPress: () => Linking.openSettings() },
        });
      else toast.success(t("changesSavedNote", language));
      if (router.canGoBack()) router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: t("dailyReminder", language) }} />
      <Screen>
        <Column>
          <Group>
            <SwitchRow icon="bell" title={t("gentleReminder", language)} subtitle={t("dailyNudge", language)} value={enabled} onValueChange={setEnabled} />
          </Group>
          {!remindersSupported ? (
            <Text variant="footnote" tone="soft">
              {t("remindersNativeOnly", language)}
            </Text>
          ) : null}
        </Column>
        {enabled && (
          <>
            <Column gap={spacing.md}>
              <SectionHeader title={t("timeLabel", language)} />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
                {TIMES.map((x) => (
                  <Chip key={x} label={formatTime12Hour(x)} selected={x === time} onPress={() => setTime(x)} />
                ))}
              </View>
            </Column>
            <Column>
              <View style={{ padding: spacing.lg, gap: spacing.md, borderRadius: radius.lg, borderCurve: "continuous", backgroundColor: colors.surface }}>
                <Text variant="subheading">{t("dailyCommitmentTitle", language)}</Text>
                <Text variant="footnote" tone="soft">
                  {t("dailyCommitmentSub", language)}
                </Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <View key={i} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.accentSoft, alignItems: "center", justifyContent: "center" }}>
                      <Text variant="footnote" tone="accent" style={{ fontWeight: "700" }}>
                        {d}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </Column>
          </>
        )}
        <Column>
          <Button title={t("saveReminderBtn", language)} onPress={save} loading={saving} />
        </Column>
      </Screen>
    </View>
  );
}
