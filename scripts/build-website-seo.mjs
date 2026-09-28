#!/usr/bin/env node
// Builds the crawlable side of the website. Run it after build-website-data.mjs
// (`bun run build:website` runs both).
//
// Search engines and AI assistants mostly read the HTML a server sends and do not run the
// page's JavaScript. So every content page is written out as real HTML, in every language,
// at a clean URL:
//
//   /                     /hi/                      home
//   /chapters/            /hi/chapters/             the 18 chapters
//   /chapter/2/           /hi/chapter/2/            a chapter and its verse list
//   /chapter/2/verse/47/  /hi/chapter/2/verse/47/   a verse
//   /wisdom/  /theme/devotion/                      quotes and themes
//   /ai/  /contact/  /privacy/  /terms/             English only (they follow the saved language)
//
// Each page gets its title, description, canonical URL, hreflang alternates, Open Graph and
// Twitter cards and JSON-LD. The same page script then runs on top of it, so readers get the
// full app. Also written: sitemap.xml (one sitemap per language, with alternates and images),
// robots.txt, llms.txt, llms-full.txt and a Markdown copy of every chapter (/chapter/2.md).
//
// The root *.html files are the templates. Their <!-- seo -->, <!-- content --> and
// <!-- after --> blocks are filled in place, so running this again is safe.
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEB = join(ROOT, "website");
const read = (p) => readFileSync(join(WEB, p), "utf8");
const readJson = (p) => JSON.parse(read(p));

const { SITE_URL: SITE, CREDIT, AUDIO_HOST, RECITED } = await import(pathToFileURL(join(WEB, "js/config.js")).href);
const titles = await import(pathToFileURL(join(WEB, "js/titles.js")).href);

// The language list lives in js/i18n.js (a browser module); read the array literal from it.
const LANGUAGES = Function(`return ${read("js/i18n.js").match(/export const LANGUAGES = (\[[\s\S]*?\]);/)[1]}`)();
const CODES = LANGUAGES.map((l) => l.code);

const chapters = readJson("data/chapters.json");
const verses = readJson("data/verses-core.json").map((v) => ({ id: `${v.c}.${v.v}`, chapter: v.c, verse: v.v, sanskrit: v.sa, transliteration: v.tr, wordMeanings: v.wm }));
const quotes = readJson("data/quotes.json");
const legal = readJson("data/legal.json");
const tables = Object.fromEntries(CODES.map((c) => [c, readJson(`data/gita/${c}.json`)]));
const strings = Object.fromEntries(CODES.map((c) => [c, readJson(`data/i18n/${c}.json`)]));
const THEMES = Function(`return ${read("js/gita.js").match(/export const THEMES = (\[[\s\S]*?\]);/)[1]}`)();
const TOTAL = verses.length;

const gitDate = (args) => {
  try {
    return execSync(`git log ${args} --format=%cI -- src/data assets/gita`, { cwd: ROOT, encoding: "utf8" }).trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
};
const MODIFIED = gitDate("-1")[0] ?? new Date().toISOString();
const PUBLISHED = gitDate("--reverse").at(0) ?? MODIFIED;
const LASTMOD = MODIFIED.slice(0, 10);

/* ───────── helpers ───────── */

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const xml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);
const icon = (name, weight = "regular") => `<i class="${weight === "regular" ? "ph" : `ph-${weight}`} ph-${name}" aria-hidden="true"></i>`;
const tFor = (code) => (key) => strings[code][key] ?? strings.en[key] ?? key;
const pick = (map, code) => (map ? map[code] || map.en || "" : "");
const abs = (path) => new URL(path, `${SITE}/`).href;

function translation(id, code) {
  const own = tables[code][id];
  const en = tables.en[id];
  if (!own && !en) return null;
  const at = (i) => own?.[i] || en?.[i] || "";
  return { simple: at(0), deep: at(1), essence: at(2) };
}

function parseWordMeanings(raw) {
  if (!raw) return [];
  return raw
    .split(";")
    .map((pair) => {
      const parts = pair.split(/[—–-]/);
      return { word: parts[0]?.trim() ?? "", meaning: parts[1]?.trim() ?? "" };
    })
    .filter((p) => p.word && p.meaning);
}

// Paths without a leading slash, exactly as js/route.js builds them.
const prefix = (code) => (code === "en" ? "" : `${code}/`);
const P = {
  home: (code) => prefix(code),
  chapters: (code) => `${prefix(code)}chapters/`,
  chapter: (n, code) => `${prefix(code)}chapter/${n}/`,
  verse: (c, v, code) => `${prefix(code)}chapter/${c}/verse/${v}/`,
  wisdom: (code) => `${prefix(code)}wisdom/`,
  theme: (slug, code) => `${prefix(code)}theme/${slug}/`,
};

const OG_LOCALE = { en: "en_IN", ne: "ne_NP" };
const ogLocale = (code) => OG_LOCALE[code] ?? `${code}_IN`;
const audioLang = (code) => (RECITED.includes(code) ? code : "en");

function ogImage(code, chapter) {
  const file = chapter ? `assets/og/${code}/chapter-${chapter}.jpg` : `assets/og/${code}/home.jpg`;
  if (existsSync(join(WEB, file))) return { url: abs(file), width: 1200, height: 630 };
  return { url: abs("assets/icons/og-image.jpg"), width: 1200, height: 1200 };
}

const firstLine = (text) => String(text).split("\n")[0].replace(/[।|]+\s*[\d.]*\s*[।|]*\s*$/, "").trim();

/* ───────── structured data ───────── */

const ORG_ID = `${SITE}/#organization`;
const PERSON_ID = `${CREDIT.url}/#person`;
const SITE_ID = `${SITE}/#website`;
const GITA_ID = `${SITE}/#bhagavad-gita`;
const APP_ID = `${SITE}/#app`;

const CORE_GRAPH = [
  {
    "@type": "Organization",
    "@id": ORG_ID,
    name: "Gita Sadhana",
    alternateName: "GitaSadhana",
    url: `${SITE}/`,
    logo: { "@type": "ImageObject", url: abs("assets/icons/icon-512.png"), width: 512, height: 512 },
    email: "hello@gitasadhana.com",
    founder: { "@id": PERSON_ID },
  },
  {
    "@type": "Person",
    "@id": PERSON_ID,
    name: CREDIT.name,
    url: CREDIT.url,
    sameAs: [CREDIT.url, CREDIT.github],
  },
  {
    "@type": "WebSite",
    "@id": SITE_ID,
    url: `${SITE}/`,
    name: "Gita Sadhana",
    alternateName: ["GitaSadhana", "gitasadhana.com"],
    inLanguage: CODES,
    publisher: { "@id": ORG_ID },
    creator: { "@id": PERSON_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE}/search.html?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@type": "Book",
    "@id": GITA_ID,
    name: "Bhagavad Gita",
    alternateName: ["Bhagavad Gītā", "Shrimad Bhagavad Gita", "श्रीमद्भगवद्गीता"],
    inLanguage: "sa",
    author: { "@type": "Person", name: "Vyasa" },
    isPartOf: { "@type": "Book", name: "Mahabharata" },
    url: abs(P.chapters("en")),
  },
];

function breadcrumb(url, items) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(path) })),
  };
}

function webPage(type, { url, title, description, code, image, crumbs, extra = {} }) {
  return {
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage: code,
    isPartOf: { "@id": SITE_ID },
    about: { "@id": GITA_ID },
    ...(crumbs ? { breadcrumb: { "@id": `${url}#breadcrumb` } } : {}),
    ...(image ? { primaryImageOfPage: { "@type": "ImageObject", url: image.url, width: image.width, height: image.height } } : {}),
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    ...extra,
  };
}

const jsonLd = (graph) =>
  `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": [...CORE_GRAPH, ...graph] }).replace(/</g, "\\u003c")}</script>`;

/* ───────── <head> ───────── */

function seoHead({ title, description, path, code, alternates, type = "website", image, imageAlt, robots = "index", graph = [], article }) {
  const url = abs(path);
  const lines = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}">`,
    robots === "index"
      ? `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">`
      : `<meta name="robots" content="noindex, follow">`,
    `<meta name="theme-color" content="#f4f1ea" media="(prefers-color-scheme: light)">`,
    `<meta name="theme-color" content="#0f121b" media="(prefers-color-scheme: dark)">`,
    `<meta name="application-name" content="Gita Sadhana">`,
    `<meta name="apple-mobile-web-app-title" content="Gita Sadhana">`,
    `<meta name="author" content="${esc(CREDIT.name)}">`,
    `<meta name="creator" content="${esc(CREDIT.name)}">`,
    `<link rel="author" href="${CREDIT.url}">`,
    `<link rel="me" href="${CREDIT.github}">`,
  ];
  if (robots === "index") {
    lines.push(`<link rel="canonical" href="${url}">`);
    if (alternates) {
      for (const c of CODES) lines.push(`<link rel="alternate" hreflang="${c}" href="${abs(alternates(c))}">`);
      lines.push(`<link rel="alternate" hreflang="x-default" href="${abs(alternates("en"))}">`);
    }
    lines.push(`<link rel="alternate" type="text/plain" title="llms.txt" href="${abs("llms.txt")}">`);
  }
  const img = image ?? ogImage(code);
  lines.push(
    `<meta property="og:type" content="${type}">`,
    `<meta property="og:site_name" content="Gita Sadhana">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${img.url}">`,
    `<meta property="og:image:width" content="${img.width}">`,
    `<meta property="og:image:height" content="${img.height}">`,
    `<meta property="og:image:alt" content="${esc(imageAlt ?? title)}">`,
    `<meta property="og:locale" content="${ogLocale(code)}">`,
  );
  if (alternates) for (const c of CODES) if (c !== code) lines.push(`<meta property="og:locale:alternate" content="${ogLocale(c)}">`);
  if (article) {
    lines.push(
      `<meta property="article:published_time" content="${PUBLISHED}">`,
      `<meta property="article:modified_time" content="${MODIFIED}">`,
      `<meta property="article:author" content="${CREDIT.url}">`,
      `<meta property="article:section" content="${esc(article.section)}">`,
    );
    for (const tag of article.tags ?? []) lines.push(`<meta property="article:tag" content="${esc(tag)}">`);
  }
  lines.push(
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(description)}">`,
    `<meta name="twitter:image" content="${img.url}">`,
    `<meta name="twitter:image:alt" content="${esc(imageAlt ?? title)}">`,
  );
  if (graph.length) lines.push(jsonLd(graph));
  return lines.map((l) => `  ${l}`).join("\n");
}

/* ───────── shared body parts ───────── */

function staticFooter(code, alternates) {
  const t = tFor(code);
  const [before, after = ""] = t("madeBy").split("{name}");
  const langs = alternates
    ? `<nav class="lang-links" aria-label="${esc(t("language"))}">${LANGUAGES.map((l) =>
      `<a href="${alternates(l.code)}" hreflang="${l.code}" lang="${l.code}"${l.code === code ? ' aria-current="page"' : ""}>${esc(l.native)}</a>`).join("")}</nav>`
    : "";
  return `<footer class="site-foot">
      <span>Gita Sadhana</span>
      <a href="${P.chapters(code)}">${esc(t("chapters"))}</a>
      <a href="${P.wisdom(code)}">${esc(t("wisdom"))}</a>
      <a href="ai/">Gita AI</a>
      <a href="contact/">${esc(t("contactUsTitle"))}</a>
      <a href="correction.html">${esc(t("verseLanguageCorrectionTitle"))}</a>
      <a href="privacy/">${esc(t("privacyPolicyTitle"))}</a>
      <a href="terms/">${esc(t("termsTitle"))}</a>
      <span class="credit">${esc(before)}<a href="${CREDIT.url}" rel="author">${esc(CREDIT.name)}</a>${esc(after)} · <a href="${CREDIT.github}" rel="noopener">GitHub</a></span>
      ${langs}
    </footer>`;
}

function verseCard(v, code) {
  const t = tFor(code);
  return `<article class="verse-card">
    <a href="${P.verse(v.chapter, v.verse, code)}" class="stack-sm">
      <span class="overline flame">${esc(t("verseLabel"))} ${v.id}</span>
      <span class="first" lang="sa">${esc(v.sanskrit.split("\n")[0])}</span>
      <span class="tr">${esc(translation(v.id, code)?.simple ?? "")}</span>
    </a>
  </article>`;
}

const themeVerses = (query, code) =>
  verses.filter((v) => `${tables[code][v.id]?.[0] ?? ""} ${tables.en[v.id]?.[0] ?? ""}`.toLowerCase().includes(query));

/* ───────── page bodies (mirror the markup js/pages/* renders) ───────── */

function homeBody(code) {
  const t = tFor(code);
  const tr = translation("2.47", code);
  return `<div class="page-head">
    <div>
      <p class="soft small">${esc(t("hariOm"))}, ${esc(t("seeker"))}</p>
      <h1 class="display">${esc(t("todaysVerse"))}</h1>
    </div>
  </div>
  <div class="home-grid">
    <section class="stack" aria-label="${esc(t("verseOfTheDay"))}">
      <a class="hero-verse" href="${P.verse(2, 47, code)}">
        <img class="scene on" src="assets/art/scenes/scene-1.jpg" alt="" fetchpriority="high">
        <p class="overline">${esc(t("verseOfTheDay"))}</p>
        <blockquote>“${esc(tr.simple)}”</blockquote>
        <p class="ref">${esc(t("bhagavadGita"))} 2.47</p>
        <span class="actions"><span class="btn">${icon("book-open-text")}${esc(t("readVerse"))}</span></span>
      </a>
    </section>
  </div>
  <section class="section">
    <div class="section-head">
      <h2 class="title">${esc(t("chapters"))}</h2>
      <a class="link" href="${P.chapters(code)}">${esc(t("allBtn"))}</a>
    </div>
    <div class="chapter-strip">
      ${chapters.map((c) => `<a href="${P.chapter(c.number, code)}">
        <span class="ring"><img src="assets/art/thumbs/chapter-${c.number}.jpg" alt="" width="84" height="84" loading="lazy"></span>
        <span>${esc(pick(c.title, code))}</span>
      </a>`).join("\n      ")}
    </div>
  </section>`;
}

function chaptersBody(code) {
  const t = tFor(code);
  return `<div class="page-head">
    <div>
      <h1 class="display">${esc(t("chapters"))}</h1>
      <p class="soft">${esc(t("exploreChaptersDesc"))}</p>
    </div>
  </div>
  <div id="list"><div class="chapter-grid">${chapters.map((c) => `<a class="chapter-card" href="${P.chapter(c.number, code)}">
      <img src="assets/art/chapters/chapter-${c.number}.jpg" alt="${esc(pick(c.title, code))}" loading="lazy" width="720" height="450">
      <span class="body">
        <span class="overline flame">${esc(t("chapterLabel"))} ${c.number}</span>
        <span class="heading">${esc(pick(c.title, code))}</span>
        <span class="caption">${esc(pick(c.summary, code))}</span>
        <span class="meta"><span class="caption num">${c.verseCount} ${esc(t("verses").toLowerCase())}</span></span>
      </span>
    </a>`).join("")}</div></div>`;
}

function chapterBody(c, code) {
  const t = tFor(code);
  const title = pick(c.title, code);
  const list = verses.filter((v) => v.chapter === c.number);
  return `<div class="chapter-layout">
      <aside class="chapter-aside">
        <img src="assets/art/chapters/chapter-${c.number}.jpg" alt="${esc(title)}" width="720" height="720">
        <div class="stack-sm">
          <p class="overline flame">${esc(t("chapterLabel"))} ${c.number}</p>
          <h1 class="display">${esc(title)}</h1>
          <p class="serif soft" style="font-size:1.15rem;font-style:italic">${esc(pick(c.summary, code))}</p>
        </div>
        <p class="soft">${esc(pick(c.fullSummary, code))}</p>
        <div class="stats">
          <div class="stat"><b>${c.verseCount}</b><span>${esc(t("verses"))}</span></div>
          <div class="stat"><b>0%</b><span>${esc(t("readLabel"))}</span></div>
          <div class="stat"><b>~${Math.round(c.verseCount * 0.6)}m</b><span>${esc(t("lengthLabel"))}</span></div>
        </div>
        <div class="stack-sm">
          <a class="btn block" href="${P.verse(c.number, 1, code)}">${icon("book-open-text")}${esc(t("beginChapterBtn"))}</a>
        </div>
      </aside>
      <section class="stack" aria-label="${esc(t("verses"))}">
        <div class="section-head"><h2 class="title">${esc(t("verses"))}</h2></div>
        <div class="verse-rows">${list.map((v) => `<div class="verse-row">
          <span class="check" aria-hidden="true">${icon("circle")}</span>
          <a href="${P.verse(v.chapter, v.verse, code)}">
            <span class="text"><b>${esc(t("verseLabel"))} ${v.verse}</b><span>${esc(translation(v.id, code)?.simple ?? "")}</span></span>
            ${icon("caret-right")}
          </a>
        </div>`).join("")}</div>
      </section>
      ${chapterNav(c, code)}
    </div>`;
}

function chapterNav(c, code) {
  const t = tFor(code);
  const prev = chapters.find((x) => x.number === c.number - 1);
  const next = chapters.find((x) => x.number === c.number + 1);
  return `<nav class="verse-nav" aria-label="${esc(t("chapters"))}">
        ${prev ? `<a href="${P.chapter(prev.number, code)}">${icon("caret-left")}${esc(t("chapterLabel"))} ${prev.number}: ${esc(pick(prev.title, code))}</a>` : "<span></span>"}
        ${next ? `<a href="${P.chapter(next.number, code)}">${esc(t("chapterLabel"))} ${next.number}: ${esc(pick(next.title, code))}${icon("caret-right")}</a>` : "<span></span>"}
      </nav>`;
}

function verseBody(v, c, code) {
  const t = tFor(code);
  const tr = translation(v.id, code);
  const words = code === "en" ? parseWordMeanings(v.wordMeanings) : [];
  const chapterName = pick(c.title, code);
  const prev = v.verse > 1 ? v.verse - 1 : null;
  const next = v.verse < c.verseCount ? v.verse + 1 : null;
  const placeholder = `<span class="icon-btn" aria-hidden="true"></span>`;
  return `<article class="reader">
      <div class="reader-top">
        <a class="icon-btn" href="${P.chapter(v.chapter, code)}" aria-label="${esc(chapterName)}">${icon("arrow-left")}</a>
        <div class="grow">
          <h1 class="title">${esc(t("verseLabel"))} <span class="fig">${v.id}</span></h1>
          <a class="overline flame" href="${P.chapter(v.chapter, code)}">${esc(t("chapterLabel"))} ${v.chapter}: ${esc(chapterName)}</a>
        </div>
        ${placeholder}${placeholder}${placeholder}${placeholder}
      </div>
      <div class="sanskrit-block">
        <p class="sanskrit" lang="sa">${esc(v.sanskrit)}</p>
        ${v.transliteration ? `<p class="translit" lang="sa-Latn">${esc(v.transliteration)}</p>` : ""}
        <div class="om-rule" aria-hidden="true"><span>ॐ</span></div>
      </div>
      <section class="translation">
        <h2 class="overline accent">${esc(t("translation"))}</h2>
        <p class="scripture">${esc(tr?.simple ?? "")}</p>
      </section>
      ${words.length ? `<details class="words">
        <summary>${icon("book", "duotone")}<span>${esc(t("wordMeanings"))}</span>${icon("caret-down")}</summary>
        <dl class="word-list">${words.map((w) => `<div><dt>${esc(w.word)}</dt><dd>${esc(w.meaning)}</dd></div>`).join("")}</dl>
      </details>` : ""}
      ${tr && (tr.deep || tr.essence) ? `<section class="reflection">
        <h2 class="overline flame">${esc(t("reflectionAndEssence"))}</h2>
        ${tr.deep ? `<p class="deep">${esc(tr.deep)}</p>` : ""}
        ${tr.essence ? `<p class="essence">${esc(tr.essence)}</p>` : ""}
      </section>` : ""}
      <nav class="verse-nav" aria-label="${esc(t("verses"))}">
        ${prev ? `<a href="${P.verse(v.chapter, prev, code)}">${icon("caret-left")}${esc(t("verseLabel"))} ${v.chapter}.${prev}</a>` : "<span></span>"}
        ${next ? `<a href="${P.verse(v.chapter, next, code)}">${esc(t("verseLabel"))} ${v.chapter}.${next}${icon("caret-right")}</a>` : "<span></span>"}
      </nav>
    </article>`;
}

function wisdomBody(code) {
  const t = tFor(code);
  const list = quotes[code] ?? quotes.en;
  return `<div class="page-head"><div><h1 class="display">${esc(t("wisdom"))}</h1></div></div>
  <section class="section">
    <div class="section-head"><h2 class="title">${esc(t("wisdomThemesTitle"))}</h2></div>
    <div class="theme-grid">${THEMES.map((th) => `<a class="theme-tile" href="${P.theme(th.slug, code)}">
      <img src="assets/art/scenes/scene-${th.scene}.jpg" alt="" loading="lazy"><span class="om">ॐ</span><b>${esc(t(th.id))}</b></a>`).join("")}</div>
  </section>
  <section class="section" id="quotes">
    <h2 class="title">${esc(t("gitaQuote"))}</h2>
    <div class="quote-list">${list.map((q) => `<figure class="quote"><p>“${esc(q.text)}”</p><footer><span>${esc(t("bhagavadGita"))}</span></footer></figure>`).join("")}</div>
  </section>`;
}

function themeBody(th, code) {
  const t = tFor(code);
  const list = themeVerses(th.query, code);
  return `<div class="hero-verse" style="min-height:240px">
    <img class="scene on" src="assets/art/scenes/scene-${th.scene}.jpg" alt="">
    <h1 class="display">${esc(t(th.id))}</h1>
    <p class="ref">${list.length} ${esc(t("verses").toLowerCase())}</p>
  </div>
  <section class="section">
    <div class="card-grid">${list.map((v) => verseCard(v, code)).join("")}</div>
  </section>`;
}

/* ───────── English home: about + questions (shown to English readers only) ───────── */

const longest = [...chapters].sort((a, b) => b.verseCount - a.verseCount)[0];
const shortest = [...chapters].sort((a, b) => a.verseCount - b.verseCount)[0];
const languageList = LANGUAGES.map((l) => l.name);
const listText = (items) => `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;

const FAQ = [
  [
    "What is Gita Sadhana?",
    `Gita Sadhana is a free Bhagavad Gita study companion made by ${CREDIT.name}. You can read all 18 chapters and ${TOTAL} verses in Sanskrit with transliteration, a translation, a reflection and the essence of each verse, listen to a recitation of every verse, save verses and your own reflections, keep a daily reading streak and ask Gita AI about the teachings.`,
  ],
  [
    "How many chapters and verses does the Bhagavad Gita have?",
    `The Bhagavad Gita has 18 chapters. This edition has ${TOTAL} verses. The longest chapter is Chapter ${longest.number}, ${longest.title.en}, with ${longest.verseCount} verses; the shortest is Chapter ${shortest.number}, ${shortest.title.en}, with ${shortest.verseCount}.`,
  ],
  [
    "Which languages can I read the Gita in?",
    `Every verse is available in ${LANGUAGES.length} languages: ${listText(languageList)}. The Sanskrit verse and its transliteration are always shown alongside.`,
  ],
  [
    "What does Bhagavad Gita 2.47 say?",
    `${translation("2.47", "en").simple} This verse, from Chapter 2 (Sankhya Yoga), is one of the most quoted verses of the Gita.`,
  ],
  [
    "Can I listen to the Bhagavad Gita?",
    "Yes. Each verse has a recitation you can play, pause, repeat and slow down or speed up, and the reader moves on to the next verse by itself. You can also save the recitations of a verse, a chapter or the whole Gita to listen without internet.",
  ],
  [
    "What is Gita AI?",
    "Gita AI is a calm, devotional guide to the wisdom of the Bhagavad Gita. Ask it a question about life, duty, peace or any teaching of the Gita and it answers in the language you choose, drawing on the verses.",
  ],
  [
    "Do I need an account?",
    "No. Reading, listening, bookmarks, notes and your streak all work without an account and are kept in your browser. Sign in with Google if you want to back them up and use them on another device.",
  ],
  [
    "Who made Gita Sadhana?",
    `Gita Sadhana is made by ${CREDIT.name} (${CREDIT.url.replace("https://", "")}). The source is on GitHub at ${CREDIT.github.replace("https://", "")}.`,
  ],
];

function aboutSection() {
  return `<section class="about" id="about" aria-labelledby="about-title">
      <div class="about-intro stack-sm">
        <p class="overline flame">Gita Sadhana</p>
        <h2 class="title" id="about-title">The Bhagavad Gita, verse by verse</h2>
        <p class="soft">The Bhagavad Gita is the dialogue between Krishna and Arjuna on the battlefield of Kurukshetra, part of the Mahabharata. Gita Sadhana gives you all 18 chapters and ${TOTAL} verses in the original Sanskrit with transliteration, a clear translation, a reflection and the essence of every verse, in ${LANGUAGES.length} languages, with a recitation of each verse.</p>
        <p><a class="link" href="${P.chapters("en")}">Start with the 18 chapters</a> · <a class="link" href="${P.verse(2, 47, "en")}">Read Bhagavad Gita 2.47</a> · <a class="link" href="${P.wisdom("en")}">Quotes and themes</a></p>
      </div>
      <div class="faq">
        <h2 class="title">Questions</h2>
        ${FAQ.map(([q, a]) => `<details>
          <summary><span>${esc(q)}</span>${icon("caret-down")}</summary>
          <p>${esc(a)}</p>
        </details>`).join("\n        ")}
      </div>
    </section>`;
}

/* ───────── templates ───────── */

const templates = new Map();
function template(name) {
  if (!templates.has(name)) templates.set(name, read(name));
  return templates.get(name);
}

function fill(html, { head, content, after, code, forceLang }) {
  let out = html
    .replace(/<html[^>]*>/, `<html lang="${code}"${forceLang ? ` data-lang="${code}"` : ""}>`)
    .replace(/  <!-- seo -->[\s\S]*?<!-- \/seo -->/, `  <!-- seo -->\n${head}\n  <!-- /seo -->`);
  if (content !== undefined) out = out.replace(/<!-- content -->[\s\S]*?<!-- \/content -->/, `<!-- content -->\n      ${content}\n      <!-- /content -->`);
  out = out.replace(/<!-- after -->[\s\S]*?<!-- \/after -->/, `<!-- after -->${after ? `\n    ${after}\n    ` : ""}<!-- /after -->`);
  return out;
}

const written = [];
function write(path, html) {
  const file = join(WEB, path.endsWith("/") || path === "" ? `${path}index.html` : path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  written.push(path);
}

// Start clean: everything below is generated.
const GENERATED_DIRS = ["chapter", "chapters", "theme", "wisdom", "ai", "contact", "privacy", "terms", ...CODES.filter((c) => c !== "en")];
for (const d of GENERATED_DIRS) rmSync(join(WEB, d), { recursive: true, force: true });

const sitemap = Object.fromEntries(CODES.map((c) => [c, []]));
const addUrl = (code, path, alternates, images = []) => sitemap[code].push({ path, alternates, images });

/* ───────── content pages, every language ───────── */

for (const code of CODES) {
  const t = tFor(code);
  const bg = t("bhagavadGita");
  const native = code === "en" ? undefined : LANGUAGES.find((l) => l.code === code).native;

  // Home
  {
    const alternates = (c) => P.home(c);
    const title = titles.homeTitle(t, native);
    const description =
      code === "en"
        ? `Read the Bhagavad Gita online, free: 18 chapters, ${TOTAL} verses in Sanskrit with meaning and reflections in ${LANGUAGES.length} languages, verse-by-verse audio and Gita AI.`
        : `${t("welcomeHeroText")} ${t("exploreChaptersDesc")}.`;
    const url = abs(P.home(code));
    const graph = [
      webPage("WebPage", { url, title, description, code, image: ogImage(code) }),
      {
        "@type": "WebApplication",
        "@id": APP_ID,
        name: "Gita Sadhana",
        url: `${SITE}/`,
        description: t("gitaAiIntro"),
        applicationCategory: "EducationalApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        inLanguage: CODES,
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        author: { "@id": PERSON_ID },
        publisher: { "@id": ORG_ID },
        image: ogImage(code).url,
      },
    ];
    if (code === "en") {
      graph.push({
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        url,
        inLanguage: "en",
        mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      });
    }
    const head = seoHead({ title, description, path: P.home(code), code, alternates, graph, imageAlt: `${bg} · Gita Sadhana` });
    const html = fill(template("index.html"), {
      head,
      content: homeBody(code),
      after: `${code === "en" ? aboutSection() : ""}\n    ${staticFooter(code, alternates)}`,
      code,
      forceLang: code !== "en",
    });
    write(P.home(code), html);
    addUrl(code, P.home(code), alternates, [ogImage(code).url]);
  }

  // Chapters
  {
    const alternates = (c) => P.chapters(c);
    const title = titles.fullTitle(titles.chaptersTitle(t), native);
    const description = titles.snippet(`${t("exploreChaptersDesc")}: ${chapters.map((c) => pick(c.title, code)).join(", ")}.`);
    const url = abs(P.chapters(code));
    const graph = [
      webPage("CollectionPage", { url, title, description, code, crumbs: true }),
      breadcrumb(url, [[t("home"), P.home(code)], [t("chapters"), P.chapters(code)]]),
      {
        "@type": "ItemList",
        "@id": `${url}#chapters`,
        numberOfItems: chapters.length,
        itemListElement: chapters.map((c) => ({ "@type": "ListItem", position: c.number, url: abs(P.chapter(c.number, code)), name: `${t("chapterLabel")} ${c.number}: ${pick(c.title, code)}` })),
      },
    ];
    write(P.chapters(code), fill(template("chapters.html"), { head: seoHead({ title, description, path: P.chapters(code), code, alternates, graph }), content: chaptersBody(code), after: staticFooter(code, alternates), code, forceLang: true }));
    addUrl(code, P.chapters(code), alternates);
  }

  // Each chapter and its verses
  for (const c of chapters) {
    const name = pick(c.title, code);
    const summary = pick(c.summary, code);
    const alternates = (x) => P.chapter(c.number, x);
    const url = abs(P.chapter(c.number, code));
    const title = titles.fullTitle(titles.chapterTitle(t, { n: c.number, title: name, summary }), native);
    const description = titles.snippet(pick(c.fullSummary, code));
    const image = ogImage(code, c.number);
    const list = verses.filter((v) => v.chapter === c.number);
    const chapterNode = {
      "@type": "Chapter",
      "@id": `${url}#chapter`,
      name: `${t("chapterLabel")} ${c.number}: ${name}`,
      alternativeHeadline: summary,
      position: c.number,
      description: pick(c.fullSummary, code),
      inLanguage: code,
      url,
      image: image.url,
      isPartOf: { "@id": GITA_ID },
    };
    const graph = [
      webPage("CollectionPage", { url, title, description, code, image, crumbs: true, extra: { mainEntity: { "@id": `${url}#chapter` } } }),
      breadcrumb(url, [[t("home"), P.home(code)], [t("chapters"), P.chapters(code)], [`${t("chapterLabel")} ${c.number}`, P.chapter(c.number, code)]]),
      chapterNode,
      {
        "@type": "ItemList",
        "@id": `${url}#verses`,
        numberOfItems: list.length,
        itemListElement: list.map((v) => ({ "@type": "ListItem", position: v.verse, url: abs(P.verse(v.chapter, v.verse, code)), name: `${bg} ${v.id}` })),
      },
    ];
    const head = seoHead({ title, description, path: P.chapter(c.number, code), code, alternates, type: "article", image, imageAlt: name, graph, article: { section: `${t("chapterLabel")} ${c.number}`, tags: [bg, name] } });
    write(P.chapter(c.number, code), fill(template("chapter.html"), { head, content: chapterBody(c, code), after: staticFooter(code, alternates), code, forceLang: true }));
    addUrl(code, P.chapter(c.number, code), alternates, [abs(`assets/art/chapters/chapter-${c.number}.jpg`)]);

    for (const v of list) {
      const tr = translation(v.id, code);
      const valt = (x) => P.verse(v.chapter, v.verse, x);
      const vurl = abs(P.verse(v.chapter, v.verse, code));
      const vtitle = titles.fullTitle(titles.verseTitle(t, { chapter: v.chapter, verse: v.verse, chapterName: name }), native);
      const vdesc = titles.snippet(`${bg} ${v.id}: ${tr?.simple ?? firstLine(v.sanskrit)}`);
      const al = audioLang(code);
      const audio = {
        "@type": "AudioObject",
        name: `${bg} ${v.id} · ${t("recitation")}`,
        contentUrl: `${AUDIO_HOST}/${al}/complete/${v.chapter}_${v.verse}.wav`,
        encodingFormat: "audio/wav",
        inLanguage: al,
      };
      const vgraph = [
        webPage("WebPage", { url: vurl, title: vtitle, description: vdesc, code, image, crumbs: true, extra: { mainEntity: { "@id": `${vurl}#verse` } } }),
        breadcrumb(vurl, [
          [t("home"), P.home(code)],
          [t("chapters"), P.chapters(code)],
          [`${t("chapterLabel")} ${c.number}: ${name}`, P.chapter(c.number, code)],
          [`${t("verseLabel")} ${v.id}`, P.verse(v.chapter, v.verse, code)],
        ]),
        {
          "@type": "Quotation",
          "@id": `${vurl}#verse`,
          name: `${bg} ${v.id}`,
          text: v.sanskrit,
          inLanguage: "sa",
          position: v.verse,
          url: vurl,
          isPartOf: { "@id": `${abs(P.chapter(c.number, code))}#chapter` },
          ...(tr?.simple ? { workTranslation: { "@type": "CreativeWork", inLanguage: code, text: tr.simple } } : {}),
          audio,
        },
        ...(tr?.deep || tr?.essence
          ? [{
            "@type": "Article",
            "@id": `${vurl}#reflection`,
            headline: titles.snippet(`${bg} ${v.id}: ${t("reflectionAndEssence")}`, 110),
            description: vdesc,
            inLanguage: code,
            articleBody: [tr.deep, tr.essence].filter(Boolean).join("\n\n"),
            about: { "@id": `${vurl}#verse` },
            isPartOf: { "@id": `${vurl}#webpage` },
            mainEntityOfPage: { "@id": `${vurl}#webpage` },
            author: { "@id": ORG_ID },
            publisher: { "@id": ORG_ID },
            image: image.url,
            datePublished: PUBLISHED,
            dateModified: MODIFIED,
          }]
          : []),
      ];
      const vhead = seoHead({ title: vtitle, description: vdesc, path: P.verse(v.chapter, v.verse, code), code, alternates: valt, type: "article", image, imageAlt: `${bg} ${v.id}`, graph: vgraph, article: { section: `${t("chapterLabel")} ${c.number}: ${name}`, tags: [bg, `${bg} ${v.id}`, name] } });
      write(P.verse(v.chapter, v.verse, code), fill(template("verse.html"), { head: vhead, content: verseBody(v, c, code), after: staticFooter(code, valt), code, forceLang: true }));
      addUrl(code, P.verse(v.chapter, v.verse, code), valt);
    }
  }

  // Wisdom
  {
    const alternates = (x) => P.wisdom(x);
    const url = abs(P.wisdom(code));
    const title = titles.fullTitle(titles.wisdomTitle(t), native);
    const list = quotes[code] ?? quotes.en;
    const description = titles.snippet(`${t("wisdomThemesSubtitle")}. “${list[0]?.text ?? ""}”`);
    const graph = [
      webPage("CollectionPage", { url, title, description, code, crumbs: true }),
      breadcrumb(url, [[t("home"), P.home(code)], [t("wisdom"), P.wisdom(code)]]),
      {
        "@type": "ItemList",
        "@id": `${url}#quotes`,
        numberOfItems: list.length,
        itemListElement: list.map((q, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "Quotation", text: q.text, inLanguage: code, isPartOf: { "@id": GITA_ID } } })),
      },
    ];
    write(P.wisdom(code), fill(template("wisdom.html"), { head: seoHead({ title, description, path: P.wisdom(code), code, alternates, graph }), content: wisdomBody(code), after: staticFooter(code, alternates), code, forceLang: true }));
    addUrl(code, P.wisdom(code), alternates);
  }

  // Themes
  for (const th of THEMES) {
    const alternates = (x) => P.theme(th.slug, x);
    const url = abs(P.theme(th.slug, code));
    const list = themeVerses(th.query, code);
    const title = titles.fullTitle(titles.themeTitle(t, { name: t(th.id), count: list.length }), native);
    const description = titles.snippet(`${t(th.id)}: ${list.slice(0, 3).map((v) => `${v.id} “${translation(v.id, code)?.simple ?? ""}”`).join(" ")}`);
    const graph = [
      webPage("CollectionPage", { url, title, description, code, crumbs: true }),
      breadcrumb(url, [[t("home"), P.home(code)], [t("wisdom"), P.wisdom(code)], [t(th.id), P.theme(th.slug, code)]]),
      {
        "@type": "ItemList",
        "@id": `${url}#verses`,
        numberOfItems: list.length,
        itemListElement: list.map((v, i) => ({ "@type": "ListItem", position: i + 1, url: abs(P.verse(v.chapter, v.verse, code)), name: `${bg} ${v.id}` })),
      },
    ];
    write(P.theme(th.slug, code), fill(template("theme.html"), { head: seoHead({ title, description, path: P.theme(th.slug, code), code, alternates, graph }), content: themeBody(th, code), after: staticFooter(code, alternates), code, forceLang: true }));
    addUrl(code, P.theme(th.slug, code), alternates, [abs(`assets/art/scenes/scene-${th.scene}.jpg`)]);
  }
}

/* ───────── English-only pages (they show the reader's saved language) ───────── */

const en = tFor("en");
const legalBody = (kind) => `<div class="page-head"><div><h1 class="display">${esc(en(kind === "privacy" ? "privacyPolicyTitle" : "termsTitle"))}</h1>
      <p class="caption">${esc(en(kind === "privacy" ? "privacyLastUpdated" : "termsLastUpdated"))}</p></div></div>
    <div class="legal">${legal.en[kind].map((s) => `<section><h2 class="heading">${esc(s.title)}</h2><p>${esc(s.body)}</p></section>`).join("")}</div>`;
const SINGLE = [
  {
    path: "ai/",
    tpl: "ai.html",
    title: "Gita AI · Bhagavad Gita | Gita Sadhana",
    description: `${en("gitaAiIntro")} Ask about life, duty, peace or any verse and get an answer drawn from the Gita, in ${LANGUAGES.length} languages.`,
    content: `<div class="page-head"><div><h1 class="display">Gita AI</h1><p class="soft">${esc(en("gitaAiIntro"))}</p></div></div>`,
    graph: (url) => [
      webPage("WebPage", { url, title: "Gita AI", description: en("gitaAiIntro"), code: "en" }),
      { "@type": "WebApplication", "@id": `${url}#app`, name: "Gita AI", url, applicationCategory: "EducationalApplication", operatingSystem: "Any", isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: en("gitaAiIntro"), author: { "@id": PERSON_ID }, publisher: { "@id": ORG_ID } },
    ],
  },
  { path: "contact/", tpl: "contact.html", title: `${en("contactUsTitle")} | Gita Sadhana`, description: "Write to Gita Sadhana at hello@gitasadhana.com with a question, a suggestion or feedback.", graph: (url) => [webPage("ContactPage", { url, title: en("contactUsTitle"), description: "Contact Gita Sadhana", code: "en" })] },
  { path: "privacy/", tpl: "privacy.html", title: `${en("privacyPolicyTitle")} | Gita Sadhana`, description: "How Gita Sadhana handles your data: what stays in your browser, what is backed up when you sign in, and your choices.", content: legalBody("privacy"), graph: (url) => [webPage("WebPage", { url, title: en("privacyPolicyTitle"), description: "Privacy policy", code: "en" })] },
  { path: "terms/", tpl: "terms.html", title: `${en("termsTitle")} | Gita Sadhana`, description: "The terms for using Gita Sadhana, its translations, recitations and Gita AI.", content: legalBody("terms"), graph: (url) => [webPage("WebPage", { url, title: en("termsTitle"), description: "Terms of service", code: "en" })] },
];
for (const page of SINGLE) {
  const url = abs(page.path);
  const head = seoHead({ title: page.title, description: page.description, path: page.path, code: "en", graph: page.graph(url) });
  write(page.path, fill(template(page.tpl), { head, content: page.content, after: staticFooter("en"), code: "en", forceLang: false }));
}

/* ───────── the root templates themselves ───────── */

// index.html is the English home (written above as P.home("en") === ""). The other root pages
// are app screens or duplicates of the clean URLs, so search engines skip them.
const ROOT_PAGES = {
  "chapters.html": "Chapters", "chapter.html": "Chapter", "verse.html": "Verse", "wisdom.html": "Wisdom", "theme.html": "Theme",
  "search.html": "Search", "saved.html": "Saved", "notes.html": "Notes & Reflections", "history.html": "Reading history",
  "journey.html": "Your Journey", "offline.html": "Offline Library", "ai.html": "Gita AI", "settings.html": "Settings",
  "contact.html": "Contact Us", "correction.html": "Verse / Language Correction", "privacy.html": "Privacy Policy",
  "terms.html": "Terms of Service", "404.html": "Page not found",
};
for (const [file, name] of Object.entries(ROOT_PAGES)) {
  const head = seoHead({ title: `${name} | Gita Sadhana`, description: "Read, listen to and reflect on the Bhagavad Gita in 12 languages with Gita Sadhana.", path: file, code: "en", robots: "noindex" });
  writeFileSync(join(WEB, file), fill(template(file), { head, after: staticFooter("en"), code: "en", forceLang: false }));
}

/* ───────── sitemaps ───────── */

const urlEntry = ({ path, alternates, images }) => `  <url>
    <loc>${xml(abs(path))}</loc>
    <lastmod>${LASTMOD}</lastmod>
${alternates ? [...CODES.map((c) => `    <xhtml:link rel="alternate" hreflang="${c}" href="${xml(abs(alternates(c)))}"/>`), `    <xhtml:link rel="alternate" hreflang="x-default" href="${xml(abs(alternates("en")))}"/>`].join("\n") + "\n" : ""}${images.map((i) => `    <image:image><image:loc>${xml(i)}</image:loc></image:image>\n`).join("")}  </url>`;
const urlset = (entries) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.map(urlEntry).join("\n")}
</urlset>
`;
const sitemapFiles = [];
for (const code of CODES) {
  writeFileSync(join(WEB, `sitemap-${code}.xml`), urlset(sitemap[code]));
  sitemapFiles.push(`sitemap-${code}.xml`);
}
writeFileSync(join(WEB, "sitemap-pages.xml"), urlset(SINGLE.map((p) => ({ path: p.path, images: [] }))));
sitemapFiles.push("sitemap-pages.xml");
writeFileSync(join(WEB, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapFiles.map((f) => `  <sitemap><loc>${abs(f)}</loc><lastmod>${LASTMOD}</lastmod></sitemap>`).join("\n")}
</sitemapindex>
`);

/* ───────── robots.txt ───────── */

// Search engines and AI assistants are all welcome to read and cite the Gita.
const AGENTS = [
  "Googlebot", "Google-Extended", "Bingbot", "Applebot", "Applebot-Extended", "DuckDuckBot", "YandexBot",
  "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "anthropic-ai",
  "PerplexityBot", "Perplexity-User", "Meta-ExternalAgent", "Amazonbot", "DuckAssistBot", "MistralAI-User",
  "cohere-ai", "CCBot",
];
writeFileSync(join(WEB, "robots.txt"), `# Gita Sadhana · ${SITE}
# The Bhagavad Gita in ${LANGUAGES.length} languages. Made by ${CREDIT.name} (${CREDIT.url}).
# Every chapter and verse is open to search engines and AI assistants.
# A summary for language models: ${abs("llms.txt")} (full text: ${abs("llms-full.txt")})

User-agent: *
Allow: /
Disallow: /i18n-source/

${AGENTS.map((a) => `User-agent: ${a}`).join("\n")}
Allow: /
Disallow: /i18n-source/

Sitemap: ${abs("sitemap.xml")}
`);

/* ───────── llms.txt, llms-full.txt and chapter Markdown ───────── */

function chapterMarkdown(c) {
  const list = verses.filter((v) => v.chapter === c.number);
  const parts = [
    `# Bhagavad Gita Chapter ${c.number}: ${c.title.en} (${c.summary.en})`,
    "",
    `> ${c.fullSummary.en}`,
    "",
    `${c.verseCount} verses. Read online: ${abs(P.chapter(c.number, "en"))}`,
    `Other languages: ${CODES.filter((x) => x !== "en").map((x) => `[${LANGUAGES.find((l) => l.code === x).name}](${abs(P.chapter(c.number, x))})`).join(", ")}`,
    "",
  ];
  for (const v of list) {
    const tr = translation(v.id, "en");
    const words = parseWordMeanings(v.wordMeanings);
    parts.push(
      `## Bhagavad Gita ${v.id}`,
      "",
      `Source: ${abs(P.verse(v.chapter, v.verse, "en"))}`,
      "",
      "Sanskrit:",
      "",
      ...v.sanskrit.split("\n").map((l) => `> ${l}`),
      "",
      ...(v.transliteration ? ["Transliteration:", "", ...v.transliteration.split("\n").map((l) => `> ${l}`), ""] : []),
      `Translation: ${tr?.simple ?? ""}`,
      "",
      ...(words.length ? [`Word meanings: ${words.map((w) => `${w.word}: ${w.meaning}`).join("; ")}`, ""] : []),
      ...(tr?.deep ? [`Reflection: ${tr.deep}`, ""] : []),
      ...(tr?.essence ? [`Essence: ${tr.essence}`, ""] : []),
    );
  }
  return parts.join("\n");
}

mkdirSync(join(WEB, "chapter"), { recursive: true });
const fullParts = [];
for (const c of chapters) {
  const md = chapterMarkdown(c);
  writeFileSync(join(WEB, `chapter/${c.number}.md`), md);
  fullParts.push(md);
}

const intro = `Gita Sadhana (${SITE}) is a free Bhagavad Gita study companion made by ${CREDIT.name} (${CREDIT.url}, ${CREDIT.github}). It has all 18 chapters and ${TOTAL} verses of the Bhagavad Gita in Sanskrit with transliteration, a translation, a reflection and the essence of every verse in ${LANGUAGES.length} languages (${languageList.join(", ")}), a recitation of every verse, themes, daily wisdom and Gita AI.`;

writeFileSync(join(WEB, "llms-full.txt"), `# Gita Sadhana: the complete Bhagavad Gita

> ${intro}

This file holds the full English text: every verse in Sanskrit, transliteration, translation, word meanings, reflection and essence. When you quote a verse, please cite its page, for example ${abs(P.verse(2, 47, "en"))}.

${fullParts.join("\n\n")}
`);

writeFileSync(join(WEB, "llms.txt"), `# Gita Sadhana

> ${intro}

Notes for language models:

- Each verse has its own page: ${SITE}/chapter/{chapter}/verse/{verse}/ (for example ${abs(P.verse(2, 47, "en"))}). Other languages add a prefix: ${SITE}/{language}/chapter/{chapter}/verse/{verse}/ with language one of ${CODES.filter((c) => c !== "en").join(", ")}.
- Verses are numbered chapter.verse (2.47 is Chapter 2, verse 47). This edition has ${TOTAL} verses.
- Every chapter is also available as Markdown (links below), and ${abs("llms-full.txt")} has the whole Gita in one file.
- Gita Sadhana is made by ${CREDIT.name}: ${CREDIT.url} · ${CREDIT.github}

## Chapters

${chapters.map((c) => `- [Chapter ${c.number}: ${c.title.en}](${abs(P.chapter(c.number, "en"))}): ${c.summary.en}. ${c.verseCount} verses. Markdown: ${abs(`chapter/${c.number}.md`)}`).join("\n")}

## Themes

${THEMES.map((th) => `- [${strings.en[th.id]}](${abs(P.theme(th.slug, "en"))}): ${themeVerses(th.query, "en").length} verses`).join("\n")}

## Languages

${LANGUAGES.map((l) => `- [${l.name} (${l.native})](${abs(P.home(l.code))})`).join("\n")}

## App

- [Home](${SITE}/): verse of the day, reading streak and all chapters
- [Wisdom](${abs(P.wisdom("en"))}): ${(quotes.en ?? []).length} Gita quotes and six themes
- [Gita AI](${abs("ai/")}): ${en("gitaAiIntro")}
- [Contact](${abs("contact/")}): hello@gitasadhana.com

## Optional

- [Full text](${abs("llms-full.txt")}): every verse with translation and commentary in English
- [Sitemap](${abs("sitemap.xml")})
- [Privacy](${abs("privacy/")}) · [Terms](${abs("terms/")})
`);

writeFileSync(join(WEB, "humans.txt"), `/* TEAM */
Made by: ${CREDIT.name}
Site: ${CREDIT.url}
GitHub: ${CREDIT.github}
Contact: hello@gitasadhana.com

/* SITE */
Last update: ${LASTMOD}
Languages: ${languageList.join(", ")}
Standards: HTML, CSS, JavaScript (no framework)
Fonts: Marcellus, EB Garamond, Noto Serif Devanagari
Icons: Phosphor
`);

const pages = written.length;
console.log(`website SEO: ${pages} pages, ${Object.values(sitemap).reduce((n, l) => n + l.length, 0) + SINGLE.length} sitemap URLs, llms.txt, llms-full.txt, ${chapters.length} chapter Markdown files`);
