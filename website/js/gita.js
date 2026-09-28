// Bhagavad Gita content: chapters, verses, quotes and per-language translations.
import { lang } from "./i18n.js";
import { store } from "./store.js";

const cache = new Map();
const json = (url) => {
  if (!cache.has(url)) cache.set(url, fetch(url).then((r) => {
    if (!r.ok) throw new Error(`${url}: ${r.status}`);
    return r.json();
  }));
  return cache.get(url);
};

let chapters = [];
let verses = [];
let verseIndex = new Map();
let quotes = {};
const tables = new Map();

const TRANSLATED = ["bn", "en", "gu", "hi", "kn", "ml", "mr", "ne", "or", "pa", "sa", "ta", "te"];

/** Loads the core content plus translations for the reader's language and English. */
export async function loadGita({ translations = true } = {}) {
  const [ch, core, q] = await Promise.all([json("data/chapters.json"), json("data/verses-core.json"), json("data/quotes.json")]);
  chapters = ch;
  quotes = q;
  verses = core.map((v) => ({ id: `${v.c}.${v.v}`, chapter: v.c, verse: v.v, sanskrit: v.sa, transliteration: v.tr, wordMeanings: v.wm }));
  verseIndex = new Map(verses.map((v) => [v.id, v]));
  if (translations) await loadTranslations(lang);
}

export async function loadTranslations(code) {
  const want = [...new Set(["en", TRANSLATED.includes(code) ? code : "en"])];
  await Promise.all(want.map(async (c) => {
    if (!tables.has(c)) tables.set(c, await json(`data/gita/${c}.json`));
  }));
}

export const getChapters = () => chapters;
export const getChapter = (n) => chapters.find((c) => c.number === Number(n));
export const allVerses = () => verses;
export const versesIn = (n) => verses.filter((v) => v.chapter === Number(n));
export const TOTAL_VERSES = 701;

export function normalizeId(id) {
  const [c, v] = String(id).split(/[.\-_]/).map(Number);
  return `${c}.${v}`;
}
export const getVerse = (id) => verseIndex.get(normalizeId(id));

export function adjacent(id, step) {
  const v = getVerse(id);
  if (!v) return null;
  const ch = getChapter(v.chapter);
  const next = v.verse + step;
  return ch && next >= 1 && next <= ch.verseCount ? `${v.chapter}.${next}` : null;
}

/** Translation for a verse, with field-level English fallback like the original app. */
export function translation(id, code = lang) {
  const key = normalizeId(id);
  const table = tables.get(TRANSLATED.includes(code) ? code : "en");
  if (!table) return null;
  const own = table[key];
  const en = tables.get("en")?.[key];
  if (!own && !en) return null;
  const pick = (i) => (own?.[i] || en?.[i] || "");
  return { simple: pick(0), deep: pick(1), essence: pick(2) };
}

export function quotesFor(code = lang) {
  return quotes[code] ?? quotes.en ?? [];
}

export function findQuote(id) {
  const code = String(id).split("-")[0];
  return (quotes[code] ?? []).find((q) => q.id === id);
}

export function search(query, limit = 30) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const own = tables.get(lang);
  const en = tables.get("en");
  const out = [];
  for (const v of verses) {
    const hay = `${v.sanskrit} ${v.transliteration} ${own?.[v.id]?.[0] ?? ""} ${en?.[v.id]?.[0] ?? ""}`.toLowerCase();
    if (hay.includes(q)) {
      out.push(v);
      if (out.length >= limit) break;
    }
  }
  return out;
}

export function themeVerses(query) {
  const own = tables.get(lang);
  const en = tables.get("en");
  return verses.filter((v) => `${own?.[v.id]?.[0] ?? ""} ${en?.[v.id]?.[0] ?? ""}`.toLowerCase().includes(query));
}

export function parseWordMeanings(raw) {
  if (!raw) return [];
  return raw
    .split(";")
    .map((pair) => {
      const parts = pair.split(/[—–-]/);
      return { word: parts[0]?.trim() ?? "", meaning: parts[1]?.trim() ?? "" };
    })
    .filter((p) => p.word && p.meaning);
}

/** One item per calendar day, no repeats until the pool is exhausted (same keys as the app). */
export function pickDaily(kind, items) {
  if (!items.length) return null;
  const key = kind === "verse" ? "gita_verse_of_the_day" : "gita_daily_wisdom";
  const today = new Date().toDateString();
  const cached = store.get(key, null);
  if (cached?.date === today) {
    const hit = items.find((i) => i.id === cached.id);
    if (hit) return hit;
  }
  let pool = store.get(`${key}_pool`, []);
  let unseen = items.filter((i) => !pool.includes(i.id));
  if (!unseen.length) {
    pool = [];
    unseen = items;
  }
  const chosen = unseen[Math.floor(Math.random() * unseen.length)];
  store.set(`${key}_pool`, [...pool, chosen.id]);
  store.set(key, { date: today, id: chosen.id });
  return chosen;
}

export const THEMES = [
  { id: "t1", slug: "duty", query: "duty", scene: 1 },
  { id: "t2", slug: "detachment", query: "detachment", scene: 3 },
  { id: "t3", slug: "devotion", query: "devotion", scene: 5 },
  { id: "t4", slug: "meditation", query: "meditation", scene: 7 },
  { id: "t5", slug: "soul", query: "soul", scene: 8 },
  { id: "t6", slug: "liberation", query: "liberation", scene: 9 },
];

export const chapterArt = (n) => `assets/art/chapters/chapter-${n}.jpg`;
export const chapterThumb = (n) => `assets/art/thumbs/chapter-${n}.jpg`;
export const sceneArt = (n) => `assets/art/scenes/scene-${n}.jpg`;
