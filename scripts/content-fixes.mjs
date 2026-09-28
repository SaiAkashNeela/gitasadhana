// Corrections applied on top of the original content while building src/data.
// The source files in capacitor-app/ are left untouched.
import { BLOCKS, foreignChars } from "./audit-scripts.mjs";

const INDIC_START = 0x0900;
const INDIC_END = 0x0dff;
const SHARED = new Set([0x0964, 0x0965]);

// Places where a letter has no counterpart at the same offset in the target script.
const SPECIAL = {
  bn: { "व": "ব", "ಯ": "য়" },
};

/**
 * Indic scripts share one layout (ISCII), so a stray letter from another script maps
 * to the same position in the language's own block: "कर्म যোগ" → "কর্ম যোগ".
 */
export function toScript(text, lang) {
  const base = BLOCKS[lang];
  if (base === undefined) return text;
  let out = "";
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (cp < INDIC_START || cp > INDIC_END || SHARED.has(cp) || (cp >= base && cp < base + 0x80)) {
      out += ch;
      continue;
    }
    const special = SPECIAL[lang]?.[ch];
    if (special) {
      out += special;
      continue;
    }
    out += String.fromCodePoint(base + ((cp - INDIC_START) % 0x80));
  }
  return out;
}

/** Text written in the wrong language (not just the wrong letters) — translated properly. */
export const chapterOverrides = {
  10: {
    fullSummary: {
      mr: "संपूर्ण सृष्टीत प्रकट होणाऱ्या भगवंताच्या दिव्य विभूती आणि त्यांच्या अनंत शक्तींचे वर्णन या अध्यायात केले आहे.",
      ne: "सम्पूर्ण सृष्टिमा प्रकट हुने भगवान्का दिव्य विभूतिहरू र उहाँका अनन्त शक्तिहरूको वर्णन यस अध्यायमा गरिएको छ।",
    },
  },
  13: { title: { kn: "ಕ್ಷೇತ್ರಕ್ಷೇತ್ರಜ್ಞವಿಭಾಗ ಯೋಗ" } },
  14: { title: { kn: "ಗುಣತ್ರಯವಿಭಾಗ ಯೋಗ" } },
  15: {
    title: { kn: "ಪುರುಷೋತ್ತಮ ಯೋಗ" },
    summary: { mr: "परम पुरुषाचा योग", ne: "परम पुरुषको योग" },
    fullSummary: {
      mr: "संसाररूपी वृक्षाचे स्वरूप, क्षर आणि अक्षर पुरुष यांतील भेद आणि पुरुषोत्तम तत्त्व यांचे वर्णन या अध्यायात केले आहे.",
    },
  },
  16: { title: { kn: "ದೈವಾಸುರಸಂಪದ್ವಿಭಾಗ ಯೋಗ" }, summary: { kn: "ದೈವೀ ಮತ್ತು ಆಸುರೀ ಸ್ವಭಾವಗಳು" } },
  17: { title: { kn: "ಶ್ರದ್ಧಾತ್ರಯವಿಭಾಗ ಯೋಗ" }, summary: { gu: "શ્રદ્ધાના ત્રણ પ્રકાર" } },
  18: { title: { kn: "ಮೋಕ್ಷಸಂನ್ಯಾಸ ಯೋಗ" } },
};

// Verses that intentionally quote Sanskrit in Devanagari (e.g. "(ॐ तत् सत्)").
const KEEP_AS_IS = new Set(["pa:7.8", "pa:17.23"]);

// English words left untranslated inside Indian-language text: "lang:where" → [from, to].
const WORD_FIXES = {
  "bn:4.9": [["truly", "যথার্থভাবে"]],
  "ne:chapter-14": [["three", "तीन"]],
};
const fixWords = (text, key) => (WORD_FIXES[key] ?? []).reduce((out, [from, to]) => out.replace(new RegExp(`\\b${from}\\b`, "g"), to), text);

export function fixVerseText(text, lang, verseId) {
  if (!text) return text;
  text = fixWords(text, `${lang}:${verseId}`);
  if (KEEP_AS_IS.has(`${lang}:${verseId}`) || foreignChars(text, lang).length === 0) return text;
  return toScript(text, lang);
}

export function fixChapter(chapter) {
  const out = { ...chapter };
  for (const field of ["title", "summary", "fullSummary"]) {
    const map = { ...chapter[field] };
    for (const [lang, value] of Object.entries(map)) {
      const fixed = fixWords(value, `${lang}:chapter-${chapter.number}`);
      map[lang] = foreignChars(fixed, lang).length ? toScript(fixed, lang) : fixed;
    }
    Object.assign(map, chapterOverrides[chapter.number]?.[field]);
    out[field] = map;
  }
  return out;
}
