#!/usr/bin/env node
// Builds the app's Gita content from the original sources in capacitor-app/.
// Output:
//   src/data/chapters.json       chapter titles/summaries merged with the curated translations
//   src/data/verses-core.json    sanskrit, transliteration and word meanings for all 701 verses
//   src/data/quotes.json         Krishna quotes per language
//   assets/gita/<lang>.gita      per-language translations, loaded on demand at runtime
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { fixChapter, fixVerseText } from "./content-fixes.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const legacy = join(root, "capacitor-app");

// Translations added for content the source lacked (made with scripts/translate.mjs).
const verseFills = JSON.parse(readFileSync(join(root, "scripts/content/verse-fills.json"), "utf8"));
const extraQuotes = JSON.parse(readFileSync(join(root, "scripts/content/quotes-hi-sa.json"), "utf8"));

const processed = JSON.parse(readFileSync(join(legacy, "src/app/gita-processed.json"), "utf8"));
const rawVerses = JSON.parse(readFileSync(join(legacy, "src/app/verses.json"), "utf8"));

// CHAPTER_TRANSLATIONS lives inside a TS hook; lift the object literal out and evaluate it.
const hookSource = readFileSync(join(legacy, "src/hooks/useGitaData.tsx"), "utf8");
const start = hookSource.indexOf("const CHAPTER_TRANSLATIONS");
const objStart = hookSource.indexOf("= {", start) + 2;
const objEnd = hookSource.indexOf("\n};\n", objStart) + 2;
const chapterTranslations = new Function(`return (${hookSource.slice(objStart, objEnd)});`)();

const chapters = processed.chapters.map((c) => {
  const t = chapterTranslations[c.chapter_number] ?? {};
  return fixChapter({
    number: c.chapter_number,
    verseCount: c.verseCount,
    title: { ...c.title, ...t.title },
    summary: { ...c.summary, ...t.summary },
    fullSummary: { ...c.fullSummary, ...t.fullSummary },
  });
});

const wordMeanings = new Map(
  rawVerses.map((rv) => [`${rv.chapter_number}.${rv.verse_number}`, (rv.word_meanings || "").trim()]),
);

const clean = (s) => (s || "").replace(/\n\s*\n/g, "\n").trim();
const verses = Object.values(processed.verses)
  .sort((a, b) => a.chapter - b.chapter || a.verse - b.verse);

const core = verses.map((v) => ({
  c: v.chapter,
  v: v.verse,
  sa: clean(v.sanskrit),
  tr: clean(v.transliteration),
  wm: wordMeanings.get(`${v.chapter}.${v.verse}`) || "",
}));

const languages = new Set();
for (const v of verses) Object.keys(v.translation || {}).forEach((l) => languages.add(l));

mkdirSync(join(root, "src/data"), { recursive: true });
mkdirSync(join(root, "assets/gita"), { recursive: true });

for (const lang of languages) {
  const out = {};
  for (const v of verses) {
    const id = `${v.chapter}.${v.verse}`;
    const t = { ...v.translation?.[lang] };
    const fill = verseFills[lang]?.[id];
    if (fill) for (const f of ["simple", "deep", "essence"]) if (!t[f]) t[f] = fill[f];
    if (!t.simple && !t.deep && !t.essence) continue;
    out[id] = [t.simple, t.deep, t.essence].map((x) => fixVerseText(x || "", lang, id));
  }
  writeFileSync(join(root, `assets/gita/${lang}.gita`), JSON.stringify(out));
}

const quotes = {};
for (const [lang, list] of Object.entries(processed.quotes)) {
  quotes[lang] = list
    .map((q) => ({
      id: q.id,
      text: typeof q.text === "string" ? q.text : q.text?.quote || q.text?.text || "",
    }))
    .filter((q) => q.text);
}

// The source has no Hindi or Sanskrit quotes.
for (const [lang, list] of Object.entries(extraQuotes)) if (!quotes[lang]) quotes[lang] = list;

writeFileSync(join(root, "src/data/chapters.json"), JSON.stringify(chapters));
writeFileSync(join(root, "src/data/verses-core.json"), JSON.stringify(core));
writeFileSync(join(root, "src/data/quotes.json"), JSON.stringify(quotes));

console.log(`chapters: ${chapters.length}, verses: ${core.length}, languages: ${[...languages].sort().join(",")}`);
