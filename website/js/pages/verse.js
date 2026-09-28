import { adjacent, getChapter, getVerse, loadGita, normalizeId, parseWordMeanings, translation } from "../gita.js";
import { lang, localeFor, pick, t, tf } from "../i18n.js";
import { audioLang, deleteVerse, isSaved, saveVerse, supported as offlineSupported } from "../offline.js";
import * as player from "../player.js";
import {
  addNote,
  deleteNote,
  isBookmarked,
  isCompleted,
  isFavorite,
  markCompleted,
  notes,
  recordRead,
  settings,
  toggleBookmark,
  toggleCompleted,
  toggleFavorite,
} from "../progress.js";
import { chapterHref, chaptersHref, route, verseHref } from "../route.js";
import { verseTitle } from "../titles.js";
import { $, boot, confirmDialog, emptyState, esc, icon, setAlternates, setTitle, share, toast } from "../ui.js";

await boot("chapters");
await loadGita();

const page = document.getElementById("page");
page.classList.add("reading");
const start = route();
let id = normalizeId(start.verse ? `${start.chapter}.${start.verse}` : "2.47");

if (!getVerse(id)) {
  page.innerHTML = emptyState("book-open-text", t("pageNotFound"), "", `<a class="btn" href="${chaptersHref()}">${esc(t("chapters"))}</a>`);
} else {
  document.body.classList.add("has-player");
  document.body.insertAdjacentHTML("beforeend", playerMarkup());
  wirePlayer();
  show(id, { autoplay: settings.autoPlay, push: false });
  addEventListener("popstate", () => {
    const r = route();
    const v = r.verse ? `${r.chapter}.${r.verse}` : null;
    if (v && getVerse(v)) show(normalizeId(v), { autoplay: player.state().playing, push: false });
  });
}

function show(nextId, { autoplay, push }) {
  id = nextId;
  const verse = getVerse(id);
  const chapter = getChapter(verse.chapter);
  const tr = translation(id);
  const words = lang === "en" ? parseWordMeanings(verse.wordMeanings) : [];
  const prev = adjacent(id, -1);
  const next = adjacent(id, 1);
  if (push) history.pushState({}, "", verseHref(id));
  setTitle(verseTitle(t, { chapter: verse.chapter, verse: verse.verse, chapterName: pick(chapter.title) }));
  setAlternates((code) => verseHref(id, code));

  page.innerHTML = `
    <article class="reader">
      <div class="reader-top">
        <a class="icon-btn" href="${chapterHref(verse.chapter)}" aria-label="${esc(pick(chapter.title))}">${icon("arrow-left")}</a>
        <div class="grow">
          <h1 class="title">${esc(t("verseLabel"))} <span class="fig">${id}</span></h1>
          <a class="overline flame" href="${chapterHref(verse.chapter)}">${esc(t("chapterLabel"))} ${verse.chapter}: ${esc(pick(chapter.title))}</a>
        </div>
        <button class="icon-btn" type="button" data-act="done"></button>
        <button class="icon-btn" type="button" data-act="bookmark"></button>
        <button class="icon-btn" type="button" data-act="favorite"></button>
        <button class="icon-btn" type="button" data-act="share" aria-label="${esc(t("share"))}">${icon("export")}</button>
      </div>

      <div class="sanskrit-block">
        <p class="sanskrit" lang="sa">${esc(verse.sanskrit)}</p>
        ${verse.transliteration ? `<p class="translit">${esc(verse.transliteration)}</p>` : ""}
        <div class="om-rule" aria-hidden="true"><span>ॐ</span></div>
      </div>

      <section class="translation">
        <h2 class="overline accent">${esc(t("translation"))}</h2>
        <p class="scripture">${esc(tr?.simple ?? "")}</p>
      </section>

      ${words.length ? `<details class="words">
        <summary>${icon("book", "duotone")}<span>${esc(t("wordMeanings"))}</span>${icon("caret-down")}</summary>
        <dl class="word-list">${words.map((w) => `<div><dt>${esc(w.word)}</dt><dd>${esc(w.meaning)}</dd></div>`).join("")}</dl>
      </details>` : ""}

      ${tr && (tr.deep || tr.essence) ? `<section class="reflection">
        <h2 class="overline flame">${esc(t("reflectionAndEssence"))}</h2>
        ${tr.deep ? `<p class="deep">${esc(tr.deep)}</p>` : ""}
        ${tr.essence ? `<p class="essence">${esc(tr.essence)}</p>` : ""}
      </section>` : ""}

      <section class="verse-note">
        <h2 class="heading">${esc(t("myReflection"))}</h2>
        <div id="my-notes" class="stack-sm"></div>
        <label class="visually-hidden" for="note">${esc(t("writeReflectionPlaceholder"))}</label>
        <textarea id="note" placeholder="${esc(t("writeReflectionPlaceholder"))}"></textarea>
        <div><button class="btn sm" type="button" id="save-note" disabled>${esc(t("saveBtn"))}</button></div>
      </section>

      <nav class="verse-nav" aria-label="${esc(t("verses"))}">
        ${prev ? `<a href="${verseHref(prev)}" data-go="${prev}">${icon("caret-left")}${esc(t("verseLabel"))} ${prev}</a>` : "<span></span>"}
        ${next ? `<a href="${verseHref(next)}" data-go="${next}">${esc(t("verseLabel"))} ${next}${icon("caret-right")}</a>` : "<span></span>"}
      </nav>
    </article>`;

  recordRead(verse.chapter, verse.verse);
  markCompleted(id);
  paintActions();
  renderNotes();

  page.querySelector(".reader-top").addEventListener("click", onAction);
  page.querySelectorAll("[data-go]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      go(a.dataset.go);
    }),
  );
  const note = $("#note");
  const save = $("#save-note");
  note.addEventListener("input", () => (save.disabled = !note.value.trim()));
  save.addEventListener("click", () => {
    addNote(id, note.value.trim());
    note.value = "";
    save.disabled = true;
    renderNotes();
    toast(t("reflectionSavedToast"));
  });

  scrollTo({ top: 0 });
  player.load(id, lang, { autoplay }).then(paintPlayer);
  paintDownload();
}

function go(target) {
  const playing = player.state().playing;
  show(target, { autoplay: playing, push: true });
}

function paintActions() {
  const set = (act, on, onIcon, offIcon, onLabel, offLabel) => {
    const b = page.querySelector(`[data-act="${act}"]`);
    b.classList.toggle("on", on);
    b.innerHTML = icon(on ? onIcon : offIcon, on ? "fill" : "regular");
    b.setAttribute("aria-label", on ? onLabel : offLabel);
    b.setAttribute("aria-pressed", String(on));
  };
  set("done", isCompleted(id), "check-circle", "circle", t("verseMarkedCompleted"), t("markAsRead"));
  set("bookmark", isBookmarked(id), "bookmark-simple", "bookmark-simple", t("bookmarkSavedToast"), t("bookmarkThisVerse"));
  set("favorite", isFavorite(id), "heart", "heart", t("addedToFavoritesToast"), t("addToFavorites"));
}

function onAction(e) {
  const act = e.target.closest("[data-act]")?.dataset.act;
  if (!act) return;
  if (act === "done") toggleCompleted(id);
  if (act === "bookmark") toast(t(toggleBookmark(id) ? "bookmarkSavedToast" : "bookmarkRemovedToast"));
  if (act === "favorite") toast(t(toggleFavorite(id) ? "addedToFavoritesToast" : "removedFromFavoritesToast"));
  if (act === "share") share(tf("shareVerseMessage", { id, text: translation(id)?.simple ?? "" }));
  paintActions();
}

function renderNotes() {
  const mine = notes().filter((n) => n.verseId === id);
  $("#my-notes").innerHTML = mine.map((n) => {
    const d = new Date(n.date);
    const when = Number.isNaN(d.getTime()) ? n.date : d.toLocaleDateString(localeFor(), { day: "numeric", month: "short", year: "numeric" });
    return `<div class="panel stack-sm">
      <div style="display:flex;align-items:center;gap:8px"><span class="caption" style="flex:1">${esc(when)}</span>
      <button class="icon-btn" type="button" data-del="${n.id}" aria-label="${esc(t("delete"))}">${icon("trash")}</button></div>
      <p class="serif" style="font-size:1.05rem;white-space:pre-wrap">${esc(n.body)}</p></div>`;
  }).join("");
  $("#my-notes").querySelectorAll("[data-del]").forEach((b) =>
    b.addEventListener("click", () => {
      deleteNote(b.dataset.del);
      renderNotes();
      toast(t("deletedNoteToast"));
    }),
  );
}

/* ───────── Player ───────── */
function playerMarkup() {
  return `<section class="player" aria-label="${esc(t("recitation"))}">
    <div class="player-inner">
      <p class="notice" id="fallback" hidden>${esc(t("audioFallbackNotice"))}</p>
      <div class="seek">
        <span id="cur">0:00</span>
        <input type="range" id="seek" min="0" max="100" step="0.1" value="0" aria-label="${esc(t("playbackPosition"))}">
        <span id="dur">0:00</span>
      </div>
      <div class="controls">
        <button class="icon-btn" type="button" id="loop"></button>
        <div class="center">
          <button class="icon-btn" type="button" id="prev" aria-label="${esc(t("previousVerse"))}">${icon("skip-back", "fill")}</button>
          <button class="play-btn" type="button" id="play" aria-label="${esc(t("play"))}">${icon("play", "fill")}</button>
          <button class="icon-btn" type="button" id="next" aria-label="${esc(t("nextVerse"))}">${icon("skip-forward", "fill")}</button>
        </div>
        <div style="display:flex;align-items:center;gap:2px">
          <button class="speed" type="button" id="speed">1x</button>
          <button class="icon-btn" type="button" id="dl" ${offlineSupported ? "" : "hidden"}></button>
        </div>
      </div>
    </div>
  </section>`;
}

let dragging = false;
function wirePlayer() {
  $("#play").addEventListener("click", player.toggle);
  $("#prev").addEventListener("click", () => {
    const p = adjacent(id, -1);
    p ? go(p) : toast(t("startOfChapterToast"));
  });
  $("#next").addEventListener("click", () => {
    const n = adjacent(id, 1);
    n ? go(n) : toast(t("endOfChapterToast"));
  });
  $("#speed").addEventListener("click", player.cycleRate);
  $("#loop").addEventListener("click", player.toggleLoop);
  const seek = $("#seek");
  seek.addEventListener("input", () => {
    dragging = true;
    $("#cur").textContent = player.formatTime(Number(seek.value));
  });
  seek.addEventListener("change", () => {
    player.seek(Number(seek.value));
    dragging = false;
  });
  $("#dl")?.addEventListener("click", onDownload);
  player.onPlayer(paintPlayer);

  if ("mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("previoustrack", () => adjacent(id, -1) && go(adjacent(id, -1)));
    navigator.mediaSession.setActionHandler("nexttrack", () => adjacent(id, 1) && go(adjacent(id, 1)));
  }
  // Space plays/pauses and arrow keys move between verses, except while typing.
  addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea, select, [contenteditable]") || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === " ") {
      e.preventDefault();
      player.toggle();
    } else if (e.key === "ArrowRight" && adjacent(id, 1)) go(adjacent(id, 1));
    else if (e.key === "ArrowLeft" && adjacent(id, -1)) go(adjacent(id, -1));
  });
}

function paintPlayer(s = player.state()) {
  const play = $("#play");
  if (!play) return;
  play.innerHTML = icon(s.playing ? "pause" : "play", "fill");
  play.setAttribute("aria-label", t(s.playing ? "pause" : "play"));
  $("#prev").disabled = !adjacent(id, -1);
  $("#next").disabled = !adjacent(id, 1);
  $("#speed").textContent = `${s.rate}x`;
  $("#speed").setAttribute("aria-label", tf("playbackSpeedRate", { rate: s.rate }));
  const loop = $("#loop");
  loop.innerHTML = icon(s.loop ? "repeat-once" : "repeat", s.loop ? "fill" : "regular");
  loop.classList.toggle("on", s.loop);
  loop.setAttribute("aria-label", t(s.loop ? "repeatEnabledToast" : "repeatDisabledToast"));
  loop.setAttribute("aria-pressed", String(s.loop));
  const seek = $("#seek");
  seek.max = String(s.duration || 100);
  if (!dragging) {
    seek.value = String(s.time);
    $("#cur").textContent = player.formatTime(s.time);
  }
  $("#dur").textContent = player.formatTime(s.duration);
  $("#fallback").hidden = audioLang(lang) === lang;
}

async function paintDownload() {
  const b = $("#dl");
  if (!b || !offlineSupported) return;
  const saved = await isSaved(lang, id);
  b.innerHTML = icon(saved ? "check-circle" : "download-simple", saved ? "fill" : "regular");
  b.classList.toggle("on", saved);
  b.dataset.saved = String(saved);
  b.setAttribute("aria-label", saved ? `${t("savedOfflineLabel")}. ${t("tapToDelete")}` : t("downloadForOffline"));
}

async function onDownload() {
  const b = $("#dl");
  const verse = id;
  if (b.dataset.saved === "true") {
    if (await confirmDialog({ title: `${t("deleteVerseConfirm")} ${verse}?`, confirm: t("delete"), danger: true })) {
      await deleteVerse(lang, verse);
      toast(tf("removedVerseAudioToast", { id: verse }));
      paintDownload();
    }
    return;
  }
  b.disabled = true;
  try {
    await saveVerse(lang, verse, (f) => (b.innerHTML = `<span class="caption num">${Math.round(f * 100)}%</span>`));
    toast(t("savedOfflineToast"));
  } catch {
    toast(t("downloadFailed"), { kind: "error" });
  }
  b.disabled = false;
  paintDownload();
}
