import { useMemo, type Dispatch, type SetStateAction } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { AudioBar, Card, PageFrame, SectionHeading } from "../components/site-shell";
import {
  PLACEHOLDER_IMG,
  chapters,
  formatVerseRef,
  getChapterTitle,
  getLanguageLabel,
  getVerse,
  getVerseAudioUrl,
  getVerseTranslation,
  type LanguageCode,
} from "../lib/gita-data";
import { t } from "../lib/mobile-i18n";
import type { AppRoute } from "../lib/hash-route";

export function VersePage({
  chapterNumber,
  verseNumber,
  language,
  bookmarks,
  setBookmarks,
  onNavigate,
}: {
  chapterNumber: number;
  verseNumber: number;
  language: LanguageCode;
  bookmarks: string[];
  setBookmarks: Dispatch<SetStateAction<string[]>>;
  onNavigate: (route: AppRoute) => void;
}) {
  const verse = getVerse(chapterNumber, verseNumber) ?? getVerse(2, 47)!;
  const chapter = chapters.find((item) => item.chapter_number === verse.chapter) ?? chapters[0];
  const ref = formatVerseRef(verse.chapter, verse.verse);
  const translation = getVerseTranslation(verse, language) ?? verse.translation.en;

  const nextVerse = useMemo(() => {
    const nextInChapter = getVerse(verse.chapter, verse.verse + 1);
    if (nextInChapter) return nextInChapter;
    const nextChapter = chapters.find((item) => item.chapter_number === verse.chapter + 1);
    if (!nextChapter) return null;
    return getVerse(nextChapter.chapter_number, 1);
  }, [verse.chapter, verse.verse]);

  const previousVerse = useMemo(() => {
    const previousInChapter = getVerse(verse.chapter, verse.verse - 1);
    if (previousInChapter) return previousInChapter;
    if (verse.chapter <= 1) return null;
    const previousChapter = chapters.find((item) => item.chapter_number === verse.chapter - 1);
    if (!previousChapter) return null;
    return getVerse(previousChapter.chapter_number, previousChapter.verseCount);
  }, [verse.chapter, verse.verse]);

  return (
    <PageFrame>
      <section className="space-y-6">
        <SectionHeading
          eyebrow={`${t("verseLabel", language)} ${ref}`}
          title={getChapterTitle(chapter.chapter_number, language)}
          sub={`${t("verseLabel", language)} ${ref} · ${getLanguageLabel(language)}`}
          action={
            <button
              type="button"
              onClick={() => onNavigate({ view: "chapter", chapter: verse.chapter })}
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-foreground"
            >
              {t("chapters", language)}
            </button>
          }
        />

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Card className="overflow-hidden border-amber-100 bg-[#fffaf2]">
              <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
                <img
                  src={PLACEHOLDER_IMG}
                  alt={`Bhagavad Gita ${ref}`}
                  className="h-full min-h-[280px] w-full object-cover"
                />
                <div className="space-y-5 p-6 md:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.3em] text-amber-700">
                        {t("chapterLabel", language)} {verse.chapter} · {t("verseLabel", language)}{" "}
                        {verse.verse}
                      </p>
                      <h3 className="mt-2 font-serif text-3xl text-foreground">
                        {getChapterTitle(chapter.chapter_number, language)}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {t("language", language)}: {getLanguageLabel(language)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          previousVerse &&
                          onNavigate({
                            view: "verse",
                            chapter: previousVerse.chapter,
                            verse: previousVerse.verse,
                          })
                        }
                        className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-foreground"
                      >
                        <ChevronLeft size={16} /> {t("back", language)}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          nextVerse &&
                          onNavigate({
                            view: "verse",
                            chapter: nextVerse.chapter,
                            verse: nextVerse.verse,
                          })
                        }
                        className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-foreground"
                      >
                        {t("continueBtn", language)} <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-[28px] border border-black/5 bg-[rgba(255,249,240,0.95)] p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                      {t("sanskrit", language)}
                    </p>
                    <p className="whitespace-pre-wrap font-serif text-3xl leading-relaxed text-foreground">
                      {verse.sanskrit}
                    </p>
                    <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                      {t("transliteration", language)}
                    </p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {verse.transliteration}
                    </p>
                  </div>

                  <div className="rounded-[28px] bg-amber-50 p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-amber-700">
                      {t("translation", language)} · {getLanguageLabel(language)}
                    </p>
                    <p className="mt-3 text-lg leading-relaxed text-foreground">
                      {translation.simple}
                    </p>
                  </div>

                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {translation.deep}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {bookmarks.includes(ref) ? (
                      <button
                        type="button"
                        onClick={() =>
                          setBookmarks((current) => current.filter((entry) => entry !== ref))
                        }
                        className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900"
                      >
                        <Heart size={16} /> {t("saved", language)}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setBookmarks((current) => [...current, ref])}
                        className="inline-flex items-center gap-2 rounded-full bg-[#a96616] px-4 py-2 text-sm font-medium text-white"
                      >
                        <Heart size={16} /> {t("saveVerse", language)}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <AudioBar
              src={getVerseAudioUrl(verse.chapter, verse.verse, language)}
              title={`Bhagavad Gita ${ref}`}
              language={language}
            />
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                {t("reflectionAndEssence", language)}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t("versePageIntro", language)}
              </p>
            </Card>
            <Card className="overflow-hidden">
              <img
                src="/assets/images/scene_9.png"
                alt={t("readingScene", language)}
                className="h-52 w-full object-cover"
              />
              <div className="p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                  {t("gitaQuote", language)}
                </p>
                <p className="mt-3 font-serif text-2xl leading-snug text-foreground">
                  “{translation.simple}”
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
