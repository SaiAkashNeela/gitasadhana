// Gita AI answers sometimes arrive with light Markdown (### headings, **bold**, "* " bullets,
// "> " quotes). Same rules as the app's src/lib/rich-text.ts; returns safe HTML.
import { esc } from "./ui.js";

function inline(line) {
  return line
    .split(/(\*\*[^*]+\*\*|__[^_]+__)/)
    .filter(Boolean)
    .map((part) => {
      const bold = /^(\*\*|__).+(\*\*|__)$/.test(part);
      const text = (bold ? part.slice(2, -2) : part).replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1$2").replace(/`([^`]+)`/g, "$1");
      return bold ? `<b>${esc(text)}</b>` : esc(text);
    })
    .join("");
}

export function richText(input) {
  const out = [];
  let paragraph = [];
  const flush = () => {
    if (paragraph.length) out.push(`<p>${inline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  for (const raw of String(input ?? "").replace(/\r/g, "").split("\n")) {
    const line = raw.trim();
    if (!line || /^(-{3,}|\*{3,}|_{3,})$/.test(line)) { flush(); continue; }
    const heading = /^#{1,6}\s+(.*)$/.exec(line);
    const bullet = /^[-*•+]\s+(.*)$/.exec(line);
    const quote = /^>\s?(.*)$/.exec(line);
    if (heading) { flush(); out.push(`<p class="rt-h">${inline(heading[1].replace(/\*\*|__/g, ""))}</p>`); }
    else if (quote) { flush(); if (quote[1]) out.push(`<p class="rt-q">${inline(quote[1])}</p>`); }
    else if (bullet) { flush(); out.push(`<p class="rt-li">${inline(bullet[1])}</p>`); }
    else if (/^\d+[.)]\s+/.test(line)) { flush(); out.push(`<p>${inline(line)}</p>`); }
    else paragraph.push(line);
  }
  flush();
  return out.join("");
}
