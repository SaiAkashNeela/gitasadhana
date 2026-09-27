import { router, Stack } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { Column, Screen, SectionHeader } from "@/components/layout";
import { Group } from "@/components/list";
import { Text } from "@/components/text";
import { toast } from "@/components/toast";
import { t } from "@/i18n";
import { confirm } from "@/lib/confirm";
import { sendNewsletterEmail } from "@/lib/email";
import { useStored } from "@/lib/storage";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { radius, spacing } from "@/theme";

type Frequency = "daily" | "weekly" | "monthly" | "none";

export function AccountScreen() {
  const { colors } = useTheme();
  const { user, profile, language, signOutUser, deleteAccountAndData } = useProgress();
  const [pref, setPref] = useStored<Frequency>("gita_newsletter_pref", "daily");
  const [signingOut, setSigningOut] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDanger, setShowDanger] = useState(false);

  const options: { value: Frequency; label: string; desc: string }[] = [
    { value: "daily", label: t("dailyDigest", language), desc: t("dailyDigestDesc", language) },
    { value: "weekly", label: t("weeklyDigest", language), desc: t("weeklyDigestDesc", language) },
    { value: "monthly", label: t("monthlyDigest", language), desc: t("monthlyDigestDesc", language) },
    { value: "none", label: t("noEmails", language), desc: t("noEmailsDesc", language) },
  ];

  const choose = async (value: Frequency) => {
    const previous = pref;
    setPref(value);
    if (!user?.email) return;
    try {
      await sendNewsletterEmail(user.email, value);
    } catch (e: any) {
      setPref(previous);
      toast.error(e?.message ?? "Could not update email preferences.");
    }
  };

  const onSignOut = async () => {
    const ok = await confirm({
      title: t("signOutTitle", language),
      message: t("signOutConfirmMessage", language),
      confirmLabel: t("signOutTitle", language),
      cancelLabel: t("cancel", language),
      destructive: true,
    });
    if (!ok) return;
    setSigningOut(true);
    try {
      await signOutUser();
      toast.success(t("signedOutSuccessToast", language));
      router.back();
    } catch {
      toast.error(t("signedOutFailToast", language));
    } finally {
      setSigningOut(false);
    }
  };

  const onDelete = async () => {
    const ok = await confirm({
      title: t("dangerZone", language),
      message: `${t("dangerZoneWarning", language)}\n\n${t("deleteAccountDetail", language)}`,
      confirmLabel: t("delete", language),
      cancelLabel: t("cancel", language),
      destructive: true,
    });
    if (!ok) return;
    setDeleting(true);
    try {
      await deleteAccountAndData();
      toast.success(t("accountDeletedToast", language));
      router.replace("/");
    } catch {
      toast.error(t("accountDeleteFailedToast", language));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: t("accountSettingsTitle", language) }} />
      <Screen>
        <Column>
          <Text variant="footnote" tone="soft">
            {t("accountSettingsSub", language)}
          </Text>
          {user ? (
            <Text variant="callout">
              {profile.name} · {profile.email}
            </Text>
          ) : null}
        </Column>

        <Column gap={spacing.sm}>
          <SectionHeader title={t("emailNotifications", language)} />
          <Group>
            {options.map((o) => {
              const active = pref === o.value;
              return (
                <Pressable
                  key={o.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  onPress={() => choose(o.value)}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.md,
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.md,
                    backgroundColor: pressed ? colors.surfaceMuted : "transparent",
                  })}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text variant="callout">{o.label}</Text>
                    <Text variant="caption" tone="soft">
                      {o.desc}
                    </Text>
                  </View>
                  <Icon name={active ? "checkCircle" : "circle"} size={22} color={active ? colors.accent : colors.inkFaint} />
                </Pressable>
              );
            })}
          </Group>
          <Text variant="caption" tone="faint">
            {t("changesSavedNote", language)}
          </Text>
        </Column>

        {user ? (
          <Column gap={spacing.md}>
            <Button variant="secondary" icon="logout" title={signingOut ? t("signingOut", language) : t("signOut", language)} loading={signingOut} onPress={onSignOut} />
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: showDanger }}
              onPress={() => setShowDanger((v) => !v)}
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.md }}
            >
              <Text variant="callout" tone="danger">
                {t("dangerZone", language)}
              </Text>
              <Icon name={showDanger ? "chevronDown" : "chevronRight"} size={14} color={colors.danger} />
            </Pressable>
            {showDanger && (
              <View style={{ padding: spacing.lg, gap: spacing.md, borderRadius: radius.lg, borderCurve: "continuous", backgroundColor: colors.dangerSoft }}>
                <Text variant="footnote" tone="danger">
                  {t("dangerZoneWarning", language)}
                </Text>
                <Button variant="destructive" title={deleting ? t("deletingAccount", language) : t("deleteAccount", language)} loading={deleting} onPress={onDelete} />
              </View>
            )}
          </Column>
        ) : null}
      </Screen>
    </View>
  );
}
