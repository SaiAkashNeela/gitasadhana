import { api } from "../api.js";
import { currentUser } from "../auth.js";
import { getChapters, loadGita } from "../gita.js";
import { LANGUAGES, pick, t } from "../i18n.js";
import { boot, esc, icon, setTitle, toast } from "../ui.js";

await boot("settings");
setTitle(t("verseLanguageCorrectionTitle"));
await loadGita({ translations: false });

// The same ten languages the original correction form offered.
const CODES = ["en", "hi", "kn", "te", "ta", "ml", "mr", "gu", "bn", "pa"];
const chapters = getChapters();

document.getElementById("page").innerHTML = `
  <div class="page-head"><div><h1 class="display">${esc(t("verseLanguageCorrectionTitle"))}</h1><p class="soft">${esc(t("correctionHelpText"))}</p></div></div>
  <form class="form" id="form" novalidate>
    <div class="field">
      <label for="lang">${esc(t("languageLabel"))}</label>
      <select id="lang" required><option value="">${esc(t("languageLabel"))}</option>
        ${CODES.map((c) => { const l = LANGUAGES.find((x) => x.code === c); return `<option value="${c}">${esc(l.native === l.name ? l.name : `${l.native} (${l.name})`)}</option>`; }).join("")}
      </select>
    </div>
    <div class="field">
      <label for="chapter">${esc(t("chapterLabel"))}</label>
      <select id="chapter" required><option value="">${esc(t("chapterLabel"))}</option>
        ${chapters.map((c) => `<option value="${c.number}">${esc(t("chapterLabel"))} ${c.number}: ${esc(pick(c.title))}</option>`).join("")}
      </select>
    </div>
    <div class="field">
      <label for="verse">${esc(t("verseLabel"))}</label>
      <select id="verse" required disabled><option value="">${esc(t("verseLabel"))}</option></select>
    </div>
    <div class="field">
      <label for="message">${esc(t("describeIssueLabel"))}</label>
      <textarea id="message" required placeholder="${esc(t("correctionHelpText"))}"></textarea>
    </div>
    <p class="form-error" id="error" role="alert" hidden></p>
    <div><button class="btn" type="submit" id="submit">${icon("paper-plane-right")}${esc(t("submitCorrectionBtn"))}</button></div>
  </form>`;

const form = document.getElementById("form");
form.chapter.addEventListener("change", () => {
  const c = chapters.find((x) => x.number === Number(form.chapter.value));
  form.verse.disabled = !c;
  form.verse.innerHTML = `<option value="">${esc(t("verseLabel"))}</option>` + (c ? Array.from({ length: c.verseCount }, (_, i) => `<option value="${i + 1}">${esc(t("verseLabel"))} ${i + 1}</option>`).join("") : "");
});
const q = new URLSearchParams(location.search).get("v");
if (q) {
  const [c, v] = q.split(".");
  form.chapter.value = c;
  form.chapter.dispatchEvent(new Event("change"));
  form.verse.value = v;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const err = document.getElementById("error");
  const body = { language: form.lang.value, chapter: form.chapter.value, verse: form.verse.value, message: form.message.value.trim() };
  if (!body.language || !body.chapter || !body.verse || !body.message) {
    err.hidden = false;
    err.textContent = t("allFieldsRequired");
    return;
  }
  err.hidden = true;
  if (currentUser()?.email) body.email = currentUser().email;
  const btn = document.getElementById("submit");
  btn.disabled = true;
  btn.textContent = t("submitting");
  try {
    await api("/mail/correction", { method: "POST", body, token: null });
    toast(t("correctionSubmittedToast"));
    form.reset();
    form.verse.disabled = true;
  } catch {
    err.hidden = false;
    err.textContent = t("sendFailed");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `${icon("paper-plane-right")}${esc(t("submitCorrectionBtn"))}`;
  }
});
