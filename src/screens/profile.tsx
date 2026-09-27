import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";

import { IconButton } from "@/components/button";
import { Column, PageTitle, Screen, SectionHeader } from "@/components/layout";
import { Group, Row, SwitchRow } from "@/components/list";
import { Segmented, Stat } from "@/components/misc";
import { AppleSignInButton, GoogleSignInButton } from "@/components/sign-in-buttons";
import { Text } from "@/components/text";
import { toast } from "@/components/toast";
import { languageName, t, tf } from "@/i18n";
import { isAppleSignInAvailable, signIn } from "@/lib/auth";
import { SignInCancelled } from "@/lib/auth-providers";
import { sendWelcomeEmail } from "@/lib/email";
import { formatTime12Hour, useReminderConfig } from "@/lib/reminders-config";
import { shareText } from "@/lib/share";
import { useProgress } from "@/providers/progress";
import { useTheme, type ThemePreference } from "@/providers/theme";
import { fonts, radius, spacing } from "@/theme";

export function ProfileScreen() {
  const { colors, preference, setPreference } = useTheme();
  const p = useProgress();
  const { user, profile, language } = p;
  // True on every iOS build of the app; false on Android, web and in Expo Go (no native module).
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [busy, setBusy] = useState<null | "google" | "apple">(null);
  const reminder = useReminderConfig();

  useEffect(() => {
    isAppleSignInAvailable().then(setAppleAvailable);
  }, []);

  // Like the original, open account settings right after a fresh sign-in.
  const prevUser = useRef(user);
  useEffect(() => {
    if (!prevUser.current && user) router.push("/account");
    prevUser.current = user;
  }, [user]);

  const doSignIn = async (provider: "google" | "apple") => {
    setBusy(provider);
    try {
      const res = await signIn(provider);
      if (res.isNewUser && res.user.email) sendWelcomeEmail(res.user.email, res.user.displayName || t("seeker", "en")).catch(() => {});
      toast.success(t(provider === "google" ? "googleSignInSuccessToast" : "appleSignInSuccessToast", language));
    } catch (e: any) {
      if (!(e instanceof SignInCancelled)) {
        toast.error(`${t(provider === "google" ? "signInFailToast" : "appleSignInFailToast", language)}: ${e?.message ?? e}`);
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen inset="top" bottom="tabs">
      <Column>
        <PageTitle title={t("dashboardAndSettings", language)} />

        {user ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/account")}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.lg,
              padding: spacing.lg,
              borderRadius: radius.lg,
              borderCurve: "continuous",
              backgroundColor: pressed ? colors.surfaceMuted : colors.surface,
            })}
          >
            {user.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={{ width: 56, height: 56, borderRadius: 28 }} cachePolicy="disk" />
            ) : (
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accentSoft, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.accent }}>{profile.name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="heading" numberOfLines={1}>
                {profile.name === "Seeker" ? t("seeker", language) : profile.name}
              </Text>
              <Text variant="footnote" tone="soft" numberOfLines={1}>
                {profile.email}
              </Text>
            </View>
            <IconButton icon="gear" label={t("accountSettingsTitle", language)} onPress={() => router.push("/account")} color={colors.inkSoft} />
          </Pressable>
        ) : (
          <View style={{ padding: spacing.xl, gap: spacing.md, borderRadius: radius.lg, borderCurve: "continuous", backgroundColor: colors.surface }}>
            <Text variant="heading">{t("backupProgressTitle", language)}</Text>
            <Text variant="footnote" tone="soft">
              {t("backupProgressSub", language)}
            </Text>
            <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
              {/* iOS: Apple and Google. Android and web: Google only. */}
              {appleAvailable && <AppleSignInButton onPress={() => doSignIn("apple")} busy={!!busy} />}
              <GoogleSignInButton
                label={t("continueWithGoogle", language)}
                loading={busy === "google"}
                disabled={!!busy && busy !== "google"}
                onPress={() => doSignIn("google")}
              />
            </View>
          </View>
        )}

        <View style={{ flexDirection: "row", paddingVertical: spacing.lg, borderRadius: radius.lg, borderCurve: "continuous", backgroundColor: colors.surface }}>
          <Stat value={profile.streak} label={t("streak", language)} />
          <Stat value={profile.versesRead} label={t("versesReadSub", language)} />
          <Stat value={`${profile.minutes}m`} label={t("minutes", language)} />
        </View>
      </Column>

      <Column gap={spacing.sm}>
        <SectionHeader title={t("readingSettings", language)} />
        <Group>
          <Row icon="language" title={t("language", language)} value={languageName(language)} onPress={() => router.push("/language")} />
          <SwitchRow icon="speaker" title={t("autoPlayAudioLabel", language)} value={p.autoPlayOnOpen} onValueChange={p.setAutoPlayOnOpen} />
          <Row
            icon="textSize"
            title={t("fontSizeLabel", language)}
            chevron={false}
            right={
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                <IconButton icon="minus" label={t("smallerText", language)} size={16} tone="filled" disabled={p.fontSize <= 12} onPress={() => p.setFontSize(p.fontSize - 1)} />
                <Text variant="callout" center style={{ width: 28, fontVariant: ["tabular-nums"] }}>
                  {p.fontSize}
                </Text>
                <IconButton icon="plus" label={t("largerText", language)} size={16} tone="filled" disabled={p.fontSize >= 24} onPress={() => p.setFontSize(p.fontSize + 1)} />
              </View>
            }
          />
          <Row
            icon="bell"
            title={t("dailyReminder", language)}
            value={reminder.enabled ? formatTime12Hour(reminder.time) : t("disabledStatus", language)}
            onPress={() => router.push("/reminders")}
          />
        </Group>
        <View style={{ marginTop: spacing.sm, gap: spacing.sm }}>
          <Text variant="caption" tone="soft">
            {t("appearance", language)}
          </Text>
          <Segmented<ThemePreference>
            value={preference}
            onChange={setPreference}
            options={[
              { value: "system", label: t("themeSystem", language) },
              { value: "light", label: t("themeLight", language) },
              { value: "dark", label: t("themeDark", language) },
            ]}
          />
        </View>
      </Column>

      <Column gap={spacing.sm}>
        <SectionHeader title={t("practiceTools", language)} />
        <Group>
          <Row icon="note" title={t("notesAndReflections", language)} onPress={() => router.push("/notes")} />
          <Row icon="history" title={t("readingHistory", language)} onPress={() => router.push("/history")} />
          <Row
            icon="download"
            title={t("downloads", language)}
            value={`${p.downloadedVerses.length} ${t("tracks", language)}`}
            onPress={() => router.push("/downloads")}
          />
          <Row icon="flame" title={t("dailyJourney", language)} value={tf("streakDays", language, { n: profile.streak })} onPress={() => router.push("/journey")} />
        </Group>
      </Column>

      <Column gap={spacing.sm}>
        <SectionHeader title={t("helpSupportTitle", language)} />
        <Group>
          <Row
            icon="share"
            title={t("shareWisdom", language)}
            onPress={() =>
              shareText(t("shareAppMessage", language), {
                title: "Gita Sadhana",
                url: "https://gitasadhana.com",
                copiedLabel: t("copiedToClipboardToast", language),
              })
            }
          />
          <Row icon="mail" title={t("contactUsTitle", language)} onPress={() => router.push("/help/contact")} />
          <Row icon="shield" title={t("privacyPolicyTitle", language)} onPress={() => router.push("/help/privacy")} />
          <Row icon="doc" title={t("termsTitle", language)} onPress={() => router.push("/help/terms")} />
          <Row icon="megaphone" title={t("verseLanguageCorrectionTitle", language)} onPress={() => router.push("/help/correction")} />
        </Group>
      </Column>
    </Screen>
  );
}
