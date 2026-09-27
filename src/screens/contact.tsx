import { Stack } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Linking } from "react-native";

import { Button } from "@/components/button";
import { Column, Screen } from "@/components/layout";
import { Group, Row } from "@/components/list";
import { Field } from "@/components/misc";
import { Text } from "@/components/text";
import { toast } from "@/components/toast";
import { t } from "@/i18n";
import { sendContactEmail } from "@/lib/email";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";

export function ContactScreen() {
  const { colors } = useTheme();
  const { user, language } = useProgress();
  const [email, setEmail] = useState(user?.email ?? "");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!email.trim() || !message.trim()) {
      setError(t("allFieldsRequired", language));
      return;
    }
    setError(null);
    setSending(true);
    try {
      await sendContactEmail(email.trim(), message.trim());
      toast.success(t("messageSentToast", language));
      setMessage("");
    } catch {
      setError(t("sendFailed", language));
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}>
      <Stack.Screen options={{ title: t("contactUsTitle", language) }} />
      <Screen>
        <Column>
          <Group>
            <Row icon="mail" title="hello@gitasadhana.com" subtitle={t("emailUsDirectly", language)} onPress={() => Linking.openURL("mailto:hello@gitasadhana.com")} />
          </Group>
        </Column>
        <Column>
          <Field
            label={t("yourEmail", language)}
            value={email}
            onChangeText={setEmail}
            editable={!user}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Field label={t("messageLabel", language)} value={message} onChangeText={setMessage} placeholder={t("contactMessagePlaceholder", language)} multiline />
          {error ? (
            <Text variant="footnote" tone="danger" selectable>
              {error}
            </Text>
          ) : null}
          <Button title={sending ? t("sending", language) : t("submitBtn", language)} loading={sending} onPress={submit} />
        </Column>
      </Screen>
    </KeyboardAvoidingView>
  );
}
