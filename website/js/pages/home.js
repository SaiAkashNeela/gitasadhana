import { chapterHref, chaptersHref, homeHref, verseHref, wisdomHref } from "../route.js";
import { allVerses, chapterThumb, getChapter, getChapters, loadGita, pickDaily, quotesFor, sceneArt, translation } from "../gita.js";
import { lang, pick, t, tf } from "../i18n.js";
import { completed, history, profile } from "../progress.js";
import { boot, esc, icon, nativeTag, setAlternates } from "../ui.js";
import { homeTitle } from "../titles.js";

await boot("home");
document.title = homeTitle(t, nativeTag());
setAlternates((code) => homeHref(code));
await loadGita();

const p = profile();
const name = p.name === "Seeker" ? t("seeker") : p.name;
const daily = pickDaily("verse", allVerses());
const verseId = daily?.id ?? "2.47";
const tr = translation(verseId);
const quote = pickDaily("wisdom", quotesFor());
const last = history()[0];
const done = completed();

const ring = (value) => {
  const r = 45;
  const c = 2 * Math.PI * r;
  return `<svg viewBox="0 0 96 96" width="96" height="96" aria-hidden="true">
    <circle cx="48" cy="48" r="${r}" fill="none" stroke="var(--hairline)" stroke-width="3"/>
    ${value > 0 ? `<circle cx="48" cy="48" r="${r}" fill="none" stroke="var(--flame)" stroke-width="3" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c - value * c}"/>` : ""}
  </svg>`;
};

const scenes = Array.from({ length: 9 }, (_, i) => sceneArt(i + 1));

document.getElementById("page").innerHTML = `
  <div class="page-head">
    <div>
      <p class="soft small">${esc(t("hariOm"))}, ${esc(name)}</p>
      <h1 class="display">${esc(t("todaysVerse"))}</h1>
    </div>
  </div>

  <div class="home-grid">
    <section class="stack" aria-label="${esc(t("verseOfTheDay"))}">
      <a class="hero-verse" href="${verseHref(verseId)}">
        ${scenes.map((s, i) => `<img class="scene${i === 0 ? " on" : ""}" src="${s}" alt="" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}>`).join("")}
        <p class="overline">${esc(t("verseOfTheDay"))}</p>
        <blockquote>“${esc(tr?.simple ?? "")}”</blockquote>
        <p class="ref">${esc(t("bhagavadGita"))} ${verseId}</p>
        <span class="actions">
          <span class="btn">${icon("book-open-text")}${esc(t("readVerse"))}</span>
        </span>
      </a>
      ${last ? (() => {
        const ch = getChapter(last.chapter);
        return `<a class="continue" href="${verseHref(`${last.chapter}.${last.verse}`)}">
          <img src="${chapterThumb(last.chapter)}" alt="" width="64" height="64" loading="lazy">
          <span class="col-text">
            <span class="caption">${esc(t("continueReading"))}</span>
            <b>${esc(t("chapterLabel"))} ${last.chapter}, ${esc(t("verseLabel"))} ${last.verse}</b>
            <span class="caption">${esc(pick(ch?.title))}</span>
          </span>${icon("caret-right")}
        </a>`;
      })() : ""}
    </section>

    <aside class="side-stack">
      <a class="streak-card" href="journey.html">
        <span class="flame-badge">${icon("flame", "fill")}</span>
        <span class="col-text">
          <b class="heading"><span class="fig">${p.streak}</span> ${esc(t("dayStreak"))}</b>
          <span class="caption">${p.versesRead} ${esc(t("verses").toLowerCase())}, ${p.minutes} ${esc(t("minutes").toLowerCase())}</span>
        </span>${icon("caret-right")}
      </a>
      <a class="wisdom-card" href="${wisdomHref()}">
        <span class="om">ॐ</span>
        <p class="scripture">“${esc(quote?.text ?? "")}”</p>
        <span class="caption">${esc(t("gitaQuote"))}</span>
      </a>
      <a class="streak-card" href="ai/">
        <span class="flame-badge" data-tone="accent">${icon("chat-teardrop-text", "duotone")}</span>
        <span class="col-text">
          <b class="heading">Gita AI</b>
          <span class="caption">${esc(t("gitaAiIntro"))}</span>
        </span>${icon("caret-right")}
      </a>
    </aside>
  </div>

  <section class="section">
    <div class="section-head">
      <h2 class="title">${esc(t("chapters"))}</h2>
      <a class="link" href="${chaptersHref()}">${esc(t("allBtn"))}</a>
    </div>
    <div class="chapter-strip">
      ${getChapters().map((c) => {
        const read = done.filter((id) => id.startsWith(`${c.number}.`)).length;
        return `<a href="${chapterHref(c.number)}" aria-label="${esc(tf("chapterAria", { n: c.number, title: pick(c.title) }))}">
          <span class="ring">${ring(read / c.verseCount)}<img src="${chapterThumb(c.number)}" alt="" width="84" height="84" loading="lazy"></span>
          <span>${esc(pick(c.title))}</span>
        </a>`;
      }).join("")}
    </div>
  </section>
`;

// The about section and questions under the home page are written in English only.
const about = document.getElementById("about");
if (about) about.hidden = lang !== "en";

// The nine Gita scenes dissolve slowly behind the verse (still when reduced motion is set).
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const imgs = [...document.querySelectorAll(".hero-verse .scene")];
  let i = 0;
  setInterval(() => {
    imgs[i].classList.remove("on");
    i = (i + 1) % imgs.length;
    imgs[i].classList.add("on");
  }, 8000);
}
