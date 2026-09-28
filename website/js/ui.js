// Page shell and shared UI helpers.
import { CREDIT, SITE_URL } from "./config.js";
import { CODES, LANGUAGES, lang, loadStrings, pageLanguage, setLanguage, t } from "./i18n.js";
import { fullTitle } from "./titles.js";
import { chaptersHref, homeHref, wisdomHref } from "./route.js";
import { settings } from "./progress.js";
import { store } from "./store.js";

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** Phosphor icon. weight: regular | fill | duotone. */
export const icon = (name, weight = "regular") =>
  `<i class="${weight === "regular" ? "ph" : `ph-${weight}`} ph-${name}" aria-hidden="true"></i>`;

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ───────── Theme ───────── */
const media = matchMedia("(prefers-color-scheme: dark)");
export function applyTheme(pref = settings.theme) {
  const dark = pref === "dark" || (pref === "system" && media.matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0f121b" : "#f4f1ea");
}
media.addEventListener("change", () => applyTheme());
export const isDark = () => document.documentElement.dataset.theme === "dark";

export function applyFontSize(size = settings.fontSize) {
  document.documentElement.style.setProperty("--reading", `${size + 2}px`);
}

/* ───────── Shell ───────── */
const NAV = [
  { id: "home", href: homeHref(), icon: "house", label: "home" },
  { id: "chapters", href: chaptersHref(), icon: "book-open-text", label: "chapters" },
  { id: "wisdom", href: wisdomHref(), icon: "flower-lotus", label: "wisdom" },
  { id: "saved", href: "saved.html", icon: "bookmark-simple", label: "saved" },
  { id: "journey", href: "journey.html", icon: "flame", label: "yourJourney" },
  { id: "ai", href: "ai/", icon: "chat-teardrop-text", label: "Gita AI", raw: true },
];
const NAV_MORE = [
  { id: "search", href: "search.html", icon: "magnifying-glass", label: "searchTitle" },
  { id: "notes", href: "notes.html", icon: "note-pencil", label: "notesAndReflections" },
  { id: "history", href: "history.html", icon: "clock-counter-clockwise", label: "readingHistory" },
  { id: "offline", href: "offline.html", icon: "download-simple", label: "offlineLibrary" },
  { id: "settings", href: "settings.html", icon: "gear-six", label: "settingsNav" },
];
const TABS = [
  { id: "home", href: homeHref(), icon: "house", label: "home" },
  { id: "chapters", href: chaptersHref(), icon: "book-open-text", label: "chapters" },
  { id: "wisdom", href: wisdomHref(), icon: "flower-lotus", label: "wisdom" },
  { id: "saved", href: "saved.html", icon: "bookmark-simple", label: "saved" },
  { id: "settings", href: "settings.html", icon: "user-circle", label: "profile" },
];

const label = (n) => (n.raw ? n.label : t(n.label));

function navLink(n, active, cls = "nav-item") {
  const on = n.id === active;
  return `<a class="${cls}" href="${n.href}" ${on ? 'aria-current="page"' : ""}>${icon(n.icon, on ? "fill" : "regular")}<span>${esc(label(n))}</span></a>`;
}

function renderShell(active) {
  const nativeName = LANGUAGES.find((l) => l.code === lang)?.native ?? "English";
  const sidebar = `
    <nav class="sidebar" aria-label="${esc(t("mainNavigation"))}">
      <a class="brand" href="${homeHref()}"><img src="assets/icons/emblem.png" alt="" width="40" height="40"><span>Gita Sadhana</span></a>
      ${NAV.map((n) => navLink(n, active)).join("")}
      <div class="nav-sep"></div>
      ${NAV_MORE.map((n) => navLink(n, active, "nav-item secondary")).join("")}
      <div class="sidebar-foot">
        <button class="btn secondary sm" type="button" data-lang-menu>${icon("translate")}<span>${esc(nativeName)}</span></button>
      </div>
    </nav>`;
  const topbar = `
    <header class="topbar">
      <a class="brand" href="${homeHref()}"><img src="assets/icons/emblem.png" alt="" width="32" height="32"><span>Gita Sadhana</span></a>
      <a class="icon-btn" href="search.html" aria-label="${esc(t("searchTitle"))}">${icon("magnifying-glass")}</a>
      <a class="icon-btn" href="ai/" aria-label="Gita AI">${icon("chat-teardrop-text")}</a>
      <button class="icon-btn" type="button" data-lang-menu aria-label="${esc(t("language"))}">${icon("translate")}</button>
    </header>`;
  const tabbar = `<nav class="tabbar" aria-label="${esc(t("mainNavigation"))}">${TABS.map((n) => {
    const on = n.id === active || (n.id === "settings" && ["notes", "history", "offline", "journey", "settings"].includes(active));
    return `<a href="${n.href}" ${on ? 'aria-current="page"' : ""}>${icon(n.icon, on ? "fill" : "regular")}<span>${esc(label(n))}</span></a>`;
  }).join("")}</nav>`;
  const footer = `
    <footer class="site-foot">
      <span>Gita Sadhana</span>
      <a href="contact/">${esc(t("contactUsTitle"))}</a>
      <a href="correction.html">${esc(t("verseLanguageCorrectionTitle"))}</a>
      <a href="privacy/">${esc(t("privacyPolicyTitle"))}</a>
      <a href="terms/">${esc(t("termsTitle"))}</a>
      <span class="credit">${creditLine()}</span>
    </footer>`;

  // Pages set <base href="/">, so an in-page link needs the full path.
  const here = `${location.pathname}${location.search}`;
  document.body.insertAdjacentHTML("afterbegin", `<a class="skip-link" href="${here}#main">${esc(t("skipToContent"))}</a>${sidebar}${topbar}`);
  document.body.insertAdjacentHTML("beforeend", `${tabbar}<div class="toasts" role="status" aria-live="polite"></div>`);
  $$(".site-foot").forEach((f) => f.remove()); // the pre-rendered footer, if any
  $("main").insertAdjacentHTML("beforeend", footer);
  $$("[data-lang-menu]").forEach((b) => b.addEventListener("click", () => openLanguageMenu(b)));
}

/** Common start-up for every page. Returns once strings are loaded and the shell is drawn. */
export async function boot(active) {
  applyTheme();
  applyFontSize();
  await loadStrings();
  renderShell(active);
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

/** The page language's own name on pages whose URL carries a language (none for English). */
export function nativeTag() {
  return lang !== "en" && pageLanguage() ? LANGUAGES.find((l) => l.code === lang)?.native : undefined;
}

export function setTitle(title) {
  document.title = title ? fullTitle(title, nativeTag()) : "Gita Sadhana";
}

/** The owner credit shown in every footer. */
export function creditLine() {
  const name = `<a href="${CREDIT.url}" rel="author">${esc(CREDIT.name)}</a>`;
  const [before, after = ""] = t("madeBy").split("{name}");
  return `${esc(before)}${name}${esc(after)} · <a href="${CREDIT.github}" rel="noopener">GitHub</a>`;
}

/**
 * Keeps the canonical URL and hreflang alternates in step when a page changes what it shows
 * without a reload (the verse reader moving to the next verse). pathFor(code) gives the page's
 * path in that language.
 */
export function setAlternates(pathFor) {
  const head = document.head;
  const put = (selector, attrs) => {
    let el = head.querySelector(selector);
    if (!el) {
      el = document.createElement("link");
      head.appendChild(el);
    }
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  };
  const abs = (path) => new URL(path, `${SITE_URL}/`).href;
  put('link[rel="canonical"]', { rel: "canonical", href: abs(pathFor(lang)) });
  CODES.forEach((code) => put(`link[rel="alternate"][hreflang="${code}"]`, { rel: "alternate", hreflang: code, href: abs(pathFor(code)) }));
  put('link[rel="alternate"][hreflang="x-default"]', { rel: "alternate", hreflang: "x-default", href: abs(pathFor("en")) });
  const og = head.querySelector('meta[property="og:url"]');
  if (og) og.content = abs(pathFor(lang));
}

/* ───────── Language menu ───────── */
function openLanguageMenu(anchor) {
  closeMenus();
  const menu = document.createElement("div");
  menu.className = "menu";
  menu.setAttribute("role", "menu");
  menu.innerHTML = LANGUAGES.map((l) =>
    `<button type="button" role="menuitemradio" aria-checked="${l.code === lang}" data-code="${l.code}"><span>${esc(l.native)}</span><span class="faint small">${esc(l.name)}</span></button>`).join("");
  document.body.appendChild(menu);
  const r = anchor.getBoundingClientRect();
  const top = r.bottom + 8 + menu.offsetHeight > innerHeight ? Math.max(8, r.top - menu.offsetHeight - 8) : r.bottom + 8;
  menu.style.top = `${top + scrollY}px`;
  menu.style.left = `${Math.min(r.left, innerWidth - menu.offsetWidth - 8) + scrollX}px`;
  menu.addEventListener("click", (e) => {
    const code = e.target.closest("button")?.dataset.code;
    if (code) setLanguage(code);
  });
  menu.querySelector('[aria-checked="true"]')?.focus();
  setTimeout(() => addEventListener("click", closeMenus, { once: true }));
  addEventListener("keydown", (e) => e.key === "Escape" && closeMenus(), { once: true });
}
const closeMenus = () => $$(".menu").forEach((m) => m.remove());

/* ───────── Toasts & dialogs ───────── */
export function toast(message, { kind = "info", action, duration } = {}) {
  const host = $(".toasts");
  if (!host) return;
  const el = document.createElement("div");
  el.className = `toast ${kind}`;
  el.innerHTML = `${kind !== "info" ? '<span class="dot"></span>' : ""}<span>${esc(message)}</span>${action ? `<button type="button">${esc(action.label)}</button>` : ""}`;
  if (action) el.querySelector("button").addEventListener("click", () => (action.onClick(), el.remove()));
  host.appendChild(el);
  setTimeout(() => el.remove(), duration ?? (action ? 6000 : 2600));
}

export function confirmDialog({ title, message = "", confirm, cancel = t("cancel"), danger = false }) {
  return new Promise((resolve) => {
    const d = document.createElement("dialog");
    d.innerHTML = `<form method="dialog" class="dlg">
      <h2 class="heading">${esc(title)}</h2>
      ${message ? `<p class="soft">${esc(message)}</p>` : ""}
      <div class="dlg-actions">
        <button class="btn secondary sm" value="cancel">${esc(cancel)}</button>
        <button class="btn sm ${danger ? "danger" : ""}" value="ok">${esc(confirm)}</button>
      </div></form>`;
    document.body.appendChild(d);
    d.addEventListener("close", () => {
      resolve(d.returnValue === "ok");
      d.remove();
    });
    d.showModal();
  });
}

export function emptyState(glyph, title, body = "", action = "") {
  return `<div class="empty"><div class="glyph">${icon(glyph, "duotone")}</div><h2 class="heading">${esc(title)}</h2>${body ? `<p class="soft">${esc(body)}</p>` : ""}${action}</div>`;
}

export async function share(text, url = location.href) {
  try {
    if (navigator.share) {
      await navigator.share({ text, url });
      return;
    }
    await navigator.clipboard.writeText(`${text}\n${url}`);
    toast(t("copiedToClipboard"));
  } catch {
    // Dismissed share sheets reject; nothing to report.
  }
}

export const params = new URLSearchParams(location.search);
export { store };
