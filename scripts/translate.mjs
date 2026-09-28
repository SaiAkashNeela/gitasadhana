#!/usr/bin/env node
// Translates app strings / quotes with Gemini through Cloudflare AI Gateway.
// Needs a relay that forwards {system, prompt} to the model (see README "Translating").
//
//   node scripts/translate.mjs strings <en.json> <out.json>     # UI strings -> 11 languages
//   node scripts/translate.mjs quotes <out.json>                # Hindi + Sanskrit quotes
//
// Every result is checked: same keys, same {placeholders}, same line breaks, and no letters
// from another Indic script (scripts/audit-scripts.mjs). Failures are retried.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

import { foreignChars } from "./audit-scripts.mjs";

const RELAY = process.env.TRANSLATE_RELAY ?? "http://localhost:8799";
const NAMES = {
  hi: "Hindi", sa: "Sanskrit", te: "Telugu", ta: "Tamil", kn: "Kannada", ml: "Malayalam",
  bn: "Bengali", gu: "Gujarati", mr: "Marathi", pa: "Punjabi (Gurmukhi script)", ne: "Nepali",
};

const SYSTEM = `You are an expert translator for "Gita Sadhana", a calm, devotional Bhagavad Gita study app used by families — from children to elderly grandparents.
Rules:
- Translate faithfully and naturally, in simple, warm, respectful everyday words (not stiff or overly Sanskritised, except when the target is Sanskrit).
- Use the language's own native script only. Never mix in letters from another script.
- Keep every placeholder like {n}, {time}, {id}, {text}, {rate}, {title}, {summary} exactly as is.
- Keep line breaks (\\n) and quotation marks where the source has them.
- Keep the names "Gita Sadhana", "Gita AI", "iOS", "Android", "Chrome", "Edge", "Firefox", "Safari" in Latin letters. Write "Bhagavad Gita" the way that language normally writes it.
- Devotional terms (dharma, karma, Krishna, Arjuna, Om) use the language's customary spelling.
- For UI labels keep them short, like a button or a heading.
- Respond with JSON only: an object with exactly the same keys as the input.`;

const placeholders = (s) => (s.match(/\{[a-z]+\}/gi) ?? []).sort().join(",");
const newlines = (s) => (s.match(/\n/g) ?? []).length;

async function ask(prompt) {
  const res = await fetch(RELAY, { method: "POST", body: JSON.stringify({ system: SYSTEM, prompt }) });
  const body = await res.json();
  if (body.status !== 200) throw new Error(`model error ${body.status}: ${JSON.stringify(body.error)}`);
  return JSON.parse(body.text);
}

function validate(src, out, lang) {
  const problems = [];
  for (const [k, v] of Object.entries(src)) {
    const t = out[k];
    if (typeof t !== "string" || !t.trim()) problems.push(`${k}: missing`);
    else {
      if (placeholders(t) !== placeholders(v)) problems.push(`${k}: placeholders ${placeholders(t)} vs ${placeholders(v)}`);
      if (newlines(t) !== newlines(v)) problems.push(`${k}: line breaks`);
      if (foreignChars(t, lang).length) problems.push(`${k}: mixed script`);
      if (!/[ऀ-෿]/.test(t)) problems.push(`${k}: not in ${lang} script`);
    }
  }
  return problems;
}

async function translate(src, lang, label) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const out = await ask(`Translate the values of this JSON from English into ${NAMES[lang]}.\n\n${JSON.stringify(src, null, 1)}`);
      const problems = validate(src, out, lang);
      if (problems.length === 0) return out;
      console.warn(`  ${label} ${lang} attempt ${attempt}: ${problems.slice(0, 4).join("; ")}`);
      // Keep what passed; retry only the failing keys.
      const bad = new Set(problems.map((p) => p.split(":")[0]));
      const good = Object.fromEntries(Object.entries(out).filter(([k]) => k in src && !bad.has(k)));
      if (Object.keys(good).length) {
        const rest = Object.fromEntries(Object.entries(src).filter(([k]) => bad.has(k)));
        const retry = await translate(rest, lang, `${label}(retry)`);
        return { ...good, ...retry };
      }
    } catch (e) {
      console.warn(`  ${label} ${lang} attempt ${attempt}: ${e.message}`);
    }
  }
  throw new Error(`could not translate ${label} into ${lang}`);
}

const chunk = (obj, size) => {
  const entries = Object.entries(obj);
  const out = [];
  for (let i = 0; i < entries.length; i += size) out.push(Object.fromEntries(entries.slice(i, i + size)));
  return out;
};

const [mode, a, b] = process.argv.slice(2);

if (mode === "strings") {
  const en = JSON.parse(readFileSync(a, "utf8"));
  const result = existsSync(b) ? JSON.parse(readFileSync(b, "utf8")) : {};
  for (const lang of Object.keys(NAMES)) {
    if (result[lang] && Object.keys(en).every((k) => result[lang][k])) continue;
    console.log(`strings -> ${lang}`);
    const parts = await Promise.all(chunk(en, 30).map((c, i) => translate(c, lang, `part${i}`)));
    result[lang] = Object.assign({}, ...parts);
    writeFileSync(b, JSON.stringify(result, null, 1));
  }
} else if (mode === "quotes") {
  const quotes = JSON.parse(readFileSync("src/data/quotes.json", "utf8")).en;
  const result = existsSync(a) ? JSON.parse(readFileSync(a, "utf8")) : {};
  for (const lang of ["hi", "sa"]) {
    if (result[lang]?.length === quotes.length) continue;
    console.log(`quotes -> ${lang}`);
    const src = Object.fromEntries(quotes.map((q, i) => [`q${i}`, q.text]));
    const parts = await Promise.all(chunk(src, 20).map((c, i) => translate(c, lang, `quotes${i}`)));
    const merged = Object.assign({}, ...parts);
    result[lang] = quotes.map((q, i) => ({ id: `${lang}-${i}`, text: merged[`q${i}`] }));
    writeFileSync(a, JSON.stringify(result, null, 1));
  }
} else {
  console.error("usage: translate.mjs strings <en.json> <out.json> | quotes <out.json>");
  process.exit(1);
}
console.log("done");
