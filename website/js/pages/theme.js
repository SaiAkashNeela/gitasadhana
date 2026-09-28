import { loadGita, sceneArt, THEMES, themeVerses } from "../gita.js";
import { t } from "../i18n.js";
import { route, themeHref } from "../route.js";
import { themeTitle } from "../titles.js";
import { boot, emptyState, esc, setAlternates, setTitle } from "../ui.js";
import { verseCard } from "./_cards.js";

await boot("wisdom");
await loadGita();

const wanted = route().theme;
const theme = THEMES.find((x) => x.slug === wanted || x.id === wanted) ?? THEMES[0];
setAlternates((code) => themeHref(theme.slug, code));
const title = t(theme.id);
const verses = themeVerses(theme.query);
setTitle(themeTitle(t, { name: title, count: verses.length }));

document.getElementById("page").innerHTML = `
  <div class="hero-verse" style="min-height:240px">
    <img class="scene on" src="${sceneArt(theme.scene)}" alt="">
    <h1 class="display">${esc(title)}</h1>
    <p class="ref">${verses.length} ${esc(t("verses").toLowerCase())}</p>
  </div>
  <section class="section">
    ${verses.length ? `<div class="card-grid">${verses.map((v) => verseCard(v)).join("")}</div>` : emptyState("flower-lotus", t("nothingYet"))}
  </section>`;
