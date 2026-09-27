import {
  EBGaramond_400Regular,
  EBGaramond_400Regular_Italic,
  EBGaramond_500Medium,
  EBGaramond_600SemiBold,
} from "@expo-google-fonts/eb-garamond";
import { Marcellus_400Regular } from "@expo-google-fonts/marcellus";
import { NotoSerifDevanagari_400Regular, NotoSerifDevanagari_500Medium } from "@expo-google-fonts/noto-serif-devanagari";
import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ToastHost } from "@/components/toast";
import { useNotificationRouting } from "@/hooks/use-notification-routing";
import { useOtaUpdates } from "@/hooks/use-ota-updates";
import { AudioProvider } from "@/providers/audio";
import { ProgressProvider } from "@/providers/progress";
import { ThemeProvider, useTheme } from "@/providers/theme";
import { fonts } from "@/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

// Deep links (e.g. a reminder opening /verse/2.47) land with the tabs underneath, so Back works.
export const unstable_settings = { initialRouteName: "(tabs)" };

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Marcellus_400Regular,
    EBGaramond_400Regular,
    EBGaramond_400Regular_Italic,
    EBGaramond_500Medium,
    EBGaramond_600SemiBold,
    NotoSerifDevanagari_400Regular,
    NotoSerifDevanagari_500Medium,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <ProgressProvider>
          <AudioProvider>
            <Navigator />
          </AudioProvider>
        </ProgressProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function Navigator() {
  const { colors, scheme } = useTheme();
  useNotificationRouting();
  useOtaUpdates();
  const base = scheme === "dark" ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.accent,
      background: colors.background,
      card: colors.background,
      text: colors.ink,
      border: colors.hairline,
    },
  };

  return (
    <NavThemeProvider value={navTheme}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.accent,
          headerTitleStyle: { fontFamily: fonts.display, color: colors.ink, fontSize: 17 },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: "minimal",
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false, animation: "fade" }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: "fade" }} />
        <Stack.Screen name="player" options={{ presentation: "modal", headerShown: false }} />
        <Stack.Screen name="gita-ai" options={{ title: "Gita AI" }} />
      </Stack>
      <ToastHost />
    </NavThemeProvider>
  );
}
