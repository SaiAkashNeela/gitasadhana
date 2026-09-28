import { verseHref } from "../route.js";
import { getVerse, loadGita } from "../gita.js";
import { localeFor, t } from "../i18n.js";
import { addNote, deleteNote, notes } from "../progress.js";
import { boot, emptyState, esc, icon, setTitle, toast } from "../ui.js";

await boot("notes");
setTitle(t("notesAndReflections"));
await loadGita({ translations: false });

const page = document.getElementById("page");
page.innerHTML = `
  <div class="page-head"><div><h1 class="display">${esc(t("notesAndReflections"))}</h1></div></div>
  <div class="panel stack-sm" style="max-width:720px">
    <label class="visually-hidden" for="draft">${esc(t("writeReflectionPlaceholder"))}</label>
    <textarea id="draft" class="serif" rows="4" placeholder="${esc(t("writeReflectionPlaceholder"))}" style="width:100%;border:0;background:transparent;font-size:1.1rem;line-height:1.6;resize:vertical;outline:0"></textarea>
    <div style="display:flex;justify-content:flex-end"><button class="btn sm" id="save" type="button" disabled>${esc(t("saveBtn"))}</button></div>
  </div>
  <div id="list" class="section"></div>`;

const draft = document.getElementById("draft");
const save = document.getElementById("save");
draft.addEventListener("input", () => (save.disabled = !draft.value.trim()));
save.addEventListener("click", () => {
  addNote("General", draft.value.trim());
  draft.value = "";
  save.disabled = true;
  render();
  toast(t("reflectionSavedToast"));
});

function when(value) {
  const d = new Date(value);
  return value.includes("T") && !Number.isNaN(d.getTime()) ? d.toLocaleDateString(localeFor(), { day: "numeric", month: "short", year: "numeric" }) : value;
}

function render() {
  const list = notes();
  const el = document.getElementById("list");
  if (!list.length) {
    el.innerHTML = emptyState("note-pencil", t("noReflections"), t("noReflectionsSub"));
    return;
  }
  el.innerHTML = `<div class="card-grid">${list.map((n) => {
    const verse = n.verseId !== "General" ? getVerse(n.verseId) : null;
    const where = verse ? `<a class="link" href="${verseHref(verse.id)}">${esc(t("verseLabel"))} ${verse.id}</a>` : esc(t("noteGeneral"));
    return `<article class="panel stack-sm">
      <div style="display:flex;align-items:center;gap:8px">
        <span class="col-text"><b class="heading">${esc(n.title === "Reflection" ? t("reflection") : n.title)}</b><span class="caption">${esc(when(n.date))} · ${where}</span></span>
        <button class="icon-btn" type="button" data-del="${n.id}" aria-label="${esc(t("delete"))}">${icon("trash")}</button>
      </div>
      <p class="serif" style="font-size:1.08rem;line-height:1.6;white-space:pre-wrap">${esc(n.body)}</p>
    </article>`;
  }).join("")}</div>`;
}
document.getElementById("list").addEventListener("click", (e) => {
  const b = e.target.closest("[data-del]");
  if (!b) return;
  deleteNote(b.dataset.del);
  render();
  toast(t("deletedNoteToast"));
});
render();
