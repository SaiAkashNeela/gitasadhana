import { localeFor, t } from "../i18n.js";
import { localDate, profile, readDates } from "../progress.js";
import { boot, esc, icon, setTitle } from "../ui.js";

await boot("journey");
setTitle(t("yourJourney"));

const p = profile();
const read = new Set(readDates());
const loc = localeFor();
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
let mode = "week";
let weekOffset = 0;
let month = new Date();
let range = { start: localDate(addDays(new Date(), -6)), end: localDate(new Date()) };

const page = document.getElementById("page");
page.innerHTML = `
  <div class="page-head"><div><h1 class="display">${esc(t("yourJourney"))}</h1></div></div>
  <div class="journey-grid">
    <div class="stack">
      <div class="streak-hero">${icon("flame", "fill")}<b>${p.streak}</b><span class="overline flame">${esc(t("streak"))}</span></div>
      <div class="stats">
        <div class="stat"><b>${p.versesRead}</b><span>${esc(t("verses"))}</span></div>
        <div class="stat"><b>${p.minutes}m</b><span>${esc(t("readTime"))}</span></div>
        <div class="stat"><b>${p.bookmarks}</b><span>${esc(t("saved"))}</span></div>
      </div>
    </div>
    <div class="stack">
      <div class="segmented" role="tablist">
        ${["week", "month", "custom"].map((m) => `<button role="tab" type="button" data-mode="${m}">${esc(t(m))}</button>`).join("")}
      </div>
      <div class="panel stack" id="cal"></div>
    </div>
  </div>`;

const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2026, 2, 1 + i).toLocaleDateString(loc, { weekday: "narrow" }));

function period(label, prevDisabled, nextDisabled, badge) {
  return `<div class="period">
    <button class="icon-btn" type="button" data-nav="-1" aria-label="${esc(t("previousPeriod"))}" ${prevDisabled ? "disabled" : ""}>${icon("caret-left")}</button>
    <span class="grow">${esc(label)}</span>
    <button class="icon-btn" type="button" data-nav="1" aria-label="${esc(t("nextPeriod"))}" ${nextDisabled ? "disabled" : ""}>${icon("caret-right")}</button>
    <span class="pill">${esc(badge)}</span>
  </div>`;
}

function dayCell(d, { selectable = false } = {}) {
  const key = localDate(d);
  const future = d > new Date();
  const inRange = mode === "custom" && range.start && range.end && key >= range.start && key <= range.end;
  const edge = mode === "custom" && (key === range.start || key === range.end);
  const cls = ["day", read.has(key) && !edge ? "read" : "", future ? "future" : "", inRange ? "in-range" : "", edge ? "edge" : ""].join(" ");
  const labelText = d.toLocaleDateString(loc, { dateStyle: "full" });
  return selectable && !future
    ? `<button type="button" class="${cls}" data-day="${key}" aria-label="${esc(labelText)}">${d.getDate()}</button>`
    : `<span class="${cls}" aria-label="${esc(labelText)}">${d.getDate()}</span>`;
}

function monthGrid(selectable) {
  const y = month.getFullYear();
  const m = month.getMonth();
  const first = new Date(y, m, 1).getDay();
  const total = new Date(y, m + 1, 0).getDate();
  return `<div class="calendar">${weekdays.map((w) => `<span class="dow">${esc(w)}</span>`).join("")}
    ${"<span></span>".repeat(first)}${Array.from({ length: total }, (_, i) => dayCell(new Date(y, m, i + 1), { selectable })).join("")}</div>`;
}

function render() {
  page.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.mode === mode)));
  const cal = document.getElementById("cal");
  const now = new Date();
  if (mode === "week") {
    const end = addDays(now, -weekOffset);
    const days = Array.from({ length: 7 }, (_, i) => addDays(end, i - 6));
    const active = days.filter((d) => read.has(localDate(d))).length;
    const label = `${days[0].toLocaleDateString(loc, { month: "short", day: "numeric" })} - ${end.toLocaleDateString(loc, { month: "short", day: "numeric" })}`;
    cal.innerHTML = period(label, false, weekOffset === 0, `${active} / 7 ${t("dayActive")}`) +
      `<div class="calendar">${days.map((d) => `<span class="dow">${esc(d.toLocaleDateString(loc, { weekday: "narrow" }))}</span>`).join("")}${days.map((d) => dayCell(d)).join("")}</div>`;
  } else {
    const isCurrent = month.getFullYear() === now.getFullYear() && month.getMonth() >= now.getMonth();
    const prefix = localDate(month).slice(0, 7);
    let badge;
    if (mode === "month") badge = `${readDates().filter((k) => k.startsWith(prefix)).length} ${t("sessions")}`;
    else {
      let n = 0;
      if (range.start && range.end) for (const k of read) if (k >= range.start && k <= range.end) n++;
      badge = `${n} ${t("dayActive")}`;
    }
    cal.innerHTML = period(month.toLocaleDateString(loc, { month: "long", year: "numeric" }), false, isCurrent, badge) + monthGrid(mode === "custom") +
      (mode === "custom" ? `<p class="caption" style="text-align:center">${range.start && range.end ? esc(`${new Date(`${range.start}T00:00`).toLocaleDateString(loc)} - ${new Date(`${range.end}T00:00`).toLocaleDateString(loc)}`) : esc(t("customRangeHint"))}</p>` : "");
  }
}

page.addEventListener("click", (e) => {
  const m = e.target.closest("[data-mode]");
  if (m) (mode = m.dataset.mode), render();
  const nav = e.target.closest("[data-nav]");
  if (nav) {
    const step = Number(nav.dataset.nav);
    if (mode === "week") weekOffset = Math.max(0, weekOffset - step * 7);
    else month = new Date(month.getFullYear(), month.getMonth() + step, 1);
    render();
  }
  const day = e.target.closest("[data-day]");
  if (day) {
    const key = day.dataset.day;
    if (!range.start || range.end) range = { start: key, end: null };
    else range = key < range.start ? { start: key, end: range.start } : { start: range.start, end: key };
    render();
  }
});
render();
