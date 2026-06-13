export const PLACEHOLDER_IMG = "/favicon-logo.png";

export const languageOptions = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "sa", label: "संस्कृतम्" },
  { code: "bn", label: "বাংলা" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ml", label: "മലയാളം" },
  { code: "mr", label: "मराठी" },
  { code: "ne", label: "नेपाली" },
  { code: "or", label: "ଓଡ଼ିଆ" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
] as const;

export type LanguageCode = (typeof languageOptions)[number]["code"];

type ProcessedChapter = {
  id: number;
  chapter_number: number;
  title: Record<string, string>;
  summary: Record<string, string>;
  fullSummary: Record<string, string>;
  verseCount: number;
};

type ProcessedVerse = {
  id: number;
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration: string;
  translation: Record<string, { simple: string; deep: string; essence: string }>;
  audio: { male: string };
  word_meanings?: string;
};

type ProcessedQuote = {
  id: string;
  text: string;
};

type LocalizedRecord = Record<string, string>;

const processed = await import("../../../src/app/gita-processed.json");

export const chapters = (processed.default.chapters as ProcessedChapter[])
  .slice()
  .sort((a, b) => a.chapter_number - b.chapter_number);

export const verseMap = processed.default.verses as Record<string, ProcessedVerse>;

export const allVerses = Object.values(verseMap).sort((a, b) => {
  if (a.chapter !== b.chapter) return a.chapter - b.chapter;
  return a.verse - b.verse;
});

const fallbackQuotes: ProcessedQuote[] = [
  {
    id: "2-47",
    text:
      verseMap["2-47"]?.translation.en.simple ??
      "You have a right to perform your prescribed duties, but never to the fruits of your actions.",
  },
  {
    id: "18-66",
    text:
      verseMap["18-66"]?.translation.en.simple ??
      "Abandon all varieties of dharma and simply surrender unto me.",
  },
  {
    id: "4-7",
    text:
      verseMap["4-7"]?.translation.en.simple ??
      "Whenever righteousness declines, I manifest myself.",
  },
  {
    id: "6-5",
    text:
      verseMap["6-5"]?.translation.en.simple ??
      "Lift yourself by your own self; do not let the self sink down.",
  },
];

export const quotes =
  Array.isArray(processed.default.quotes) && processed.default.quotes.length > 0
    ? (processed.default.quotes as ProcessedQuote[])
    : fallbackQuotes;

export function getLanguageLabel(language: LanguageCode) {
  return languageOptions.find((option) => option.code === language)?.label ?? "English";
}

export function getLocalizedValue(record: LocalizedRecord | undefined, language: LanguageCode) {
  if (!record) return "";
  return record[language] ?? record.en ?? Object.values(record)[0] ?? "";
}

export function getChapterTitle(chapterNumber: number, language: LanguageCode) {
  const chapter = chapters.find((item) => item.chapter_number === chapterNumber);
  return getLocalizedValue(chapter?.title, language);
}

export function getChapterSummary(chapterNumber: number, language: LanguageCode) {
  const chapter = chapters.find((item) => item.chapter_number === chapterNumber);
  if (!chapter?.summary) return "";
  return (
    chapter.summary[language] ??
    (language === "en" ? chapter.summary.en : chapter.summary.hi) ??
    chapter.summary.en ??
    ""
  );
}

export function getChapterFullSummary(chapterNumber: number, language: LanguageCode) {
  const chapter = chapters.find((item) => item.chapter_number === chapterNumber);
  if (!chapter?.fullSummary) return "";
  return (
    chapter.fullSummary[language] ??
    (language === "en" ? chapter.fullSummary.en : chapter.fullSummary.hi) ??
    chapter.fullSummary.en ??
    ""
  );
}

export function getVerseTranslation(verse: ProcessedVerse | null, language: LanguageCode) {
  return verse ? (verse.translation[language] ?? verse.translation.en) : null;
}

export const wisdomCards = [
  {
    theme: "Detachment",
    line: "Perform every action as an offering, free from the grip of its result.",
  },
  {
    theme: "Self-Discipline",
    line: "The mind, when conquered, becomes the truest friend of the soul.",
  },
  {
    theme: "Dharma",
    line: "Better one's own duty performed imperfectly than another's done well.",
  },
  { theme: "Inner Peace", line: "He who is unmoved by joy or sorrow attains the eternal abode." },
  {
    theme: "Devotion",
    line: "Offer a leaf, a flower, a fruit, or water with love — and I receive it.",
  },
  {
    theme: "Purpose",
    line: "Established in yoga, perform your work — for yoga is skill in action.",
  },
] as const;

export const articles = [
  {
    title: "Applying Karma Yoga at Work",
    excerpt:
      "How acting without attachment transforms ordinary tasks into a daily spiritual practice.",
    tag: "Work & Life",
  },
  {
    title: "What Krishna Teaches About Anxiety",
    excerpt: "Three timeless verses that quietly address the restless modern mind.",
    tag: "Mindfulness",
  },
  {
    title: "Dharma in Modern Life",
    excerpt: "Discovering your duty when roles, identities, and expectations keep shifting.",
    tag: "Philosophy",
  },
  {
    title: "Understanding Detachment",
    excerpt: "Detachment is not indifference - it is loving without grasping.",
    tag: "Reflection",
  },
] as const;

export function getChapterVerses(chapterNumber: number) {
  return allVerses.filter((verse) => verse.chapter === chapterNumber);
}

export function getVerse(chapterNumber: number, verseNumber: number) {
  return verseMap[`${chapterNumber}-${verseNumber}`] ?? null;
}

export function getVerseAudioUrl(
  chapterNumber: number,
  verseNumber: number,
  language: LanguageCode,
) {
  const fallbackLanguage = language === "en" ? "en" : language;
  return `https://gita.saiakash.dev/${fallbackLanguage}/complete/${chapterNumber}_${verseNumber}.wav`;
}

export function getChapterThumbnail(chapterNumber: number) {
  return `/assets/images/chapter_${chapterNumber}.png`;
}

export function formatVerseRef(chapterNumber: number, verseNumber: number) {
  return `${chapterNumber}.${verseNumber}`;
}
