#!/usr/bin/env node
// Prepares website/ from the same sources as the app:
//   website/data/{chapters,verses-core,quotes,legal}.json
//   website/data/gita/<lang>.json   per-language translations
//   website/data/i18n/<lang>.json   every UI string, resolved for that language
// Run after `bun run build:data`. Images are handled by scripts/build-website-images.sh.
import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "website/data");
mkdirSync(join(out, "gita"), { recursive: true });
mkdirSync(join(out, "i18n"), { recursive: true });

for (const f of ["chapters.json", "verses-core.json", "quotes.json"]) copyFileSync(join(root, "src/data", f), join(out, f));
for (const f of readdirSync(join(root, "assets/gita"))) copyFileSync(join(root, "assets/gita", f), join(out, "gita", f.replace(".gita", ".json")));

// Evaluate the TypeScript dictionaries as plain object literals.
const literal = (file, name) => {
  const src = readFileSync(join(root, file), "utf8");
  const decl = new RegExp(`(?:export )?const ${name}\\b[^=]*=`).exec(src);
  if (!decl) throw new Error(`${name} not found in ${file}`);
  const start = decl.index + decl[0].length;
  let depth = 0;
  let end = start;
  for (let i = start; i < src.length; i++) {
    if (src[i] === "{") depth++;
    if (src[i] === "}" && --depth === 0) {
      end = i + 1;
      break;
    }
  }
  return new Function(`return (${src.slice(start, end)});`)();
};

const strings = literal("src/i18n/strings.ts", "translations");
const additional = literal("src/i18n/strings.ts", "additionalTranslations");
for (const [k, v] of Object.entries(additional)) strings[k] = { ...strings[k], ...v };
const fixes = literal("src/i18n/fixes.ts", "stringFixes");
const appStrings = literal("src/i18n/app-strings.ts", "appStrings");
const webStrings = JSON.parse(readFileSync(join(root, "website/i18n-source/web-strings.json"), "utf8"));
const reminders = literal("src/i18n/reminders.ts", "localizedReminders");
const legal = literal("src/lib/legal.ts", "legal");

const LANGS = ["en", "hi", "sa", "te", "ta", "kn", "ml", "bn", "gu", "mr", "pa", "ne"];
const keys = new Set([...Object.keys(strings), ...Object.keys(appStrings), ...Object.keys(webStrings)]);
for (const lang of LANGS) {
  const dict = {};
  for (const k of keys) {
    const v =
      fixes[k]?.[lang] || strings[k]?.[lang] || appStrings[k]?.[lang] || webStrings[k]?.[lang] ||
      strings[k]?.en || appStrings[k]?.en || webStrings[k]?.en;
    if (v) dict[k] = v;
  }
  dict.__reminders = reminders[lang] ?? reminders.en;
  writeFileSync(join(out, "i18n", `${lang}.json`), JSON.stringify(dict));
}
writeFileSync(join(out, "legal.json"), JSON.stringify(legal));
console.log(`website data: ${LANGS.length} languages, ${keys.size} strings`);
