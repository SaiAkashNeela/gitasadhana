import { chapterHref, chaptersHref, route, verseHref } from "../route.js";
import { chapterTitle } from "../titles.js";
import { APPROX_MB_PER_VERSE } from "../config.js";
import { chapterArt, getChapter, loadGita, translation, versesIn } from "../gita.js";
import { pick, t, tf } from "../i18n.js";
import { isCompleted, toggleCompleted } from "../progress.js";
import { library, saveMany, supported as offlineSupported } from "../offline.js";
import { lang } from "../i18n.js";
import { boot, confirmDialog, emptyState, esc, icon, setAlternates, setTitle, share, toast } from "../ui.js";
import { deleteVerse } from "../offline.js";

await boot("chapters");
await loadGita();

const n = route().chapter;
const chapter = getChapter(n);
const page = document.getElementById("page");

if (!chapter) {
  page.innerHTML = emptyState("book-open-text", t("pageNotFound"), "", `<a class="btn" href="${chaptersHref()}">${esc(t("chapters"))}</a>`);
} else {
  const title = pick(chapter.title);
  setTitle(chapterTitle(t, { n, title, summary: pick(chapter.summary) }));
  setAlternates((code) => chapterHref(n, code));
  const verses = versesIn(n);

  page.innerHTML = `
    <div class="chapter-layout">
      <aside class="chapter-aside">
        <img src="${chapterArt(n)}" alt="${esc(title)}" width="720" height="720">
        <div class="stack-sm">
          <p class="overline flame">${esc(t("chapterLabel"))} ${n}</p>
          <h1 class="display">${esc(title)}</h1>
          <p class="serif soft" style="font-size:1.15rem;font-style:italic">${esc(pick(chapter.summary))}</p>
        </div>
        <p class="soft">${esc(pick(chapter.fullSummary))}</p>
        <div class="stats">
          <div class="stat"><b>${chapter.verseCount}</b><span>${esc(t("verses"))}</span></div>
          <div class="stat"><b id="read-pct">0%</b><span>${esc(t("readLabel"))}</span></div>
          <div class="stat"><b>~${Math.round(chapter.verseCount * 0.6)}m</b><span>${esc(t("lengthLabel"))}</span></div>
        </div>
        <div class="stack-sm">
          <a class="btn block" id="begin" href="${verseHref(`${n}.1`)}">${icon("book-open-text")}${esc(t("beginChapterBtn"))}</a>
          <div style="display:flex;gap:8px">
            <button class="btn secondary" style="flex:1" type="button" id="download" ${offlineSupported ? "" : "hidden"}>${icon("download-simple")}<span>${esc(t("downloadChapterBtn"))}</span></button>
            <button class="icon-btn filled" type="button" id="share" aria-label="${esc(t("share"))}">${icon("export")}</button>
          </div>
          <p class="caption" id="dl-note"></p>
        </div>
      </aside>

      <section class="stack" aria-label="${esc(t("verses"))}">
        <div class="section-head">
          <h2 class="title">${esc(t("verses"))}</h2>
          <span class="caption num" id="done-count"></span>
        </div>
        <label class="search">
          ${icon("magnifying-glass")}
          <span class="visually-hidden">${esc(t("searchPlaceholder"))}</span>
          <input type="search" id="q" placeholder="${esc(t("searchPlaceholder"))}" autocomplete="off">
        </label>
        <div class="verse-rows" id="rows"></div>
      </section>
    </div>`;

  const rows = document.getElementById("rows");
  const refresh = () => {
    const done = verses.filter((v) => isCompleted(v.id)).length;
    document.getElementById("read-pct").textContent = `${Math.round((done / chapter.verseCount) * 100)}%`;
    document.getElementById("done-count").textContent = `${done} / ${chapter.verseCount} ${t("readLabel").toLowerCase()}`;
    const next = verses.find((v) => !isCompleted(v.id)) ?? verses[0];
    document.getElementById("begin").href = verseHref(next.id);
  };

  function renderRows(q = "") {
    const needle = q.trim().toLowerCase();
    const list = verses.filter((v) => {
      if (!needle) return true;
      const text = translation(v.id)?.simple ?? "";
      return String(v.verse) === needle || text.toLowerCase().includes(needle) || v.sanskrit.toLowerCase().includes(needle);
    });
    if (!list.length) {
      rows.innerHTML = emptyState("magnifying-glass", t("nothingYet"));
      return;
    }
    rows.innerHTML = list.map((v) => {
      const on = isCompleted(v.id);
      return `<div class="verse-row">
        <button class="check" type="button" role="checkbox" aria-checked="${on}" data-id="${v.id}" aria-label="${esc(t("verseLabel"))} ${v.verse}">${icon(on ? "check-circle" : "circle", on ? "fill" : "regular")}</button>
        <a href="${verseHref(v.id)}">
          <span class="text"><b>${esc(t("verseLabel"))} ${v.verse}</b><span>${esc(translation(v.id)?.simple ?? "")}</span></span>
          ${icon("caret-right")}
        </a>
      </div>`;
    }).join("");
  }

  rows.addEventListener("click", (e) => {
    const b = e.target.closest(".check");
    if (!b) return;
    const on = toggleCompleted(b.dataset.id);
    b.setAttribute("aria-checked", String(on));
    b.innerHTML = icon(on ? "check-circle" : "circle", on ? "fill" : "regular");
    refresh();
  });
  document.getElementById("q").addEventListener("input", (e) => renderRows(e.target.value));
  document.getElementById("share").addEventListener("click", () =>
    share(tf("shareChapterMessage", { n, title, summary: pick(chapter.summary) })));

  // Offline copy of the whole chapter's recitation.
  const dl = document.getElementById("download");
  const note = document.getElementById("dl-note");
  const ids = verses.map((v) => v.id);
  let busy = false;
  async function refreshDownload() {
    if (!offlineSupported) return;
    const { ids: saved } = await library(lang);
    const have = ids.filter((id) => saved.includes(id)).length;
    const complete = have === ids.length;
    dl.innerHTML = complete ? `${icon("check-circle", "fill")}<span>${esc(t("chapterOfflineBtn"))}</span>` : `${icon("download-simple")}<span>${esc(t("downloadChapterBtn"))}</span>`;
    note.textContent = complete ? "" : `~${Math.round((ids.length - have) * APPROX_MB_PER_VERSE)} MB`;
    dl.dataset.complete = String(complete);
  }
  dl?.addEventListener("click", async () => {
    if (busy) return;
    if (dl.dataset.complete === "true") {
      if (await confirmDialog({ title: `${t("deleteChapterConfirm")} ${n}?`, confirm: t("delete"), danger: true })) {
        await Promise.all(ids.map((id) => deleteVerse(lang, id)));
        toast(tf("clearedChapterAudioToast", { n }));
        refreshDownload();
      }
      return;
    }
    busy = true;
    const failed = await saveMany(lang, ids, (f) => {
      dl.innerHTML = `${icon("download-simple")}<span>${esc(t("downloadingChapterBtn"))} ${Math.round(f * 100)}%</span>`;
    });
    busy = false;
    if (failed) toast(tf("someDownloadsFailed", { n: failed }), { kind: "error" });
    refreshDownload();
  });

  renderRows();
  refresh();
  refreshDownload();
}
