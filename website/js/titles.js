// Page titles and descriptions. Shared by the pages (document.title after they render) and by
// scripts/build-website-seo.mjs (the pre-rendered <title> and meta tags), so both always agree.
// t is the i18n lookup for the page's language.

export const SITE_NAME = "Gita Sadhana";

/**
 * Full <title>. Pages in another language name it (" · मराठी"), since Hindi, Marathi and Nepali
 * share most words and would otherwise get identical titles.
 */
export const fullTitle = (title, native) => `${title}${native ? ` · ${native}` : ""} | ${SITE_NAME}`;

export const homeTitle = (t, native) => `${SITE_NAME} | ${t("bhagavadGita")}: 18 ${t("chapters")}, 701 ${t("verses")}${native ? ` · ${native}` : ""}`;
export const chaptersTitle = (t) => `${t("bhagavadGita")}: 18 ${t("chapters")}`;
export const chapterTitle = (t, { n, title, summary }) => `${t("bhagavadGita")} ${t("chapterLabel")} ${n}: ${title} (${summary})`;
export const verseTitle = (t, { chapter, verse, chapterName }) =>
  `${t("bhagavadGita")} ${chapter}.${verse} · ${t("chapterLabel")} ${chapter}, ${t("verseLabel")} ${verse}: ${chapterName}`;
export const wisdomTitle = (t) => `${t("bhagavadGita")}: ${t("wisdom")} · ${t("quotesLabel")}`;
export const themeTitle = (t, { name, count }) => `${name}: ${count} ${t("verses")} · ${t("bhagavadGita")}`;

/** Trims text to a search-snippet length at a word boundary. */
export function snippet(text, max = 158) {
  const clean = String(text ?? "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[,;:.\s]+$/, "")}…`;
}
