import { store } from "./store.js";

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
];
export const CODES = LANGUAGES.map((l) => l.code);

/**
 * Content pages carry their language in the URL (/hi/chapter/2/, English has no prefix), so
 * a shared or search-result link always opens in the language it was written in. Every other
 * page follows the reader's saved choice.
 */
export function pageLanguage() {
  const set = document.documentElement.dataset.lang;
  if (set && CODES.includes(set)) return set;
  const first = location.pathname.split("/").filter(Boolean)[0];
  if (CODES.includes(first)) return first;
  return ["chapter", "chapters", "theme", "wisdom"].includes(first) ? "en" : null;
}

function initialLanguage() {
  const fromPage = pageLanguage();
  if (fromPage) return fromPage;
  const saved = store.getString("gita_language");
  if (saved && CODES.includes(saved)) return saved;
  const browser = (navigator.language || "en").slice(0, 2);
  return CODES.includes(browser) ? browser : "en";
}

export let lang = initialLanguage();
let dict = {};
let english = {};

/** Loads the UI dictionary for the reader's language (and English as the fallback). */
export async function loadStrings() {
  const get = (code) => fetch(`data/i18n/${code}.json`).then((r) => r.json());
  [english, dict] = await Promise.all([get("en"), lang === "en" ? null : get(lang)]);
  if (!dict) dict = english;
  document.documentElement.lang = lang;
}

export function t(key) {
  return dict[key] ?? english[key] ?? key;
}

/** t() with {placeholder} substitution. */
export function tf(key, vars) {
  return t(key).replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m));
}

export function reminderText() {
  return dict.__reminders ?? english.__reminders;
}

export function pick(map) {
  if (!map) return "";
  return map[lang] || map.en || "";
}

export function languageName(code) {
  return LANGUAGES.find((l) => l.code === code)?.name ?? "English";
}

export function localeFor(code = lang) {
  if (code === "en") return "en-IN";
  if (code === "sa") return "hi-IN";
  return `${code}-IN`;
}

/**
 * Switching language reloads so every string and translation is fetched fresh. Content pages
 * move to the same page in the new language (their hreflang alternate).
 */
export function setLanguage(code) {
  if (!CODES.includes(code) || code === lang) return;
  store.set("gita_language", code);
  const alternate = document.querySelector(`link[rel="alternate"][hreflang="${code}"]`)?.href;
  // hreflang links carry the production address; stay on this host (previews, local runs).
  if (alternate && pageLanguage()) location.href = new URL(alternate).pathname;
  else location.reload();
}
