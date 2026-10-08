#!/usr/bin/env node
// Draws the 1200×630 link-preview cards the website's Open Graph and Twitter tags point at:
// website/assets/og/<language>/home.jpg and chapter-<n>.jpg for all 12 languages.
// It renders each card as HTML in Chrome (so every Indian script is shaped properly) and
// saves a screenshot. Needs Google Chrome installed; run `bun website/scripts/build-website-og.mjs`
// (Bun installs playwright-core on the fly), then `bash website/scripts/build.sh` so the pages
// pick the cards up. The cards are committed, so this only needs running again when chapter
// names or the art change.
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const WEB = join(ROOT, "website");
const readJson = (p) => JSON.parse(readFileSync(join(WEB, p), "utf8"));
const dataUri = (p, type) => `data:${type};base64,${readFileSync(join(WEB, p)).toString("base64")}`;
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const LANGUAGES = Function(`return ${readFileSync(join(WEB, "js/i18n.js"), "utf8").match(/export const LANGUAGES = (\[[\s\S]*?\]);/)[1]}`)();
const chapters = readJson("data/chapters.json");
const strings = Object.fromEntries(LANGUAGES.map((l) => [l.code, readJson(`data/i18n/${l.code}.json`)]));

const fonts = `
  @font-face { font-family: Marcellus; src: url(${dataUri("assets/fonts/Marcellus_400Regular.woff2", "font/woff2")}); }
  @font-face { font-family: Garamond; src: url(${dataUri("assets/fonts/EBGaramond_400Regular_Italic.woff2", "font/woff2")}); font-style: italic; }
  @font-face { font-family: Deva; src: url(${dataUri("assets/fonts/NotoSerifDevanagari_500Medium.woff2", "font/woff2")}); }`;
const emblem = dataUri("assets/icons/emblem.png", "image/png");

function card({ art, overline, title, subtitle, code }) {
  // Latin text uses the site's fonts; Devanagari uses Noto Serif Devanagari; other scripts fall
  // back to the system's serif for that script.
  const display = code === "en" ? "Marcellus, serif" : "Marcellus, Deva, serif";
  const sub = code === "en" ? "Garamond, serif" : "Deva, serif";
  return `<!doctype html><html lang="${code}"><head><meta charset="utf-8"><style>${fonts}
    * { margin: 0; box-sizing: border-box; }
    body { width: 1200px; height: 630px; background: #0f121b; color: #f4f1ea; overflow: hidden; position: relative; }
    .art { position: absolute; inset: 0 0 0 auto; width: 720px; height: 630px; object-fit: cover; }
    .fade { position: absolute; inset: 0; background: linear-gradient(90deg, #0f121b 0%, #0f121b 38%, rgba(15,18,27,.82) 55%, rgba(15,18,27,.15) 100%); }
    .text { position: absolute; left: 72px; top: 0; bottom: 0; width: 640px; display: flex; flex-direction: column; justify-content: center; gap: 22px; }
    .over { font: 600 20px/1.3 -apple-system, "Segoe UI", sans-serif; color: #e0a458; }
    html[lang="en"] .over { letter-spacing: .16em; text-transform: uppercase; }
    h1 { font: 400 68px/1.12 ${display}; letter-spacing: -0.01em; }
    p { font: italic 34px/1.3 ${sub}; color: rgba(244,241,234,.78); }
    .brand { position: absolute; left: 72px; bottom: 52px; display: flex; align-items: center; gap: 14px; font: 400 26px/1 Marcellus, serif; }
    .brand img { width: 44px; height: 44px; border-radius: 50%; }
    .brand span { color: rgba(244,241,234,.6); font: 400 20px/1 -apple-system, sans-serif; margin-left: 6px; }
  </style></head><body>
    <img class="art" src="${art}">
    <div class="fade"></div>
    <div class="text"><div class="over">${esc(overline)}</div><h1>${esc(title)}</h1>${subtitle ? `<p>${esc(subtitle)}</p>` : ""}</div>
    <div class="brand"><img src="${emblem}">Gita Sadhana<span>gitasadhana.com</span></div>
  </body></html>`;
}

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
let count = 0;
async function shoot(html, file) {
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  mkdirSync(dirname(file), { recursive: true });
  await page.screenshot({ path: file, type: "jpeg", quality: 82 });
  count++;
}

for (const { code } of LANGUAGES) {
  const t = (k) => strings[code][k] ?? strings.en[k] ?? k;
  const dir = join(WEB, "assets/og", code);
  await shoot(card({
    code,
    art: dataUri("assets/art/scenes/scene-1.jpg", "image/jpeg"),
    overline: `18 ${t("chapters")} · 701 ${t("verses")}`,
    title: t("bhagavadGita"),
    subtitle: t("welcomeHeroText"),
  }), join(dir, "home.jpg"));
  for (const c of chapters) {
    await shoot(card({
      code,
      art: dataUri(`assets/art/chapters/chapter-${c.number}.jpg`, "image/jpeg"),
      overline: `${t("bhagavadGita")} · ${t("chapterLabel")} ${c.number}`,
      title: c.title[code] || c.title.en,
      subtitle: c.summary[code] || c.summary.en,
    }), join(dir, `chapter-${c.number}.jpg`));
  }
}
await browser.close();
console.log(`website OG cards: ${count} images`);
