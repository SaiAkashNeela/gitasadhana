import { Stack } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, TextInput, View } from "react-native";

import { Button, IconButton } from "@/components/button";
import { Column, Screen } from "@/components/layout";
import { EmptyState } from "@/components/misc";
import { Text } from "@/components/text";
import { localeFor, t } from "@/i18n";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { radius, spacing, type, fonts } from "@/theme";

/** Notes saved by the old app hold "Sep 27"; new ones hold an ISO date. */
function noteDate(value: string, lang: string) {
  const d = new Date(value);
  return value.includes("T") && !Number.isNaN(d.getTime()) ? d.toLocaleDateString(localeFor(lang), { month: "short", day: "numeric" }) : value;
}

export function NotesScreen() {
  const { colors } = useTheme();
  const { notes, addNote, deleteNote, language } = useProgress();
  const [draft, setDraft] = useState("");

  const save = () => {
    if (!draft.trim()) return;
    addNote("General", "Reflection", draft.trim());
    setDraft("");
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}>
      <Stack.Screen options={{ title: t("notesAndReflections", language) }} />
      <Screen>
        <Column>
          <View style={{ padding: spacing.lg, gap: spacing.md, borderRadius: radius.lg, borderCurve: "continuous", backgroundColor: colors.surface }}>
            <TextInput
              accessibilityLabel={t("writeReflectionPlaceholder", language)}
              value={draft}
              onChangeText={setDraft}
              placeholder={t("writeReflectionPlaceholder", language)}
              placeholderTextColor={colors.inkFaint}
              multiline
              textAlignVertical="top"
              style={[type.scripture, { minHeight: 96, color: colors.ink, fontSize: 17, outlineStyle: "none" } as object]}
            />
            <Button size="sm" title={t("saveBtn", language)} onPress={save} disabled={!draft.trim()} style={{ alignSelf: "flex-end" }} />
          </View>
        </Column>
        <Column gap={spacing.md}>
          {notes.length === 0 ? (
            <EmptyState icon="note" title={t("noReflections", language)} body={t("noReflectionsSub", language)} />
          ) : (
            notes.map((n) => (
              <View key={n.id} style={{ padding: spacing.lg, gap: spacing.sm, borderRadius: radius.lg, borderCurve: "continuous", backgroundColor: colors.surface }}>
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.md }}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text variant="subheading" style={{ fontFamily: fonts.display }}>
                      {n.title === "Reflection" ? t("reflection", language) : n.title}
                    </Text>
                    <Text variant="caption" tone="soft">
                      {noteDate(n.date, language)}
                      {n.verseId === "General" ? ` · ${t("noteGeneral", language)}` : ` · ${t("verseLabel", language)} ${n.verseId}`}
                    </Text>
                  </View>
                  <IconButton icon="trash" label={t("delete", language)} size={17} color={colors.inkFaint} onPress={() => deleteNote(n.id)} />
                </View>
                <Text selectable variant="callout">
                  {n.body}
                </Text>
              </View>
            ))
          )}
        </Column>
      </Screen>
    </KeyboardAvoidingView>
  );
}
