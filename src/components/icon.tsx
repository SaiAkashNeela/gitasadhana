import { SymbolView } from "expo-symbols";
import type { ColorValue, StyleProp, ViewStyle } from "react-native";

import { useTheme } from "@/providers/theme";

/**
 * One icon vocabulary for the app: SF Symbols on iOS, Material Symbols on Android and web.
 */
const glyphs = {
  home: { ios: "house", android: "home" },
  homeFill: { ios: "house.fill", android: "home" },
  book: { ios: "book", android: "menu_book" },
  bookFill: { ios: "book.fill", android: "menu_book" },
  sparkles: { ios: "sparkles", android: "auto_awesome" },
  bookmark: { ios: "bookmark", android: "bookmark_border" },
  bookmarkFill: { ios: "bookmark.fill", android: "bookmark_added" },
  person: { ios: "person.crop.circle", android: "account_circle" },
  personFill: { ios: "person.crop.circle.fill", android: "account_circle" },
  play: { ios: "play.fill", android: "play_arrow" },
  pause: { ios: "pause.fill", android: "pause" },
  next: { ios: "forward.end.fill", android: "skip_next" },
  previous: { ios: "backward.end.fill", android: "skip_previous" },
  back10: { ios: "gobackward.10", android: "replay_10" },
  forward10: { ios: "goforward.10", android: "forward_10" },
  repeat: { ios: "repeat", android: "repeat" },
  repeatOne: { ios: "repeat.1", android: "repeat_one" },
  download: { ios: "arrow.down.circle", android: "download" },
  downloaded: { ios: "arrow.down.circle.fill", android: "offline_pin" },
  check: { ios: "checkmark", android: "check" },
  checkCircle: { ios: "checkmark.circle.fill", android: "task_alt" },
  circle: { ios: "circle", android: "radio_button_unchecked" },
  share: { ios: "square.and.arrow.up", android: "share" },
  heart: { ios: "heart", android: "favorite_border" },
  heartFill: { ios: "heart.fill", android: "heart_check" },
  search: { ios: "magnifyingglass", android: "search" },
  bell: { ios: "bell", android: "notifications" },
  gear: { ios: "gearshape", android: "settings" },
  chevronRight: { ios: "chevron.right", android: "chevron_right" },
  chevronLeft: { ios: "chevron.left", android: "chevron_left" },
  chevronDown: { ios: "chevron.down", android: "keyboard_arrow_down" },
  flame: { ios: "flame", android: "local_fire_department" },
  flameFill: { ios: "flame.fill", android: "local_fire_department" },
  clock: { ios: "clock", android: "schedule" },
  history: { ios: "clock.arrow.circlepath", android: "history" },
  note: { ios: "square.and.pencil", android: "edit_note" },
  language: { ios: "character.book.closed", android: "translate" },
  speaker: { ios: "speaker.wave.2", android: "volume_up" },
  textSize: { ios: "textformat.size", android: "format_size" },
  plus: { ios: "plus", android: "add" },
  minus: { ios: "minus", android: "remove" },
  trash: { ios: "trash", android: "delete" },
  mail: { ios: "envelope", android: "mail" },
  doc: { ios: "doc.text", android: "description" },
  shield: { ios: "hand.raised", android: "policy" },
  megaphone: { ios: "megaphone", android: "campaign" },
  logout: { ios: "rectangle.portrait.and.arrow.right", android: "logout" },
  close: { ios: "xmark", android: "close" },
  send: { ios: "arrow.up", android: "arrow_upward" },
  offline: { ios: "wifi.slash", android: "wifi_off" },
  reset: { ios: "arrow.counterclockwise", android: "refresh" },
  chat: { ios: "bubble.left.and.text.bubble.right", android: "forum" },
  calendar: { ios: "calendar", android: "calendar_month" },
  trophy: { ios: "trophy", android: "emoji_events" },
  headphones: { ios: "headphones", android: "headphones" },
  quote: { ios: "quote.opening", android: "format_quote" },
  sun: { ios: "sun.max", android: "light_mode" },
  moon: { ios: "moon", android: "dark_mode" },
  info: { ios: "info.circle", android: "info" },
  lotus: { ios: "camera.macro", android: "spa" },
  arrowUp: { ios: "arrow.up.circle", android: "arrow_circle_up" },
  warning: { ios: "exclamationmark.triangle", android: "warning" },
  words: { ios: "text.book.closed", android: "dictionary" },
  apple: { ios: "apple.logo", android: "phone_iphone" },
  stop: { ios: "stop.circle", android: "stop_circle" },
} as const;

export type IconName = keyof typeof glyphs;

export function Icon({
  name,
  size = 22,
  color,
  style,
}: {
  name: IconName;
  size?: number;
  color?: ColorValue;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const g = glyphs[name];
  return (
    <SymbolView
      name={{ ios: g.ios as any, android: g.android as any, web: g.android as any }}
      size={size}
      tintColor={color ?? colors.ink}
      style={style}
      accessible={false}
    />
  );
}
