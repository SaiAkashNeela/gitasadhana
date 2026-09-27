import { Stack } from "expo-router";
import { useState } from "react";
import { FlatList, KeyboardAvoidingView, Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, IconButton } from "@/components/button";
import { Icon } from "@/components/icon";
import { Column, Screen } from "@/components/layout";
import { Field } from "@/components/misc";
import { Text } from "@/components/text";
import { toast } from "@/components/toast";
import { t } from "@/i18n";
import { sendCorrectionEmail } from "@/lib/email";
import { chapters } from "@/lib/gita";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { radius, spacing } from "@/theme";

// The same ten languages the original correction form offered.
const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "kn", label: "Kannada" },
  { value: "te", label: "Telugu" },
  { value: "ta", label: "Tamil" },
  { value: "ml", label: "Malayalam" },
  { value: "mr", label: "Marathi" },
  { value: "gu", label: "Gujarati" },
  { value: "bn", label: "Bengali" },
  { value: "pa", label: "Punjabi" },
];

type Option = { value: string; label: string };

function Picker({ label, value, options, onSelect, disabled }: { label: string; value: string; options: Option[]; onSelect: (v: string) => void; disabled?: boolean }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={{ gap: spacing.sm }}>
      <Text variant="overline" tone="soft">
        {label}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? ""}`}
        accessibilityState={{ disabled: !!disabled }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={({ pressed }) => ({
          minHeight: 48,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.md,
          borderCurve: "continuous",
          backgroundColor: pressed ? colors.surfaceMuted : colors.surface,
          flexDirection: "row",
          alignItems: "center",
          opacity: disabled ? 0.45 : 1,
        })}
      >
        <Text variant="callout" tone={selected ? "ink" : "faint"} style={{ flex: 1 }}>
          {selected?.label ?? label}
        </Text>
        <Icon name="chevronDown" size={14} color={colors.inkFaint} />
      </Pressable>

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" transparent={process.env.EXPO_OS === "web"} onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, backgroundColor: process.env.EXPO_OS === "web" ? colors.overlay : colors.background, justifyContent: "flex-end" }}>
          <View style={{ flex: process.env.EXPO_OS === "web" ? undefined : 1, maxHeight: process.env.EXPO_OS === "web" ? "70%" : undefined, backgroundColor: colors.background, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl }}>
            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
              <Text variant="heading" style={{ flex: 1 }}>
                {label}
              </Text>
              <IconButton icon="close" label="Close" onPress={() => setOpen(false)} tone="filled" size={16} />
            </View>
            <FlatList
              data={options}
              keyExtractor={(o) => o.value}
              contentContainerStyle={{ paddingBottom: insets.bottom + spacing.lg }}
              renderItem={({ item, index }) => (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: item.value === value }}
                  onPress={() => {
                    onSelect(item.value);
                    setOpen(false);
                  }}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    minHeight: 50,
                    paddingHorizontal: spacing.xl,
                    backgroundColor: pressed ? colors.surfaceMuted : "transparent",
                    borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
                    borderTopColor: colors.hairline,
                  })}
                >
                  <Text variant="callout" tone={item.value === value ? "accent" : "ink"} style={{ flex: 1, fontWeight: item.value === value ? "600" : "400" }}>
                    {item.label}
                  </Text>
                  {item.value === value && <Icon name="check" size={16} color={colors.accent} />}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

export function CorrectionScreen() {
  const { colors } = useTheme();
  const { language, user } = useProgress();
  const [lang, setLang] = useState("");
  const [chapter, setChapter] = useState("");
  const [verse, setVerse] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chapterOptions = chapters.map((c) => ({ value: String(c.number), label: `Chapter ${c.number}` }));
  const count = chapter ? chapters[Number(chapter) - 1]?.verseCount ?? 0 : 0;
  const verseOptions = Array.from({ length: count }, (_, i) => ({ value: String(i + 1), label: `Verse ${i + 1}` }));

  const submit = async () => {
    if (!lang || !chapter || !verse || !message.trim()) {
      setError(t("allFieldsRequired", language));
      return;
    }
    setError(null);
    setSending(true);
    try {
      await sendCorrectionEmail(lang, chapter, verse, message.trim(), user?.email || undefined);
      toast.success(t("correctionSubmittedToast", language));
      setLang("");
      setChapter("");
      setVerse("");
      setMessage("");
    } catch (e: any) {
      setError(e?.message || "Failed to submit. Try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}>
      <Stack.Screen options={{ title: t("verseLanguageCorrectionTitle", language) }} />
      <Screen>
        <Column>
          <Text variant="callout" tone="soft">
            {t("correctionHelpText", language)}
          </Text>
          <Picker label={t("languageLabel", language)} value={lang} options={LANGUAGE_OPTIONS} onSelect={setLang} />
          <Picker
            label={t("chapterLabel", language)}
            value={chapter}
            options={chapterOptions}
            onSelect={(v) => {
              setChapter(v);
              setVerse("");
            }}
          />
          <Picker label={t("verseLabel", language)} value={verse} options={verseOptions} onSelect={setVerse} disabled={!chapter} />
          <Field label={t("describeIssueLabel", language)} value={message} onChangeText={setMessage} placeholder={t("correctionHelpText", language)} multiline />
          {error ? (
            <Text variant="footnote" tone="danger" selectable>
              {error}
            </Text>
          ) : null}
          <Button title={sending ? t("submitting", language) : t("submitCorrectionBtn", language)} loading={sending} onPress={submit} />
        </Column>
      </Screen>
    </KeyboardAvoidingView>
  );
}
