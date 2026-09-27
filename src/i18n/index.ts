import { appStrings } from "./app-strings";
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

export function t(key: string, lang: string): string {
  const code = CODES.includes(lang) ? lang : "en";
  const entry = translations[key] as Record<string, string | undefined> | undefined;
  const added = appStrings[key];
  return stringFixes[key]?.[code] || entry?.[code] || added?.[code] || entry?.en || added?.en || key;
}

/** t() with {placeholder} substitution: tf("streakDays", lang, { n: 5 }). */
export function tf(key: string, lang: string, vars: Record<string, string | number>): string {
  return t(key, lang).replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m));
}

export function languageName(code: string) {
  return LANGUAGES.find((l) => l.code === code)?.name ?? "English";
}

/** Picks a localized field with English fallback, as the original app did. */
export function pick(map: Record<string, string> | undefined, lang: string) {
  if (!map) return "";
  return map[lang] || map.en || "";
}
