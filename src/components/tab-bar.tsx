import type { BottomTabBarProps } from "expo-router/js-tabs";
import { Pressable, StyleSheet, View } from "react-native";

import { t } from "@/i18n";
import { tap } from "@/lib/haptics";
import { useAudio } from "@/providers/audio";
import { useProgress } from "@/providers/progress";
import { useTheme } from "@/providers/theme";
import { layout, spacing } from "@/theme";

import { Icon, type IconName } from "./icon";
import { MiniPlayer } from "./mini-player";
import { Text } from "./text";

const TABS: Record<string, { label: string; icon: IconName }> = {
  home: { label: "home", icon: "home" },
  chapters: { label: "chapters", icon: "book" },
  wisdom: { label: "wisdom", icon: "sparkles" },
  bookmarks: { label: "saved", icon: "bookmark" },
  profile: { label: "profile", icon: "person" },
};

/** Docked tab bar with the now-playing strip resting above it. */
export function TabBar({ state, navigation, insets }: BottomTabBarProps) {
  const { colors } = useTheme();
  const { language } = useProgress();
  const audio = useAudio();
  const current = state.routes[state.index]?.name;
  const showUpNext = current === "home" || current === "chapters";

  return (
    <View style={{ pointerEvents: "box-none", position: "absolute", left: 0, right: 0, bottom: 0 }}>
      {(audio.currentVerse || showUpNext) && (
        <View style={{ paddingBottom: spacing.sm, paddingHorizontal: spacing.md, alignItems: "center" }}>
          <MiniPlayer showUpNext={showUpNext} />
        </View>
      )}
      <View
        accessibilityRole="tablist"
        style={{
          flexDirection: "row",
          backgroundColor: colors.surface,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.hairline,
          paddingBottom: insets.bottom,
        }}
      >
        {state.routes.map((route, index) => {
          const meta = TABS[route.name];
          if (!meta) return null;
          const focused = state.index === index;
          const label = t(meta.label, language);
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              onPress={() => {
                const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) {
                  tap();
                  navigation.navigate(route.name, route.params);
                }
              }}
              style={{ flex: 1, height: layout.tabBarHeight, alignItems: "center", justifyContent: "center", gap: 3 }}
            >
              <Icon name={meta.icon} weight={focused ? "fill" : "regular"} size={24} color={focused ? colors.accent : colors.inkFaint} />
              <Text variant="caption" numberOfLines={1} style={{ fontSize: 11.5, color: focused ? colors.accent : colors.inkFaint, fontWeight: focused ? "600" : "400" }}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
