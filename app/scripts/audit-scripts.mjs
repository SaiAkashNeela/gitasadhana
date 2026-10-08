#!/usr/bin/env node
// Finds text whose characters belong to a different Indic script than its language
// (e.g. Bengali text containing Devanagari letters).
import { readFileSync, readdirSync } from "node:fs";

export const BLOCKS = {
  hi: 0x0900, sa: 0x0900, mr: 0x0900, ne: 0x0900,
  bn: 0x0980, pa: 0x0a00, gu: 0x0a80, or: 0x0b00,
  ta: 0x0b80, te: 0x0c00, kn: 0x0c80, ml: 0x0d00,
};
const INDIC_START = 0x0900, INDIC_END = 0x0dff;
// Danda / double danda live in the Devanagari block but are shared by all Indic scripts.
const SHARED = new Set([0x0964, 0x0965]);

export function foreignChars(text, lang) {
  const base = BLOCKS[lang];
  if (base === undefined || !text) return [];
  const bad = [];
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    // Hebrew, Arabic/Persian, Thai letters never belong in these languages.
    if ((cp >= 0x0590 && cp <= 0x06ff) || (cp >= 0x0e00 && cp <= 0x0e7f)) {
      bad.push(ch);
      continue;
    }
    if (cp < INDIC_START || cp > INDIC_END || SHARED.has(cp)) continue;
    if (cp < base || cp >= base + 0x80) bad.push(ch);
  }
  return bad;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const report = [];
  const check = (where, lang, text) => {
    const bad = foreignChars(text, lang);
    if (bad.length) report.push({ where, lang, count: bad.length, sample: text.slice(0, 90) });
  };
  const chapters = JSON.parse(readFileSync("src/data/chapters.json", "utf8"));
  for (const c of chapters)
    for (const f of ["title", "summary", "fullSummary"]) for (const [l, v] of Object.entries(c[f])) check(`chapter ${c.number}.${f}`, l, v);
  const quotes = JSON.parse(readFileSync("src/data/quotes.json", "utf8"));
  for (const [l, list] of Object.entries(quotes)) for (const q of list) check(`quote ${q.id}`, l, q.text);
  for (const file of readdirSync("assets/gita")) {
    const l = file.replace(".gita", "");
    const table = JSON.parse(readFileSync(`assets/gita/${file}`, "utf8"));
    for (const [id, row] of Object.entries(table)) row.forEach((t, i) => check(`verse ${id}[${["simple", "deep", "essence"][i]}]`, l, t));
  }
  const byWhere = {};
  for (const r of report) byWhere[r.where.split(" ")[0] + ":" + r.lang] = (byWhere[r.where.split(" ")[0] + ":" + r.lang] || 0) + 1;
  console.log(JSON.stringify(byWhere, null, 1));
  console.log(report.length, "fields with foreign-script characters");
  for (const r of report.slice(0, 40)) console.log(r.where, r.lang, r.count, "|", r.sample);
}
