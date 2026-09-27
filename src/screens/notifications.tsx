import { router, Stack } from "expo-router";
import { Pressable, View } from "react-native";

import { IconButton } from "@/components/button";
import { Icon, type IconName } from "@/components/icon";
import { Column, Screen, SectionHeader } from "@/components/layout";
import { Group, Row } from "@/components/list";
import { EmptyState } from "@/components/misc";
import { Text } from "@/components/text";
import { t } from "@/i18n";
import { localizedReminders } from "@/i18n/reminders";
import { type AppNotification, useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { radius, spacing } from "@/theme";

const ICONS: Record<AppNotification["iconType"], IconName> = {
  bell: "bell",
  lotus: "lotus",
  trophy: "trophy",
  calendar: "calendar",
  chapter: "arrowUp",
  share: "share",
  megaphone: "megaphone",
};

// Reminder copy carries emoji for the system notification; in the list the icon says it.
const plain = (s: string) => s.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{1F549}]/gu, "").trim();

function textsFor(n: AppNotification, lang: string) {
  const dict = localizedReminders[lang] ?? localizedReminders.en;
  const title = n.title.toLowerCase();
  if (title.includes("daily")) return { title: dict.dailyTitle, body: dict.dailyBody, link: t("readNow", lang) };
  if (title.includes("continue")) {
    const verse = n.linkTo?.split("/verse/")[1] ?? "1.1";
    return { title: dict.continueTitle, body: dict.continueBody.replace("{verse}", verse), link: t("continueReading", lang) };
  }
  if (title.includes("streak")) return { title: dict.streakTitle, body: dict.streakBody, link: t("keepGoing", lang) };
  const k = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "");
  return { title: t(k(n.title), lang), body: t(k(n.body), lang), link: n.linkText ? t(k(n.linkText), lang) : undefined };
}

export function NotificationsScreen() {
  const { colors } = useTheme();
  const { language, notifications, clearNotifications, deleteNotification, markNotificationAsRead } = useProgress();
  const groups = ["Today", "This Week", "Earlier"] as const;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          title: t("notifications", language),
          headerRight: () =>
            notifications.length > 0 ? (
              <Pressable accessibilityRole="button" onPress={clearNotifications} hitSlop={10}>
                <Text variant="callout" tone="accent">
                  {t("clearAll", language)}
                </Text>
              </Pressable>
            ) : null,
        }}
      />
      <Screen>
        <Column>
          <Text variant="footnote" tone="soft">
            {t("stayUpdatedJourney", language)}
          </Text>
        </Column>
        {notifications.length === 0 ? (
          <EmptyState icon="bell" title={t("allCaughtUp", language)} body={t("noNotifications", language)} />
        ) : (
          groups.map((g) => {
            const list = notifications.filter((n) => n.dateGroup === g);
            if (list.length === 0) return null;
            return (
              <Column key={g} gap={spacing.md}>
                <SectionHeader title={t(g.replace(/[^a-zA-Z0-9]/g, ""), language)} />
                {list.map((n) => {
                  const x = textsFor(n, language);
                  return (
                    <View key={n.id} style={{ flexDirection: "row", borderRadius: radius.lg, borderCurve: "continuous", overflow: "hidden", backgroundColor: colors.surface, opacity: n.read ? 0.72 : 1 }}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        markNotificationAsRead(n.id);
                        if (n.linkTo) router.push(n.linkTo as never);
                      }}
                      style={({ pressed }) => ({
                        flex: 1,
                        flexDirection: "row",
                        gap: spacing.md,
                        padding: spacing.lg,
                        paddingRight: 0,
                        backgroundColor: pressed ? colors.surfaceMuted : "transparent",
                      })}
                    >
                      <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.flameSoft, alignItems: "center", justifyContent: "center" }}>
                        <Icon name={ICONS[n.iconType] ?? "info"} size={18} color={colors.flame} />
                      </View>
                      <View style={{ flex: 1, gap: 3 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                          <Text variant="callout" style={{ flex: 1, fontWeight: "600" }} numberOfLines={2}>
                            {plain(x.title)}
                          </Text>
                          {!n.read && <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accent }} />}
                          <Text variant="caption" tone="faint">
                            {n.time}
                          </Text>
                        </View>
                        <Text variant="footnote" tone="soft">
                          {x.body}
                        </Text>
                        {x.link ? (
                          <Text variant="caption" tone="accent" style={{ fontWeight: "600", marginTop: 2 }}>
                            {x.link}
                          </Text>
                        ) : null}
                      </View>
                    </Pressable>
                      <IconButton icon="close" label={t("delete", language)} size={14} color={colors.inkFaint} onPress={() => deleteNotification(n.id)} style={{ margin: spacing.xs }} />
                    </View>
                  );
                })}
              </Column>
            );
          })
        )}
        <Column>
          <Group>
            <Row icon="gear" title={t("manageNotificationPreferences", language)} subtitle={t("chooseWhatToHear", language)} onPress={() => router.push("/reminders")} />
          </Group>
        </Column>
      </Screen>
    </View>
  );
}
