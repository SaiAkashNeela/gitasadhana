#!/usr/bin/env bun
// Turns the raw simulator captures in store/raw/ into store-ready screenshots:
//   store/screenshots/ios-iphone-6.9/   1320×2868  (App Store, iPhone 6.9")
//   store/screenshots/ios-ipad-13/      2064×2752  (App Store, iPad 13")
//   store/screenshots/play-phone/       1080×1920  (Google Play, phone)
//   store/screenshots/play-tablet/      1600×2560  (Google Play, 7" and 10" tablets)
//   store/screenshots/play-feature-graphic.jpg 1024×500 and play-icon.png 512×512
// Cards are JPEG (no alpha channel, as Google Play requires).
// Each card is HTML rendered in Chrome so the Marcellus caption matches the app.
// Run from app/: `bun --install=force store/compose.mjs` (Bun fetches playwright-core).
import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const STORE = dirname(fileURLToPath(import.meta.url));
const APP = join(STORE, "..");
const FONTS = join(APP, "..", "website/assets/fonts");
const OUT = join(STORE, "screenshots");

// Caption per raw capture, matched by file name (store/raw/<device>/<name>.png).
const CAPTIONS = {
  "01-home": ["The Bhagavad Gita,", "every day"],
  "02-verse": ["701 verses in Sanskrit", "and 12 languages"],
  "03-chapters": ["All 18 chapters,", "beautifully set"],
  "04-player": ["Listen verse by verse,", "even offline"],
  "05-ai": ["Ask Gita AI about", "life and duty"],
  "06-wisdom": ["Wisdom for devotion,", "duty and peace"],
};

const TARGETS = [
  { dir: "ios-iphone-6.9", raw: "iphone", w: 1320, h: 2868, statusBar: true },
  { dir: "ios-ipad-13", raw: "ipad", w: 2064, h: 2752, statusBar: true },
  // Play shows no iOS status bar, and caps the aspect ratio at 2:1.
  { dir: "play-phone", raw: "iphone", w: 1080, h: 1920, statusBar: false },
  { dir: "play-tablet", raw: "ipad", w: 1600, h: 2560, statusBar: false },
];

const font = (file) => `data:font/woff2;base64,${readFileSync(join(FONTS, file)).toString("base64")}`;
const png = (path) => `data:image/png;base64,${readFileSync(path).toString("base64")}`;
const css = `
  @font-face { font-family: Marcellus; src: url(${font("Marcellus_400Regular.woff2")}); }
  @font-face { font-family: Garamond; src: url(${font("EBGaramond_400Regular_Italic.woff2")}); font-style: italic; }
  * { margin: 0; box-sizing: border-box; }
  body { background: #F4F1EA; overflow: hidden; }`;

function card({ w, h, shot, caption, statusBar, rawW, rawH }) {
  const pad = Math.round(w * 0.07);
  const captionSize = Math.round(w * 0.068);
  const top = Math.round(h * 0.06);
  // The capture sits in a rounded frame under the caption and runs off the bottom edge.
  const frameW = w - pad * 2;
  const crop = statusBar ? 0 : Math.round(rawH * (rawW > 1500 ? 0.03 : 0.055));
  return `<!doctype html><html><head><style>${css}
    .bg { position: absolute; inset: 0; background: radial-gradient(120% 70% at 50% 0%, #FBF9F4 0%, #F4F1EA 55%, #EAE6DC 100%); }
    h1 { position: absolute; left: ${pad}px; right: ${pad}px; top: ${top}px; text-align: center; font: ${captionSize}px/1.18 Marcellus, serif; color: #1B1F2E; letter-spacing: 0.005em; }
    h1 span { color: #2F4A8A; }
    .om { position: absolute; left: 0; right: 0; top: ${top - Math.round(captionSize * 0.95)}px; text-align: center; font: ${Math.round(captionSize * 0.6)}px Garamond, serif; color: #A96A1F; }
    .frame { position: absolute; left: ${pad}px; width: ${frameW}px; top: ${top + captionSize * 2.75}px; bottom: -${Math.round(h * 0.04)}px; border-radius: ${Math.round(w * 0.05)}px; overflow: hidden; background: #fff; box-shadow: 0 ${Math.round(w * 0.02)}px ${Math.round(w * 0.06)}px rgba(27,31,46,0.18), 0 0 0 ${Math.max(2, Math.round(w * 0.004))}px rgba(27,31,46,0.08); }
    /* Fills the frame; a capture with a different shape loses only its (empty) side margins. */
    .frame img { position: absolute; left: 0; top: -${Math.round((crop / rawW) * frameW)}px; width: 100%; height: calc(100% + ${Math.round((crop / rawW) * frameW)}px); object-fit: cover; object-position: top center; }
  </style></head><body style="width:${w}px;height:${h}px">
    <div class="bg"></div><div class="om">ॐ</div>
    <h1>${caption[0]}<br><span>${caption[1]}</span></h1>
    <div class="frame"><img src="${shot}"></div>
  </body></html>`;
}

function featureGraphic() {
  const art = png(join(APP, "assets/art/welcome-journey.jpg")).replace("image/png", "image/jpeg");
  const emblem = png(join(APP, "assets/art/brand/emblem.png"));
  return `<!doctype html><html><head><style>${css}
    body { width: 1024px; height: 500px; position: relative; background: #12151F; }
    .art { position: absolute; inset: 0 0 0 30%; background: url(${art}) center 35%/cover; }
    .shade { position: absolute; inset: 0; background: linear-gradient(90deg, #12151F 30%, rgba(18,21,31,0.55) 52%, rgba(18,21,31,0) 75%); }
    .text { position: absolute; left: 72px; top: 50%; transform: translateY(-50%); color: #EDE8DE; }
    img { width: 84px; height: 84px; border-radius: 42px; margin-bottom: 22px; }
    h1 { font: 64px/1.05 Marcellus, serif; }
    p { font: italic 30px/1.3 Garamond, serif; color: #E3AA58; margin-top: 14px; }
  </style></head><body><div class="art"></div><div class="shade"></div>
    <div class="text"><img src="${emblem}"><h1>Gita Sadhana</h1><p>The Bhagavad Gita in 12 languages</p></div></body></html>`;
}

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage();
let count = 0;
for (const t of TARGETS) {
  const rawDir = join(STORE, "raw", t.raw);
  if (!existsSync(rawDir)) continue;
  mkdirSync(join(OUT, t.dir), { recursive: true });
  for (const file of readdirSync(rawDir).filter((f) => f.endsWith(".png")).sort()) {
    const name = file.replace(".png", "");
    const caption = CAPTIONS[name];
    if (!caption) continue;
    const buf = readFileSync(join(rawDir, file));
    const rawW = buf.readUInt32BE(16);
    const rawH = buf.readUInt32BE(20);
    await page.setViewportSize({ width: t.w, height: t.h });
    await page.setContent(card({ ...t, shot: png(join(rawDir, file)), caption, rawW, rawH }), { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(OUT, t.dir, `${name}.jpg`), type: "jpeg", quality: 92 });
    count++;
  }
}
await page.setViewportSize({ width: 1024, height: 500 });
await page.setContent(featureGraphic(), { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: join(OUT, "play-feature-graphic.jpg"), type: "jpeg", quality: 92 });
await page.setViewportSize({ width: 512, height: 512 });
await page.setContent(`<html><body style="margin:0"><img src="${png(join(APP, "assets/images/icon.png"))}" style="width:512px;height:512px;display:block"></body></html>`, { waitUntil: "load" });
await page.screenshot({ path: join(OUT, "play-icon.png") });
await browser.close();
console.log(`store screenshots: ${count} cards, feature graphic, icon`);
