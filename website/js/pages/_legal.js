import { lang, t } from "../i18n.js";
import { boot, esc, setTitle } from "../ui.js";

export async function legalPage(kind) {
  await boot("settings");
  const data = await fetch("data/legal.json").then((r) => r.json());
  const text = data[lang] ?? data.en;
  const title = t(kind === "privacy" ? "privacyPolicyTitle" : "termsTitle");
  setTitle(title);
  document.getElementById("page").innerHTML = `
    <div class="page-head"><div><h1 class="display">${esc(title)}</h1>
      <p class="caption">${esc(t(kind === "privacy" ? "privacyLastUpdated" : "termsLastUpdated"))}</p>
      ${lang !== "en" && data[lang] ? `<p class="caption">${esc(text.note)}</p>` : ""}</div></div>
    <div class="legal">${text[kind].map((s) => `<section><h2 class="heading">${esc(s.title)}</h2><p>${esc(s.body)}</p></section>`).join("")}</div>`;
}
