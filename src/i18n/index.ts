import { stringFixes } from "./fixes";
import { translations } from "./strings";

export const LANGUAGES = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "sa", name: "Sanskrit", native: "संस्कृतम्" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "ne", name: "Nepali", native: "नेपाली" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

const CODES = LANGUAGES.map((l) => l.code) as string[];

/**
 * Strings the original app referenced without a dictionary entry, plus the few new
 * ones this app introduces. English only; other languages fall back to English.
 */
const extras: Record<string, string> = {
  Continue: "Continue",
  download: "Download",
  Today: "Today",
  ThisWeek: "This Week",
  Earlier: "Earlier",
  share: "Share",
  clearAll: "Clear all",
  disabledStatus: "Off",
  keepGoing: "Keep Going",
  readNow: "Read Now",
  noAudioLoadedTitle: "Nothing playing yet",
  noAudioLoadedSub: "Open any verse and press play to listen to its recitation.",
  nowPlayingLabel: "Now playing",
  selectLanguageShort: "Select",
  appearance: "Appearance",
  themeSystem: "System",
  themeLight: "Light",
  themeDark: "Dark",
  audioFallbackNotice: "Recitation isn't available in Sanskrit yet — playing the English recitation.",
  offlineWebNotice: "Offline audio downloads are available in the iOS and Android apps.",
  downloadFailed: "Download failed. Check your connection and try again.",
  sizeApprox: "approx.",
  verseOf: "of",
  startReading: "Start reading",
  continueFrom: "Continue from",
  listen: "Listen",
  signInUnavailableWeb: "Apple sign-in is available on iOS only.",
  dayActive: "days active",
  sessions: "sessions",
  week: "Week",
  month: "Month",
  custom: "Custom",
  selectDates: "Select dates",
  customRangeHint: "Tap a start day, then an end day.",
  gitaAiIntro: "A calm, devotional guide to the wisdom of the Bhagavad Gita.",
  gitaAiLanguageQuestion: "Which language would you like to converse in?",
  gitaAiEmptyTitle: "Hare Krishna",
  gitaAiEmptyBody: "Ask me anything about the Bhagavad Gita, Lord Krishna, or how to use this app.",
  gitaAiPlaceholder: "Ask about the Bhagavad Gita…",
  gitaAiLimitTitle: "Daily limit reached",
  gitaAiLimitBody:
    "You've received today's guidance from Gita AI. Please return tomorrow for more conversations and wisdom.",
  gitaAiOfflineTitle: "No connection",
  gitaAiOfflineBody:
    "An internet connection is needed to speak with Gita AI. Your messages are safely stored locally.",
  dismiss: "Dismiss",
  sending: "Sending…",
  submitting: "Submitting…",
  deleteAccountDetail:
    "This will delete your registered profile, all your notes/reflections, reading history, custom bookmarks, completed verses list, and favorites from our secure servers and this device.",
  accountDeletedToast: "Your account and all study progress have been permanently deleted.",
  accountDeleteFailedToast: "Failed to delete account. Please try again.",
  shareAppMessage: "I'm reading the Bhagavad Gita on Gita Sadhana! Join me on this spiritual journey.",
};

export function t(key: string, lang: string): string {
  const code = CODES.includes(lang) ? lang : "en";
  const fixed = stringFixes[key]?.[code];
  if (fixed) return fixed;
  const entry = translations[key] as Record<string, string | undefined> | undefined;
  if (entry) return entry[code] || entry.en || extras[key] || key;
  return extras[key] ?? key;
}

export function languageName(code: string) {
  return LANGUAGES.find((l) => l.code === code)?.name ?? "English";
}

/** Picks a localized field with English fallback, as the original app did. */
export function pick(map: Record<string, string> | undefined, lang: string) {
  if (!map) return "";
  return map[lang] || map.en || "";
}
