import { useQuery } from "@tanstack/react-query";
import gitaProcessedData from "@/app/gita-processed.json";
import rawVerses from "@/app/verses.json";

// Types matching gita-processed structure
export interface Chapter {
  id: number;
  chapter_number: number;
  title: Record<string, string>;
  summary: Record<string, string>;
  fullSummary: Record<string, string>;
  verseCount: number;
}

export interface Verse {
  id: string;
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration: string;
  translation: Record<
    string,
    {
      simple: string;
      deep: string;
      essence: string;
    }
  >;
  audio: {
    male: string;
  };
  word_meanings?: string;
}

export interface Quote {
  id: string;
  text: string;
}

// 1. Fetch all chapters locally
export function useChapters() {
  return useQuery<Chapter[]>({
    queryKey: ["chapters"],
    queryFn: async () => {
      return (gitaProcessedData as any).chapters || [];
    },
    staleTime: Infinity,
  });
}

// 2. Fetch all verses in a chapter locally
export function useVersesInChapter(chapterId: number) {
  return useQuery<Verse[]>({
    queryKey: ["verses", "chapter", chapterId],
    queryFn: async () => {
      const allVersesMap = (gitaProcessedData as any).verses || {};
      const chapterVerses = Object.values(allVersesMap)
        .filter((v: any) => v.chapter === chapterId)
        .sort((a: any, b: any) => a.verse - b.verse) as Verse[];

      // Integrate word meanings from raw verses
      return chapterVerses.map((v) => {
        const rawV = (rawVerses as any[]).find(
          (rv) => rv.chapter_number === v.chapter && rv.verse_number === v.verse,
        );
        return {
          ...v,
          word_meanings: rawV?.word_meanings || "",
        };
      });
    },
    staleTime: Infinity,
  });
}

// 3. Fetch details for a specific verse locally
export function useVerseDetail(chapterId: number, verseNumber: number) {
  const docId = `${chapterId}_${verseNumber}`;
  return useQuery<Verse>({
    queryKey: ["verse", docId],
    queryFn: async () => {
      const allVersesMap = (gitaProcessedData as any).verses || {};
      const key = `${chapterId}-${verseNumber}`;
      if (allVersesMap[key]) {
        const v = allVersesMap[key];
        const rawV = (rawVerses as any[]).find(
          (rv) => rv.chapter_number === chapterId && rv.verse_number === verseNumber,
        );
        return {
          id: v.id,
          chapter: v.chapter,
          verse: v.verse,
          sanskrit: v.sanskrit,
          transliteration: v.transliteration,
          translation: v.translation || {},
          audio: v.audio || {},
          word_meanings: rawV?.word_meanings || "",
        } as Verse;
      }
      throw new Error(`Verse ${chapterId}.${verseNumber} not found in local JSON`);
    },
    staleTime: Infinity,
  });
}

// 4. Fetch quotes for a specific language locally
export function useQuotes(language: string) {
  return useQuery<Quote[]>({
    queryKey: ["quotes", language],
    queryFn: async () => {
      const quotesMap = (gitaProcessedData as any).quotes || {};
      const rawQuotes = quotesMap[language] || quotesMap["en"] || [];
      return rawQuotes.map((q: any) => {
        const textStr = typeof q.text === "string" 
          ? q.text 
          : (q.text?.quote || q.text?.text || "");
        return {
          id: q.id,
          text: textStr
        };
      });
    },
    staleTime: Infinity,
  });
}
