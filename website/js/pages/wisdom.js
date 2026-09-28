import { themeHref, wisdomHref } from "../route.js";
import { loadGita, pickDaily, quotesFor, sceneArt, THEMES } from "../gita.js";
import { t, tf } from "../i18n.js";
import { isFavorite, toggleFavorite } from "../progress.js";
import { boot, esc, icon, setAlternates, setTitle, share, toast } from "../ui.js";
import { wisdomTitle } from "../titles.js";

await boot("wisdom");
setTitle(wisdomTitle(t));
setAlternates((code) => wisdomHref(code));
await loadGita({ translations: false });

const quotes = quotesFor();
const daily = pickDaily("wisdom", quotes);
const rest = quotes.filter((q) => q.id !== daily?.id);

const page = document.getElementById("page");
page.innerHTML = `
  <div class="page-head"><div><h1 class="display">${esc(t("wisdom"))}</h1></div></div>
  <a class="hero-verse" href="${location.pathname}#quotes" style="min-height:340px">
    <img class="scene on" src="${sceneArt(4)}" alt="" fetchpriority="high">
    <p class="overline">${esc(t("dailyWisdom"))}</p>
    <blockquote>“${esc(daily?.text ?? "")}”</blockquote>
    <p class="ref">${esc(t("gitaQuote"))}</p>
  </a>

  <section class="section">
    <div class="section-head"><h2 class="title">${esc(t("wisdomThemesTitle"))}</h2></div>
    <div class="theme-grid">${THEMES.map((th) => `<a class="theme-tile" href="${themeHref(th.slug)}">
      <img src="${sceneArt(th.scene)}" alt="" loading="lazy"><span class="om">ॐ</span><b>${esc(t(th.id))}</b></a>`).join("")}</div>
  </section>

  <section class="section" id="quotes">
    <h2 class="title">${esc(t("gitaQuote"))}</h2>
    <div class="quote-list">${rest.map((q) => `<figure class="quote">
      <p>“${esc(q.text)}”</p>
      <footer><span>${esc(t("bhagavadGita"))}</span>
        <button class="icon-btn ${isFavorite(q.id) ? "on" : ""}" type="button" data-fav="${q.id}" aria-pressed="${isFavorite(q.id)}" aria-label="${esc(t("addToFavorites"))}">${icon("bookmark-simple", isFavorite(q.id) ? "fill" : "regular")}</button>
        <button class="icon-btn" type="button" data-share="${q.id}" aria-label="${esc(t("share"))}">${icon("export")}</button>
      </footer></figure>`).join("")}</div>
  </section>`;

page.addEventListener("click", (e) => {
  const fav = e.target.closest("[data-fav]");
  if (fav) {
    const on = toggleFavorite(fav.dataset.fav);
    fav.classList.toggle("on", on);
    fav.setAttribute("aria-pressed", String(on));
    fav.innerHTML = icon("bookmark-simple", on ? "fill" : "regular");
    toast(t(on ? "addedToFavoritesToast" : "removedFromFavoritesToast"));
  }
  const sh = e.target.closest("[data-share]");
  if (sh) share(tf("shareQuoteMessage", { text: quotes.find((q) => q.id === sh.dataset.share)?.text ?? "" }));
});
