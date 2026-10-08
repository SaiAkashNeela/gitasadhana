import { Image } from "expo-image";
import { Stack } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Pressable, StyleSheet, Text as RNText, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "expo-router/react-navigation";

import { Button, IconButton } from "@/components/button";
import { Icon } from "@/components/icon";
import { Column, Screen } from "@/components/layout";
import { Group } from "@/components/list";
import { Text } from "@/components/text";
import { useGitaAI, type ChatMessage } from "@/hooks/use-gita-ai";
import { LANGUAGES, languageName, t } from "@/i18n";
import { art } from "@/lib/gita";
import { parseRichText } from "@/lib/rich-text";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { fonts, gutter, layout, radius, spacing, type } from "@/theme";

const PROMPTS = ["aiPrompt1", "aiPrompt2", "aiPrompt3"];

export function GitaAIScreen() {
  const { colors } = useTheme();
  const { user, language: appLanguage } = useProgress();
  const ai = useGitaAI(user?.uid ?? null);
  const [input, setInput] = useState("");
  const [picking, setPicking] = useState(ai.language == null);
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const list = useRef<FlatList<ChatMessage>>(null);
  const inputRef = useRef<TextInput>(null);

  const send = async () => {
    const text = input.trim();
    if (!text || ai.sending || ai.limitReached) return;
    setInput("");
    await ai.sendMessage(text);
  };

  if (picking) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack.Screen options={{ title: "Gita AI", headerRight: undefined }} />
        <Screen>
          <Column style={{ alignItems: "center" }} gap={spacing.md}>
            <Image source={art.emblem} style={{ width: 88, height: 88, borderRadius: 44 }} />
            <Text variant="callout" tone="soft" center style={{ maxWidth: 320 }}>
              {t("gitaAiIntro", appLanguage)}
            </Text>
            <Text variant="subheading" center>
              {t("gitaAiLanguageQuestion", appLanguage)}
            </Text>
          </Column>
          <Column>
            <Group>
              {LANGUAGES.map((l) => (
                <Pressable
                  key={l.code}
                  accessibilityRole="button"
                  onPress={() => {
                    ai.setLanguage(l.code);
                    setPicking(false);
                  }}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    minHeight: 52,
                    paddingHorizontal: spacing.lg,
                    backgroundColor: pressed ? colors.surfaceMuted : "transparent",
                  })}
                >
                  <Text variant="callout" style={{ flex: 1 }}>
                    {l.name}
                  </Text>
                  <Text variant="callout" tone="soft">
                    {l.native}
                  </Text>
                </Pressable>
              ))}
            </Group>
          </Column>
        </Screen>
      </View>
    );
  }

  const footer = (
    <View style={{ gap: spacing.md, paddingTop: spacing.md }}>
      {ai.sending && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
          <Avatar />
          <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surface }}>
            <ActivityIndicator color={colors.accent} size="small" />
          </View>
        </View>
      )}
      {ai.limitReached && (
        <Notice icon="clock" title={t("gitaAiLimitTitle", appLanguage)} body={t("gitaAiLimitBody", appLanguage)} />
      )}
      {ai.error === "offline" && (
        <Notice icon="offline" title={t("gitaAiOfflineTitle", appLanguage)} body={t("gitaAiOfflineBody", appLanguage)} onDismiss={ai.clearError} dismissLabel={t("dismiss", appLanguage)} />
      )}
      {ai.error && ai.error !== "offline" && (
        <Notice icon="warning" title={t(ai.error, appLanguage)} onDismiss={ai.clearError} dismissLabel={t("dismiss", appLanguage)} danger />
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={process.env.EXPO_OS === "ios" ? headerHeight : 0}
    >
      <Stack.Screen
        options={{
          title: "Gita AI",
          headerRight: () => (
            <View style={{ flexDirection: "row" }}>
              <Pressable accessibilityRole="button" onPress={() => setPicking(true)} hitSlop={8} style={{ justifyContent: "center", paddingHorizontal: spacing.sm }}>
                <Text variant="footnote" tone="accent">
                  {languageName(ai.language ?? "en")}
                </Text>
              </Pressable>
              <IconButton icon="reset" label={t("clearChat", appLanguage)} color={colors.inkSoft} onPress={ai.clearChat} />
            </View>
          ),
        }}
      />
      <FlatList
        ref={list}
        data={ai.messages}
        keyExtractor={(m) => m.id}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: gutter,
          paddingVertical: spacing.lg,
          gap: spacing.md,
          width: "100%",
          maxWidth: layout.maxWidth + gutter * 2,
          alignSelf: "center",
        }}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, paddingVertical: spacing.xxxl }}>
            <Image source={art.emblem} style={{ width: 72, height: 72, borderRadius: 36 }} />
            <Text variant="title" center>
              {t("gitaAiEmptyTitle", appLanguage)}
            </Text>
            <Text variant="callout" tone="soft" center style={{ maxWidth: 320 }}>
              {t("gitaAiEmptyBody", appLanguage)}
            </Text>
            <View style={{ alignSelf: "stretch", gap: spacing.sm, marginTop: spacing.md }}>
              {PROMPTS.map((key) => t(key, appLanguage)).map((p) => (
                <Pressable
                  key={p}
                  accessibilityRole="button"
                  onPress={() => {
                    setInput(p);
                    inputRef.current?.focus();
                  }}
                  style={({ pressed }) => ({
                    padding: spacing.lg,
                    borderRadius: radius.md,
                    borderCurve: "continuous",
                    backgroundColor: pressed ? colors.surfaceMuted : colors.surface,
                  })}
                >
                  <Text variant="callout">{p}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
        ListFooterComponent={footer}
        renderItem={({ item }) => (item.role === "user" ? <UserBubble text={item.text} /> : <ModelBubble text={item.text} />)}
      />
      <View
        style={{
          paddingHorizontal: gutter,
          paddingTop: spacing.sm,
          paddingBottom: insets.bottom + spacing.sm,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.hairline,
          backgroundColor: colors.background,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: spacing.sm, width: "100%", maxWidth: layout.maxWidth, alignSelf: "center" }}>
          <TextInput
            ref={inputRef}
            accessibilityLabel={t("messageToGitaAi", appLanguage)}
            value={input}
            onChangeText={setInput}
            placeholder={t("gitaAiPlaceholder", appLanguage)}
            placeholderTextColor={colors.inkFaint}
            editable={!ai.limitReached}
            multiline
            submitBehavior="submit"
            onSubmitEditing={send}
            style={[
              type.callout,
              {
                flex: 1,
                maxHeight: 128,
                minHeight: 44,
                paddingHorizontal: spacing.lg,
                paddingTop: 11,
                paddingBottom: 11,
                borderRadius: 22,
                backgroundColor: colors.surface,
                color: colors.ink,
                outlineStyle: "none",
              } as object,
            ]}
          />
          <IconButton icon="send" label={t("send", appLanguage)} tone="accent" onPress={send} disabled={!input.trim() || ai.sending || ai.limitReached} size={18} style={{ width: 44, height: 44, borderRadius: 22 }} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function Avatar() {
  return <Image source={art.emblem} style={{ width: 28, height: 28, borderRadius: 14 }} />;
}

function UserBubble({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignSelf: "flex-end", maxWidth: "82%", paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.lg, borderBottomRightRadius: 6, backgroundColor: colors.accent }}>
      <Text selectable variant="callout" style={{ color: colors.onAccent }}>
        {text}
      </Text>
    </View>
  );
}

function ModelBubble({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: spacing.sm, maxWidth: "90%" }}>
      <Avatar />
      <View style={{ flexShrink: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.lg, borderBottomLeftRadius: 6, backgroundColor: colors.surface }}>
        <View style={{ gap: spacing.sm }}>
          {parseRichText(text).map((block, i) => (
            <View key={i} style={{ flexDirection: "row", gap: spacing.sm }}>
              {block.kind === "bullet" ? <RNText style={{ fontFamily: fonts.serif, fontSize: 16, lineHeight: 25, color: colors.flame }}>•</RNText> : null}
              <RNText
                selectable
                style={{
                  flexShrink: 1,
                  fontFamily: block.kind === "heading" ? fonts.serifMedium : block.kind === "quote" ? fonts.serifItalic : fonts.serif,
                  fontSize: block.kind === "heading" ? 17.5 : 16,
                  lineHeight: 25,
                  color: block.kind === "quote" ? colors.inkSoft : colors.ink,
                }}
              >
                {block.spans.map((span, j) => (
                  <RNText key={j} style={span.bold ? { fontFamily: fonts.serifMedium } : undefined}>
                    {span.text}
                  </RNText>
                ))}
              </RNText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function Notice({ icon, title, body, onDismiss, dismissLabel, danger }: { icon: "clock" | "offline" | "warning"; title: string; body?: string; onDismiss?: () => void; dismissLabel?: string; danger?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={{ padding: spacing.lg, gap: spacing.sm, borderRadius: radius.lg, borderCurve: "continuous", backgroundColor: danger ? colors.dangerSoft : colors.surface, alignItems: "center" }}>
      <Icon name={icon} size={20} color={danger ? colors.danger : colors.inkSoft} />
      <Text variant="callout" tone={danger ? "danger" : "ink"} center style={{ fontWeight: "600" }} selectable>
        {title}
      </Text>
      {body ? (
        <Text variant="footnote" tone="soft" center>
          {body}
        </Text>
      ) : null}
      {onDismiss ? <Button size="sm" variant="ghost" title={dismissLabel ?? ""} onPress={onDismiss} /> : null}
    </View>
  );
}
