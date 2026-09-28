import { loadGita, search } from "../gita.js";
import { t } from "../i18n.js";
import { store } from "../store.js";
import { boot, emptyState, esc, icon, params, setTitle } from "../ui.js";
import { verseCard } from "./_cards.js";

await boot("search");
setTitle(t("searchTitle"));
await loadGita();

const SUGGESTED = ["searchKarma", "searchSoul", "searchDevotion", "searchFear", "searchMeditation", "searchDuty"];
const page = document.getElementById("page");
page.innerHTML = `
  <div class="page-head"><div><h1 class="display">${esc(t("searchTitle"))}</h1></div></div>
  <form class="search" id="form" role="search" style="max-width:640px">
    ${icon("magnifying-glass")}
    <label class="visually-hidden" for="q">${esc(t("searchTitle"))}</label>
    <input type="search" id="q" name="q" placeholder="${esc(t("searchPlaceholder"))}" autocomplete="off" enterkeyhint="search">
  </form>
  <div id="body" class="section" style="margin-top:28px"></div>`;

const input = document.getElementById("q");
const body = document.getElementById("body");

function recent() {
  return store.get("gita_recent_searches", []);
}

function idle() {
  const r = recent();
  body.innerHTML = `
    <div class="stack-sm">
      <h2 class="overline">${esc(t("suggestedLabel"))}</h2>
      <div class="chips">${SUGGESTED.map((k) => `<button class="chip" type="button" data-q="${esc(t(k))}">${esc(t(k))}</button>`).join("")}</div>
    </div>
    ${r.length ? `<div class="stack-sm" style="margin-top:20px">
      <h2 class="overline">${esc(t("recentLabel"))}</h2>
      <div class="chips">${r.map((q) => `<button class="chip" type="button" data-q="${esc(q)}">${icon("clock-counter-clockwise")}${esc(q)}</button>`).join("")}</div>
    </div>` : ""}`;
}

function run(q, { remember = true } = {}) {
  const query = q.trim();
  if (!query) return idle();
  input.value = query;
  if (remember) store.set("gita_recent_searches", [query, ...recent().filter((x) => x !== query)].slice(0, 8));
  history.replaceState({}, "", `search.html?q=${encodeURIComponent(query)}`);
  const results = search(query);
  body.innerHTML = results.length
    ? `<p class="soft">${results.length} ${esc(t("versesFound"))}</p><div class="card-grid">${results.map((v) => verseCard(v)).join("")}</div>`
    : emptyState("magnifying-glass", t("nothingYet"), t("tryDifferentWord"));
}

body.addEventListener("click", (e) => {
  const q = e.target.closest("[data-q]")?.dataset.q;
  if (q) run(q);
});
document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();
  run(input.value);
});
const initial = params.get("q");
initial ? run(initial, { remember: false }) : idle();
if (!initial) input.focus();
