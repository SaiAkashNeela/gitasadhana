import { chapterHref, chaptersHref } from "../route.js";
import { chapterArt, getChapters, loadGita } from "../gita.js";
import { pick, t } from "../i18n.js";
import { completed } from "../progress.js";
import { boot, emptyState, esc, icon, setAlternates, setTitle } from "../ui.js";
import { chaptersTitle } from "../titles.js";

await boot("chapters");
setTitle(chaptersTitle(t));
setAlternates((code) => chaptersHref(code));
await loadGita({ translations: false });

const page = document.getElementById("page");
page.innerHTML = `
  <div class="page-head">
    <div>
      <h1 class="display">${esc(t("chapters"))}</h1>
      <p class="soft">${esc(t("exploreChaptersDesc"))}</p>
    </div>
  </div>
  <label class="search" style="max-width:520px;margin-bottom:24px">
    ${icon("magnifying-glass")}
    <span class="visually-hidden">${esc(t("searchChaptersPlaceholder"))}</span>
    <input type="search" id="q" placeholder="${esc(t("searchChaptersPlaceholder"))}" autocomplete="off">
  </label>
  <div id="list"></div>`;

const done = completed();
function render(q = "") {
  const needle = q.trim().toLowerCase();
  const items = getChapters().filter((c) => !needle || pick(c.title).toLowerCase().includes(needle) || pick(c.summary).toLowerCase().includes(needle) || String(c.number) === needle);
  const list = document.getElementById("list");
  if (!items.length) {
    list.innerHTML = emptyState("book-open-text", t("noMatchingChapters"));
    return;
  }
  list.innerHTML = `<div class="chapter-grid">${items.map((c) => {
    const read = done.filter((id) => id.startsWith(`${c.number}.`)).length;
    return `<a class="chapter-card" href="${chapterHref(c.number)}">
      <img src="${chapterArt(c.number)}" alt="" loading="lazy" width="720" height="450">
      <span class="body">
        <span class="overline flame">${esc(t("chapterLabel"))} ${c.number}</span>
        <span class="heading">${esc(pick(c.title))}</span>
        <span class="caption">${esc(pick(c.summary))}</span>
        <span class="meta"><span class="progress" aria-hidden="true"><span style="width:${(read / c.verseCount) * 100}%"></span></span><span class="caption num">${read}/${c.verseCount}</span></span>
      </span>
    </a>`;
  }).join("")}</div>`;
}
render();
document.getElementById("q").addEventListener("input", (e) => render(e.target.value));
