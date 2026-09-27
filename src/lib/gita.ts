import { Asset } from "expo-asset";
import { File } from "expo-file-system";
import { useEffect, useSyncExternalStore } from "react";

import chaptersJson from "@/data/chapters.json";
import quotesJson from "@/data/quotes.json";
import coreJson from "@/data/verses-core.json";

export type Chapter = {
  number: number;
  verseCount: number;
  title: Record<string, string>;
  summary: Record<string, string>;
  fullSummary: Record<string, string>;
};

type CoreVerse = { c: number; v: number; sa: string; tr: string; wm: string };

export type Translation = { simple: string; deep: string; essence: string };

export type Verse = {
  id: string; // "2.47"
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration: string;
  wordMeanings: string;
};

export type Quote = { id: string; text: string };

export const chapters = chaptersJson as Chapter[];
export const TOTAL_VERSES = (coreJson as CoreVerse[]).length;

const verseList: Verse[] = (coreJson as CoreVerse[]).map((v) => ({
  id: `${v.c}.${v.v}`,
  chapter: v.c,
  verse: v.v,
  sanskrit: v.sa,
  transliteration: v.tr,
  wordMeanings: v.wm,
}));
const verseIndex = new Map(verseList.map((v) => [v.id, v]));

export const allVerses = verseList;

export function getChapter(n: number) {
  return chapters.find((c) => c.number === n);
}

export function getVerse(id: string) {
  return verseIndex.get(normalizeVerseId(id));
}

export function versesInChapter(n: number) {
  return verseList.filter((v) => v.chapter === n);
}

/** Accepts "2.47", "2-47" or "2_47" like the original router did. */
export function normalizeVerseId(id: string) {
  const [c, v] = id.split(/[.\-_]/).map(Number);
  return `${c}.${v}`;
}

export function parseVerseId(id: string) {
  const [chapter, verse] = normalizeVerseId(id).split(".").map(Number);
  return { chapter, verse };
}

export function adjacentVerse(id: string, step: 1 | -1) {
  const { chapter, verse } = parseVerseId(id);
  const ch = getChapter(chapter);
  const next = verse + step;
  if (!ch || next < 1 || next > ch.verseCount) return null;
  return `${chapter}.${next}`;
}

export function quotesFor(lang: string): Quote[] {
  const map = quotesJson as Record<string, Quote[]>;
  return map[lang] ?? map.en ?? [];
}

/* ───────────── Translations: loaded per language on demand ───────────── */

const translationAssets: Record<string, number> = {
  bn: require("@/assets/gita/bn.gita"),
  en: require("@/assets/gita/en.gita"),
  gu: require("@/assets/gita/gu.gita"),
  hi: require("@/assets/gita/hi.gita"),
  kn: require("@/assets/gita/kn.gita"),
  ml: require("@/assets/gita/ml.gita"),
  mr: require("@/assets/gita/mr.gita"),
  ne: require("@/assets/gita/ne.gita"),
  or: require("@/assets/gita/or.gita"),
  pa: require("@/assets/gita/pa.gita"),
  sa: require("@/assets/gita/sa.gita"),
  ta: require("@/assets/gita/ta.gita"),
  te: require("@/assets/gita/te.gita"),
};

type TranslationTable = Record<string, [string, string, string]>;

const tables = new Map<string, TranslationTable>();
const pending = new Map<string, Promise<TranslationTable>>();
const failures = new Map<string, Error>();
const listeners = new Set<() => void>();
type StoreSnapshot = { tables: ReadonlyMap<string, TranslationTable>; failures: ReadonlyMap<string, Error> };
let snapshot: StoreSnapshot = { tables: new Map(), failures: new Map() };

function notify() {
  // A fresh immutable snapshot per change, so memoized components see the update.
  snapshot = { tables: new Map(tables), failures: new Map(failures) };
  listeners.forEach((l) => l());
}

async function readAssetText(moduleId: number) {
  const asset = Asset.fromModule(moduleId);
  if (process.env.EXPO_OS === "web") {
    const res = await fetch(asset.uri);
    if (!res.ok) throw new Error(`Failed to load translations (${res.status})`);
    return res.text();
  }
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  if (uri.startsWith("http")) {
    const res = await fetch(uri);
    return res.text();
  }
  return new File(uri).text();
}

export function loadTranslations(lang: string): Promise<TranslationTable> {
  const code = translationAssets[lang] ? lang : "en";
  const ready = tables.get(code);
  if (ready) return Promise.resolve(ready);
  const inflight = pending.get(code);
  if (inflight) return inflight;
  const p = readAssetText(translationAssets[code])
    .then((text) => {
      const table = JSON.parse(text) as TranslationTable;
      tables.set(code, table);
      failures.delete(code);
      pending.delete(code);
      notify();
      return table;
    })
    .catch((e: Error) => {
      pending.delete(code);
      failures.set(code, e);
      notify();
      throw e;
    });
  pending.set(code, p);
  return p;
}

function toTranslation(row?: [string, string, string]): Translation | null {
  if (!row) return null;
  return { simple: row[0], deep: row[1], essence: row[2] };
}

function lookup(source: ReadonlyMap<string, TranslationTable>, id: string, lang: string): Translation | null {
  const key = normalizeVerseId(id);
  const own = toTranslation(source.get(lang)?.[key]);
  const en = toTranslation(source.get("en")?.[key]);
  if (!own) return en;
  if (!en) return own;
  // Field-level English fallback, matching `translation[lang]?.x || translation.en?.x`.
  return {
    simple: own.simple || en.simple,
    deep: own.deep || en.deep,
    essence: own.essence || en.essence,
  };
}

/**
 * Subscribes a component to translation loading for `lang` (plus English, which is
 * always the fallback). Re-renders once the table arrives.
 */
export function useTranslations(lang: string) {
  const snap = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => snapshot,
    () => snapshot,
  );
  useEffect(() => {
    // Errors are surfaced through the snapshot; the store notification re-renders us.
    loadTranslations("en").catch(() => {});
    loadTranslations(lang).catch(() => {});
  }, [lang]);
  const code = translationAssets[lang] ? lang : "en";
  const ready = snap.tables.has(code) && snap.tables.has("en");
  const error = snap.failures.get(code) ?? snap.failures.get("en") ?? null;
  return {
    ready,
    error,
    retry: () => {
      failures.delete(code);
      failures.delete("en");
      notify();
      loadTranslations("en").catch(() => {});
      loadTranslations(lang).catch(() => {});
    },
    get: (id: string) => lookup(snap.tables, id, lang),
  };
}

/* ───────────── Search (same fields as the original app) ───────────── */

export function searchVerses(query: string, lang: string, limit = 15): Verse[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const own = tables.get(lang);
  const en = tables.get("en");
  const out: Verse[] = [];
  for (const v of verseList) {
    const hay = `${v.sanskrit} ${v.transliteration} ${own?.[v.id]?.[0] ?? ""} ${en?.[v.id]?.[0] ?? ""}`.toLowerCase();
    if (hay.includes(q)) {
      out.push(v);
      if (out.length >= limit) break;
    }
  }
  return out;
}

export function searchTranslations(query: string, lang: string, limit: number) {
  const q = query.toLowerCase();
  const own = tables.get(lang);
  const en = tables.get("en");
  const out: Verse[] = [];
  for (const v of verseList) {
    const hay = `${own?.[v.id]?.[0] ?? ""} ${en?.[v.id]?.[0] ?? ""}`.toLowerCase();
    if (hay.includes(q)) {
      out.push(v);
      if (out.length >= limit) break;
    }
  }
  return out;
}

/** Parses "word—meaning; word—meaning" into pairs, like the original Word Meanings screen. */
export function parseWordMeanings(raw: string) {
  if (!raw) return [];
  return raw
    .split(";")
    .map((pair) => {
      const parts = pair.split(/[—–-]/);
      return { word: parts[0]?.trim() ?? "", meaning: parts[1]?.trim() ?? "" };
    })
    .filter((p) => p.word && p.meaning);
}

/* ───────────── Artwork shipped in the repo ───────────── */

export const chapterArt: Record<number, number> = {
  1: require("@/assets/art/chapters/chapter-1.jpg"),
  2: require("@/assets/art/chapters/chapter-2.jpg"),
  3: require("@/assets/art/chapters/chapter-3.jpg"),
  4: require("@/assets/art/chapters/chapter-4.jpg"),
  5: require("@/assets/art/chapters/chapter-5.jpg"),
  6: require("@/assets/art/chapters/chapter-6.jpg"),
  7: require("@/assets/art/chapters/chapter-7.jpg"),
  8: require("@/assets/art/chapters/chapter-8.jpg"),
  9: require("@/assets/art/chapters/chapter-9.jpg"),
  10: require("@/assets/art/chapters/chapter-10.jpg"),
  11: require("@/assets/art/chapters/chapter-11.jpg"),
  12: require("@/assets/art/chapters/chapter-12.jpg"),
  13: require("@/assets/art/chapters/chapter-13.jpg"),
  14: require("@/assets/art/chapters/chapter-14.jpg"),
  15: require("@/assets/art/chapters/chapter-15.jpg"),
  16: require("@/assets/art/chapters/chapter-16.jpg"),
  17: require("@/assets/art/chapters/chapter-17.jpg"),
  18: require("@/assets/art/chapters/chapter-18.jpg"),
};

export const sceneArt: number[] = [
  require("@/assets/art/scenes/scene-1.jpg"),
  require("@/assets/art/scenes/scene-2.jpg"),
  require("@/assets/art/scenes/scene-3.jpg"),
  require("@/assets/art/scenes/scene-4.jpg"),
  require("@/assets/art/scenes/scene-5.jpg"),
  require("@/assets/art/scenes/scene-6.jpg"),
  require("@/assets/art/scenes/scene-7.jpg"),
  require("@/assets/art/scenes/scene-8.jpg"),
  require("@/assets/art/scenes/scene-9.jpg"),
];

export const art = {
  welcome: require("@/assets/art/welcome-journey.jpg"),
  listen: require("@/assets/art/listen-return.jpg"),
  read: require("@/assets/art/read-focus.jpg"),
  krishna: require("@/assets/art/lord-krishna.jpg"),
  landscape: require("@/assets/art/sepia-landscape.jpg"),
  emblem: require("@/assets/art/brand/emblem.png"),
};
