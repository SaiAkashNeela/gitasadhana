import { APPROX_MB_PER_VERSE } from "../config.js";
import { allVerses, getChapters, loadGita, versesIn } from "../gita.js";
import { lang, languageName, pick, t, tf } from "../i18n.js";
import { audioLang, deleteVerse, library, saveMany, supported } from "../offline.js";
import { boot, confirmDialog, emptyState, esc, icon, setTitle, toast } from "../ui.js";

await boot("offline");
setTitle(t("offlineLibrary"));
await loadGita({ translations: false });

const page = document.getElementById("page");
let controller = null;
let progressLabel = "";

async function render() {
  if (!supported) {
    page.innerHTML = emptyState("download-simple", t("offlineLibrary"), t("offlineUnsupported"));
    return;
  }
  const { ids, bytes } = await library(lang);
  const saved = new Set(ids);
  const chapters = getChapters();
  const total = allVerses().length;
  const missing = total - ids.length;
  const estimate = navigator.storage?.estimate ? await navigator.storage.estimate() : null;

  page.innerHTML = `
    <div class="page-head"><div>
      <h1 class="display">${esc(t("offlineLibrary"))}</h1>
      <p class="soft">${esc(t("offlineLibrarySub"))}</p>
    </div></div>
    <div class="journey-grid">
      <div class="stack">
        <div class="panel stack-sm">
          <p class="overline">${esc(t("localStorageTitle"))}</p>
          <p class="title"><span class="fig">${(bytes / 1048576).toFixed(1)}</span> MB ${esc(t("usedSpace"))}</p>
          <p class="caption">${ids.length} / ${total} ${esc(t("verses").toLowerCase())}, ${esc(languageName(audioLang(lang)))}</p>
          ${estimate?.quota ? `<p class="caption">${esc(tf("storageAvailable", { gb: ((estimate.quota - (estimate.usage || 0)) / 1073741824).toFixed(1) }))}</p>` : ""}
        </div>
        <div class="panel stack-sm" style="background:var(--accent);color:var(--on-accent)">
          <span class="om" style="color:inherit;font-size:1.6rem">ॐ</span>
          <h2 class="title">${esc(t("fullGitaAudioTitle"))}</h2>
          <p style="opacity:.85">${esc(t("fullGitaAudioDesc"))} (${esc(t("sizeApprox"))} ${((missing * APPROX_MB_PER_VERSE) / 1024).toFixed(1)} GB)</p>
          ${missing === 0
            ? `<p style="display:flex;gap:8px;align-items:center">${icon("check-circle", "fill")}${esc(t("offlineReady"))}</p>`
            : controller
              ? `<p id="dl-progress">${esc(progressLabel)}</p><div><button class="btn secondary sm" id="cancel" type="button">${esc(t("cancel"))}</button></div>`
              : `<div><button class="btn secondary sm" id="all" type="button">${icon("download-simple")}${esc(t("downloadCompleteGita"))}</button></div>`}
        </div>
      </div>
      <section class="stack" aria-label="${esc(t("chaptersRecitations"))}">
        <h2 class="overline">${esc(t("chaptersRecitations"))}</h2>
        <div class="group">${chapters.map((c) => {
          const vs = versesIn(c.number).map((v) => v.id);
          const have = vs.filter((id) => saved.has(id)).length;
          const complete = have === vs.length;
          return `<div class="row">
            ${icon(complete ? "check-circle" : "headphones", complete ? "fill" : "duotone")}
            <span class="grow"><b>${esc(t("chapterLabel"))} ${c.number}: ${esc(pick(c.title))}</b>
              <span class="caption">${have} / ${c.verseCount} ${esc(t("verses").toLowerCase())}, ~${Math.round(c.verseCount * APPROX_MB_PER_VERSE)} MB</span></span>
            ${have ? `<button class="icon-btn" type="button" data-del="${c.number}" aria-label="${esc(t("deleteChapterConfirm"))} ${c.number}">${icon("trash")}</button>` : ""}
            ${complete ? "" : `<button class="icon-btn" type="button" data-get="${c.number}" aria-label="${esc(t("downloadChapterBtn"))}" ${controller ? "disabled" : ""}>${icon("download-simple")}</button>`}
          </div>`;
        }).join("")}</div>
      </section>
    </div>`;
}

async function download(ids, label) {
  controller = new AbortController();
  progressLabel = `${label} 0%`;
  await render();
  const failed = await saveMany(lang, ids, (f) => {
    progressLabel = `${label} ${Math.round(f * 100)}%`;
    const el = page.querySelector("#dl-progress");
    if (el) el.textContent = progressLabel;
  }, controller.signal);
  controller = null;
  if (failed) toast(tf("someDownloadsFailed", { n: failed }), { kind: "error" });
  render();
}

page.addEventListener("click", async (e) => {
  if (e.target.closest("#all")) {
    const { ids } = await library(lang);
    const todo = allVerses().map((v) => v.id).filter((id) => !ids.includes(id));
    const ok = await confirmDialog({ title: t("downloadCompleteGita"), message: `${t("sizeApprox")} ${((todo.length * APPROX_MB_PER_VERSE) / 1024).toFixed(1)} GB`, confirm: t("download") });
    if (ok) download(todo, t("downloadingEntireGita"));
  }
  if (e.target.closest("#cancel")) controller?.abort();
  const get = e.target.closest("[data-get]");
  if (get) {
    const n = Number(get.dataset.get);
    download(versesIn(n).map((v) => v.id), `${t("downloadingChapterBtn")} ${n}`);
  }
  const del = e.target.closest("[data-del]");
  if (del) {
    const n = Number(del.dataset.del);
    if (await confirmDialog({ title: `${t("deleteChapterConfirm")} ${n}?`, confirm: t("delete"), danger: true })) {
      await Promise.all(versesIn(n).map((v) => deleteVerse(lang, v.id)));
      toast(tf("clearedChapterAudioToast", { n }));
      render();
    }
  }
});
render();
