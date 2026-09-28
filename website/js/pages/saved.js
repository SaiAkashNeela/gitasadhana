import { chaptersHref, wisdomHref } from "../route.js";
import { findQuote, getVerse, loadGita } from "../gita.js";
import { t } from "../i18n.js";
import { bookmarks, favorites, toggleBookmark, toggleFavorite } from "../progress.js";
import { boot, emptyState, esc, icon, params, setTitle } from "../ui.js";
import { verseCard } from "./_cards.js";

await boot("saved");
setTitle(t("savedWisdom"));
await loadGita();

let tab = params.get("tab") === "wisdom" ? "wisdom" : "verses";
const page = document.getElementById("page");

function render() {
  const saved = bookmarks().map(getVerse).filter(Boolean);
  const favVerses = favorites().map(getVerse).filter(Boolean);
  const favQuotes = favorites().map(findQuote).filter(Boolean);
  const remove = (kind, id) => `<button class="icon-btn" type="button" data-remove="${kind}" data-id="${id}" aria-label="${esc(t("delete"))}">${icon("trash")}</button>`;
  const body = tab === "verses"
    ? saved.length ? `<div class="card-grid">${saved.map((v) => verseCard(v, remove("bookmark", v.id))).join("")}</div>` : emptyState("bookmark-simple", t("noSavedBookmarks"), t("noSavedBookmarksSub"), `<a class="btn" href="${chaptersHref()}">${esc(t("chapters"))}</a>`)
    : favVerses.length + favQuotes.length
      ? `<div class="card-grid">${favVerses.map((v) => verseCard(v, remove("favorite", v.id))).join("")}${favQuotes.map((q) => `<figure class="quote" style="margin:0;position:relative"><p>“${esc(q.text)}”</p><footer><span>${esc(t("gitaQuote"))}</span>${remove("favorite", q.id)}</footer></figure>`).join("")}</div>`
      : emptyState("heart", t("noFavorites"), t("noFavoritesSub"), `<a class="btn" href="${wisdomHref()}">${esc(t("wisdom"))}</a>`);

  page.innerHTML = `
    <div class="page-head"><div><h1 class="display">${esc(t("savedWisdom"))}</h1></div></div>
    <div class="segmented" role="tablist" style="max-width:480px;margin-bottom:24px">
      <button role="tab" type="button" data-tab="verses" aria-selected="${tab === "verses"}">${esc(t("verseSaves"))} (${saved.length})</button>
      <button role="tab" type="button" data-tab="wisdom" aria-selected="${tab === "wisdom"}">${esc(t("wisdomSaves"))} (${favVerses.length + favQuotes.length})</button>
    </div>
    <div role="tabpanel">${body}</div>`;
}

page.addEventListener("click", (e) => {
  const tb = e.target.closest("[data-tab]");
  if (tb) {
    tab = tb.dataset.tab;
    history.replaceState({}, "", tab === "wisdom" ? "saved.html?tab=wisdom" : "saved.html");
    render();
  }
  const rm = e.target.closest("[data-remove]");
  if (rm) {
    e.preventDefault();
    rm.dataset.remove === "bookmark" ? toggleBookmark(rm.dataset.id) : toggleFavorite(rm.dataset.id);
    render();
  }
});
render();
