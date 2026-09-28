import { chaptersHref, verseHref } from "../route.js";
import { getChapter, loadGita } from "../gita.js";
import { localeFor, pick, t } from "../i18n.js";
import { history } from "../progress.js";
import { boot, emptyState, esc, icon, setTitle } from "../ui.js";

await boot("history");
setTitle(t("readingHistory"));
await loadGita({ translations: false });

function when(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return t("Today");
  if (d.toDateString() === yesterday.toDateString()) return t("yesterday");
  return d.toLocaleDateString(localeFor(), { day: "numeric", month: "short", year: "numeric" });
}

const items = history();
document.getElementById("page").innerHTML = `
  <div class="page-head"><div><h1 class="display">${esc(t("readingHistory"))}</h1></div></div>
  ${items.length ? `<div class="group" style="max-width:760px">${items.map((h) => `
    <a class="row" href="${verseHref(`${h.chapter}.${h.verse}`)}">
      ${icon("book-open-text", "duotone")}
      <span class="grow"><b>${esc(t("chapterLabel"))} ${h.chapter}, ${esc(t("verseLabel"))} ${h.verse}</b><span class="caption">${esc(pick(getChapter(h.chapter)?.title))} · ${esc(when(h.date))}</span></span>
      <i class="ph ph-caret-right chev" aria-hidden="true"></i>
    </a>`).join("")}</div>` : emptyState("clock-counter-clockwise", t("historyEmpty"), "", `<a class="btn" href="${chaptersHref()}">${esc(t("chapters"))}</a>`)}`;
