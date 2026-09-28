// Clean, crawlable URLs. English has no prefix; other languages add theirs:
//   /chapters/            /hi/chapters/
//   /chapter/2/           /hi/chapter/2/
//   /chapter/2/verse/47/  /hi/chapter/2/verse/47/
//   /theme/devotion/      /wisdom/
// Pages also accept the older query forms (verse.html?v=2.47) and read the path first.
import { CODES, lang } from "./i18n.js";

const prefix = (code) => (code === "en" ? "" : `${code}/`);

export const homeHref = (code = lang) => prefix(code) || "./";
export const chaptersHref = (code = lang) => `${prefix(code)}chapters/`;
export const wisdomHref = (code = lang) => `${prefix(code)}wisdom/`;
export const chapterHref = (n, code = lang) => `${prefix(code)}chapter/${n}/`;
export const themeHref = (slug, code = lang) => `${prefix(code)}theme/${slug}/`;
export function verseHref(id, code = lang) {
  const [c, v] = String(id).split(".");
  return `${prefix(code)}chapter/${c}/verse/${v}/`;
}

/** What the current URL points at: { chapter, verse, theme } (each may be undefined). */
export function route() {
  const seg = location.pathname.split("/").filter(Boolean);
  if (CODES.includes(seg[0])) seg.shift();
  const q = new URLSearchParams(location.search);
  const out = {};
  if (seg[0] === "chapter" && /^\d+$/.test(seg[1])) {
    out.chapter = Number(seg[1]);
    if (seg[2] === "verse" && /^\d+$/.test(seg[3])) out.verse = Number(seg[3]);
  } else if (seg[0] === "theme" && seg[1]) {
    out.theme = seg[1];
  }
  if (out.chapter === undefined && q.get("c")) out.chapter = Number(q.get("c"));
  if (out.verse === undefined && q.get("v")) {
    const [c, v] = q.get("v").split(/[.\-_]/).map(Number);
    out.chapter = c;
    out.verse = v;
  }
  if (out.theme === undefined && q.get("t")) out.theme = q.get("t");
  return out;
}
