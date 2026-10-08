// Gita AI answers sometimes arrive with light Markdown (### headings, **bold**, "* " bullets, "> " quotes).
// This turns them into plain blocks the reply bubble can style, so no stray symbols show.

export type Span = { text: string; bold: boolean };
export type Block = { kind: "heading" | "bullet" | "quote" | "paragraph"; spans: Span[] };

function spans(line: string): Span[] {
  const out: Span[] = [];
  line.split(/(\*\*[^*]+\*\*|__[^_]+__)/).forEach((part) => {
    if (!part) return;
    const bold = /^(\*\*|__).+(\*\*|__)$/.test(part);
    // Single *emphasis* and `code` marks are dropped rather than styled.
    const text = (bold ? part.slice(2, -2) : part).replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1$2").replace(/`([^`]+)`/g, "$1");
    if (text) out.push({ text, bold });
  });
  return out;
}

export function parseRichText(input: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length) blocks.push({ kind: "paragraph", spans: spans(paragraph.join(" ")) });
    paragraph = [];
  };
  for (const raw of input.replace(/\r/g, "").split("\n")) {
    const line = raw.trim();
    if (!line || /^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      flush();
      continue;
    }
    const heading = /^#{1,6}\s+(.*)$/.exec(line);
    const bullet = /^[-*•+]\s+(.*)$/.exec(line);
    const quote = /^>\s?(.*)$/.exec(line);
    if (heading) {
      flush();
      blocks.push({ kind: "heading", spans: spans(heading[1]).map((s) => ({ ...s, bold: true })) });
    } else if (quote) {
      flush();
      if (quote[1]) blocks.push({ kind: "quote", spans: spans(quote[1]) });
    } else if (bullet) {
      flush();
      blocks.push({ kind: "bullet", spans: spans(bullet[1]) });
    } else if (/^\d+[.)]\s+/.test(line)) {
      // Keep numbered items numbered, each on its own line.
      flush();
      blocks.push({ kind: "paragraph", spans: spans(line) });
    } else {
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}
