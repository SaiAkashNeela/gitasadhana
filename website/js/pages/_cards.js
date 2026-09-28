// Shared list renderers.
import { verseHref } from "../route.js";
import { translation } from "../gita.js";
import { t } from "../i18n.js";
import { esc } from "../ui.js";

export function verseCard(v, corner = "") {
  const first = v.sanskrit.split("\n")[0];
  return `<article class="verse-card">
    <a href="${verseHref(v.id)}" class="stack-sm">
      <span class="overline flame">${esc(t("verseLabel"))} ${v.id}</span>
      <span class="first" lang="sa">${esc(first)}</span>
      <span class="tr">${esc(translation(v.id)?.simple ?? "")}</span>
    </a>
    ${corner ? `<span class="corner">${corner}</span>` : ""}
  </article>`;
}
