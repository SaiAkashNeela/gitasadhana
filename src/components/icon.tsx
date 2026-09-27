import type { IconProps as PhosphorProps, IconWeight } from "phosphor-react-native";
import { AppleLogoIcon } from "phosphor-react-native/src/icons/AppleLogo";
import { ArrowCircleUpIcon } from "phosphor-react-native/src/icons/ArrowCircleUp";
import { ArrowClockwiseIcon } from "phosphor-react-native/src/icons/ArrowClockwise";
import { ArrowCounterClockwiseIcon } from "phosphor-react-native/src/icons/ArrowCounterClockwise";
import { BellIcon } from "phosphor-react-native/src/icons/Bell";
import { BookIcon } from "phosphor-react-native/src/icons/Book";
import { BookOpenTextIcon } from "phosphor-react-native/src/icons/BookOpenText";
import { BookmarkSimpleIcon } from "phosphor-react-native/src/icons/BookmarkSimple";
import { CalendarBlankIcon } from "phosphor-react-native/src/icons/CalendarBlank";
import { CaretDownIcon } from "phosphor-react-native/src/icons/CaretDown";
import { CaretLeftIcon } from "phosphor-react-native/src/icons/CaretLeft";
import { CaretRightIcon } from "phosphor-react-native/src/icons/CaretRight";
import { ChatTeardropTextIcon } from "phosphor-react-native/src/icons/ChatTeardropText";
import { CheckIcon } from "phosphor-react-native/src/icons/Check";
import { CheckCircleIcon } from "phosphor-react-native/src/icons/CheckCircle";
import { CircleIcon } from "phosphor-react-native/src/icons/Circle";
import { ClockIcon } from "phosphor-react-native/src/icons/Clock";
import { ClockCounterClockwiseIcon } from "phosphor-react-native/src/icons/ClockCounterClockwise";
import { DownloadSimpleIcon } from "phosphor-react-native/src/icons/DownloadSimple";
import { EnvelopeSimpleIcon } from "phosphor-react-native/src/icons/EnvelopeSimple";
import { ExportIcon } from "phosphor-react-native/src/icons/Export";
import { FileTextIcon } from "phosphor-react-native/src/icons/FileText";
import { FlameIcon } from "phosphor-react-native/src/icons/Flame";
import { FlowerLotusIcon } from "phosphor-react-native/src/icons/FlowerLotus";
import { GearSixIcon } from "phosphor-react-native/src/icons/GearSix";
import { GoogleLogoIcon } from "phosphor-react-native/src/icons/GoogleLogo";
import { HandsPrayingIcon } from "phosphor-react-native/src/icons/HandsPraying";
import { HeadphonesIcon } from "phosphor-react-native/src/icons/Headphones";
import { HeartIcon } from "phosphor-react-native/src/icons/Heart";
import { HouseIcon } from "phosphor-react-native/src/icons/House";
import { InfoIcon } from "phosphor-react-native/src/icons/Info";
import { MagnifyingGlassIcon } from "phosphor-react-native/src/icons/MagnifyingGlass";
import { MinusIcon } from "phosphor-react-native/src/icons/Minus";
import { MoonIcon } from "phosphor-react-native/src/icons/Moon";
import { NotePencilIcon } from "phosphor-react-native/src/icons/NotePencil";
import { PaperPlaneRightIcon } from "phosphor-react-native/src/icons/PaperPlaneRight";
import { PauseIcon } from "phosphor-react-native/src/icons/Pause";
import { PencilLineIcon } from "phosphor-react-native/src/icons/PencilLine";
import { PlayIcon } from "phosphor-react-native/src/icons/Play";
import { PlusIcon } from "phosphor-react-native/src/icons/Plus";
import { QuotesIcon } from "phosphor-react-native/src/icons/Quotes";
import { RepeatIcon } from "phosphor-react-native/src/icons/Repeat";
import { RepeatOnceIcon } from "phosphor-react-native/src/icons/RepeatOnce";
import { ScrollIcon } from "phosphor-react-native/src/icons/Scroll";
import { ShareNetworkIcon } from "phosphor-react-native/src/icons/ShareNetwork";
import { ShieldCheckIcon } from "phosphor-react-native/src/icons/ShieldCheck";
import { SignOutIcon } from "phosphor-react-native/src/icons/SignOut";
import { SkipBackIcon } from "phosphor-react-native/src/icons/SkipBack";
import { SkipForwardIcon } from "phosphor-react-native/src/icons/SkipForward";
import { SpeakerHighIcon } from "phosphor-react-native/src/icons/SpeakerHigh";
import { StopCircleIcon } from "phosphor-react-native/src/icons/StopCircle";
import { SunIcon } from "phosphor-react-native/src/icons/Sun";
import { TextAaIcon } from "phosphor-react-native/src/icons/TextAa";
import { TranslateIcon } from "phosphor-react-native/src/icons/Translate";
import { TrashIcon } from "phosphor-react-native/src/icons/Trash";
import { TrophyIcon } from "phosphor-react-native/src/icons/Trophy";
import { UserCircleIcon } from "phosphor-react-native/src/icons/UserCircle";
import { WarningIcon } from "phosphor-react-native/src/icons/Warning";
import { WifiSlashIcon } from "phosphor-react-native/src/icons/WifiSlash";
import { XIcon } from "phosphor-react-native/src/icons/X";
import type { ComponentType } from "react";
import { Text, View, type ColorValue, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "@/providers/theme";
import { fonts } from "@/theme";

/**
 * One icon family on every platform: Phosphor (phosphor-icons.com), chosen for its soft,
 * organic strokes and its weights — "regular" for controls, "fill" for active states and
 * "duotone" for the calm, tinted icons in lists. Each icon is imported on its own so only
 * these are bundled. "om" is drawn from the Devanagari glyph itself.
 */
type Entry = { icon: ComponentType<PhosphorProps>; weight?: IconWeight };

const glyphs = {
  home: { icon: HouseIcon },
  homeFill: { icon: HouseIcon, weight: "fill" },
  book: { icon: BookOpenTextIcon },
  bookFill: { icon: BookOpenTextIcon, weight: "fill" },
  sparkles: { icon: FlowerLotusIcon },
  bookmark: { icon: BookmarkSimpleIcon },
  bookmarkFill: { icon: BookmarkSimpleIcon, weight: "fill" },
  person: { icon: UserCircleIcon },
  personFill: { icon: UserCircleIcon, weight: "fill" },
  play: { icon: PlayIcon, weight: "fill" },
  pause: { icon: PauseIcon, weight: "fill" },
  next: { icon: SkipForwardIcon, weight: "fill" },
  previous: { icon: SkipBackIcon, weight: "fill" },
  back10: { icon: ArrowCounterClockwiseIcon },
  forward10: { icon: ArrowClockwiseIcon },
  repeat: { icon: RepeatIcon },
  repeatOne: { icon: RepeatOnceIcon },
  download: { icon: DownloadSimpleIcon },
  downloaded: { icon: CheckCircleIcon, weight: "fill" },
  check: { icon: CheckIcon },
  checkCircle: { icon: CheckCircleIcon, weight: "fill" },
  circle: { icon: CircleIcon },
  share: { icon: ExportIcon },
  shareAndroid: { icon: ShareNetworkIcon },
  heart: { icon: HeartIcon },
  heartFill: { icon: HeartIcon, weight: "fill" },
  search: { icon: MagnifyingGlassIcon },
  bell: { icon: BellIcon },
  gear: { icon: GearSixIcon },
  chevronRight: { icon: CaretRightIcon },
  chevronLeft: { icon: CaretLeftIcon },
  chevronDown: { icon: CaretDownIcon },
  flame: { icon: FlameIcon },
  flameFill: { icon: FlameIcon, weight: "fill" },
  clock: { icon: ClockIcon },
  history: { icon: ClockCounterClockwiseIcon },
  note: { icon: NotePencilIcon },
  language: { icon: TranslateIcon },
  speaker: { icon: SpeakerHighIcon },
  textSize: { icon: TextAaIcon },
  plus: { icon: PlusIcon },
  minus: { icon: MinusIcon },
  trash: { icon: TrashIcon },
  mail: { icon: EnvelopeSimpleIcon },
  doc: { icon: FileTextIcon },
  shield: { icon: ShieldCheckIcon },
  megaphone: { icon: PencilLineIcon },
  logout: { icon: SignOutIcon },
  close: { icon: XIcon },
  send: { icon: PaperPlaneRightIcon },
  offline: { icon: WifiSlashIcon },
  reset: { icon: ArrowCounterClockwiseIcon },
  chat: { icon: ChatTeardropTextIcon },
  calendar: { icon: CalendarBlankIcon },
  trophy: { icon: TrophyIcon },
  headphones: { icon: HeadphonesIcon },
  quote: { icon: QuotesIcon },
  sun: { icon: SunIcon },
  moon: { icon: MoonIcon },
  info: { icon: InfoIcon },
  lotus: { icon: FlowerLotusIcon },
  arrowUp: { icon: ArrowCircleUpIcon },
  warning: { icon: WarningIcon },
  words: { icon: BookIcon },
  apple: { icon: AppleLogoIcon, weight: "fill" },
  google: { icon: GoogleLogoIcon },
  stop: { icon: StopCircleIcon },
  namaste: { icon: HandsPrayingIcon },
  scroll: { icon: ScrollIcon },
} satisfies Record<string, Entry>;

export type IconName = keyof typeof glyphs | "om";

export function Icon({
  name,
  size = 22,
  color,
  weight,
  style,
}: {
  name: IconName;
  size?: number;
  color?: ColorValue;
  weight?: IconWeight;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const tint = (color ?? colors.ink) as string;

  if (name === "om") {
    return (
      <View style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]} accessible={false}>
        <Text style={{ fontFamily: fonts.devanagariMedium, fontSize: size * 0.92, lineHeight: size * 1.25, color: tint, includeFontPadding: false }}>ॐ</Text>
      </View>
    );
  }

  const key = name === "share" && process.env.EXPO_OS === "android" ? "shareAndroid" : name;
  const entry: Entry = glyphs[key];
  const Glyph = entry.icon;
  return (
    <View style={[{ width: size, height: size, pointerEvents: "none" }, style]} accessible={false}>
      <Glyph size={size} color={tint} weight={weight ?? entry.weight ?? "regular"} />
    </View>
  );
}
