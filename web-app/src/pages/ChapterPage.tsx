import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { ChevronRight, Heart, Headphones, Search } from "lucide-react";
import {
  AudioBar,
  Breadcrumbs,
  Card,
  PageFrame,
  SectionHeading,
  VerseListItem,
} from "../components/site-shell";
import {
  chapters,
  formatVerseRef,
  getChapterFullSummary,
  getChapterSummary,
  getChapterThumbnail,
  getChapterTitle,
  getChapterVerses,
  getLanguageLabel,
  getVerse,
  getVerseAudioUrl,
  getVerseTranslation,
  type LanguageCode,
} from "../lib/gita-data";
import { t } from "../lib/mobile-i18n";
import type { AppRoute } from "../lib/hash-route";

export function ChapterPage({
  chapterNumber,
  language,
  bookmarks,
  setBookmarks,
  onNavigate,
}: {
  chapterNumber: number;
  language: LanguageCode;
  bookmarks: string[];
  setBookmarks: Dispatch<SetStateAction<string[]>>;
  onNavigate: (route: AppRoute) => void;
}) {
  const [verseSearch, setVerseSearch] = useState("");
  const [activeVerse, setActiveVerse] = useState(1);

  const selectedChapterData =
    chapters.find((chapter) => chapter.chapter_number === chapterNumber) ?? chapters[0];

  useEffect(() => {
    setActiveVerse(1);
    setVerseSearch("");
  }, [chapterNumber]);

  const verseList = useMemo(() => {
    const items = getChapterVerses(chapterNumber);
    if (!verseSearch.trim()) return items;
    const q = verseSearch.trim().toLowerCase();
    return items.filter((verse) => {
      const ref = formatVerseRef(verse.chapter, verse.verse);
      const translation = getVerseTranslation(verse, language) ?? verse.translation.en;
      return (
        ref.includes(q) ||
        verse.sanskrit.toLowerCase().includes(q) ||
        verse.transliteration.toLowerCase().includes(q) ||
        translation.simple.toLowerCase().includes(q) ||
        translation.deep.toLowerCase().includes(q)
      );
    });
  }, [chapterNumber, verseSearch, language]);

  useEffect(() => {
    if (!verseList.length) return;
    if (!verseList.some((verse) => verse.verse === activeVerse)) {
      setActiveVerse(verseList[0].verse);
    }
  }, [activeVerse, verseList]);

  const selectedVerseData =
    getVerse(chapterNumber, activeVerse) ?? getVerse(chapterNumber, 1) ?? getVerse(2, 47)!;
  const selectedTranslation =
    getVerseTranslation(selectedVerseData, language) ?? selectedVerseData.translation.en;
  const selectedRef = formatVerseRef(selectedVerseData.chapter, selectedVerseData.verse);
  const selectedChapterTitle = getChapterTitle(chapterNumber, language);
  const selectedChapterSummary = getChapterSummary(chapterNumber, language);
  const selectedChapterFullSummary = getChapterFullSummary(chapterNumber, language);

  return (
    <PageFrame>
      <section className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "GitaSadhana", href: "/" },
            { label: "Chapters", href: "/chapters" },
            { label: `Chapter ${chapterNumber}` },
          ]}
        />
        <Card className="overflow-hidden border-amber-100 bg-[#fffaf2]">
          <div className="grid gap-0 lg:grid-cols-[0.94fr_1.06fr]">
            <div className="p-6 md:p-10 lg:p-12">
              <p className="text-[11px] uppercase tracking-[0.36em] text-[#8a6747]">
                {t("chapterLabel", language)} {selectedChapterData.chapter_number}
              </p>
              <h1 className="mt-4 font-serif text-4xl leading-tight text-foreground md:text-5xl">
                {selectedChapterTitle}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {selectedChapterSummary}
              </p>
              <p className="mt-5 max-w-3xl text-sm leading-relaxed text-foreground/90 md:text-base">
                {selectedChapterFullSummary}
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate({ view: "chapters" })}
                  className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-foreground"
                >
                  {t("chapters", language)}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate({ view: "verse", chapter: chapterNumber, verse: 1 })}
                  className="inline-flex items-center gap-2 rounded-full bg-[#a96616] px-4 py-2 text-sm font-medium text-white"
                >
                  {t("continueReading", language)} <ChevronRight size={16} />
                </button>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[24px] border border-black/5 bg-white/85 p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-amber-700">
                    {t("verses", language)}
                  </p>
                  <p className="mt-2 font-serif text-3xl text-foreground">
                    {selectedChapterData.verseCount}
                  </p>
                </div>
                <div className="rounded-[24px] border border-black/5 bg-white/85 p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-amber-700">
                    {t("language", language)}
                  </p>
                  <p className="mt-2 font-serif text-2xl text-foreground">
                    {getLanguageLabel(language)}
                  </p>
                </div>
                <div className="rounded-[24px] border border-black/5 bg-white/85 p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-amber-700">
                    {t("verseLabel", language)}
                  </p>
                  <p className="mt-2 font-serif text-2xl text-foreground">{selectedRef}</p>
                </div>
              </div>
            </div>

            <img
              src={getChapterThumbnail(selectedChapterData.chapter_number)}
              alt={selectedChapterTitle}
              className="h-full min-h-[320px] w-full object-cover"
            />
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                  {t("verses", language)}
                </p>
                <p className="mt-1 font-serif text-xl text-foreground">
                  {t("searchTitle", language)}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-black/6 bg-white/80 px-3 py-2">
                <Search size={15} className="text-muted-foreground" />
                <input
                  value={verseSearch}
                  onChange={(e) => setVerseSearch(e.target.value)}
                  placeholder={t("searchPlaceholder", language)}
                  className="w-32 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="mt-4 max-h-[760px] space-y-3 overflow-y-auto pr-1 scroll-hide">
              {verseList.map((verse) => {
                const ref = formatVerseRef(verse.chapter, verse.verse);
                const translation = getVerseTranslation(verse, language) ?? verse.translation.en;
                const active = verse.verse === activeVerse;
                return (
                  <VerseListItem
                    key={ref}
                    title={`${t("verseLabel", language)} ${ref}`}
                    text={translation.simple}
                    active={active}
                    onClick={() => setActiveVerse(verse.verse)}
                  />
                );
              })}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="overflow-hidden p-0">
              <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
                <img
                  src="/assets/images/scene_5.png"
                  alt={`Bhagavad Gita ${selectedRef}`}
                  className="h-full min-h-[280px] w-full object-cover"
                />
                <div className="space-y-5 p-6 md:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.3em] text-amber-700">
                        {t("chapterLabel", language)} {selectedChapterData.chapter_number} ·{" "}
                        {t("verseLabel", language)} {selectedVerseData.verse}
                      </p>
                      <h3 className="mt-2 font-serif text-3xl text-foreground">
                        {selectedChapterTitle}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {t("selectedLanguage", language)}: {getLanguageLabel(language)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const previous = getVerse(
                            selectedVerseData.chapter,
                            selectedVerseData.verse - 1,
                          );
                          if (previous) {
                            setActiveVerse(previous.verse);
                            return;
                          }
                          if (chapterNumber > 1) {
                            onNavigate({ view: "chapter", chapter: chapterNumber - 1 });
                          }
                        }}
                        className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-foreground"
                      >
                        {t("previous", language)}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const next = getVerse(
                            selectedVerseData.chapter,
                            selectedVerseData.verse + 1,
                          );
                          if (next) {
                            setActiveVerse(next.verse);
                            return;
                          }
                          if (chapterNumber < chapters.length) {
                            onNavigate({ view: "chapter", chapter: chapterNumber + 1 });
                          }
                        }}
                        className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-foreground"
                      >
                        {t("next", language)}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-[28px] border border-black/5 bg-[rgba(255,249,240,0.95)] p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                      {t("sanskrit", language)}
                    </p>
                    <p className="whitespace-pre-wrap font-serif text-3xl leading-relaxed text-foreground">
                      {selectedVerseData.sanskrit}
                    </p>
                    <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                      {t("transliteration", language)}
                    </p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {selectedVerseData.transliteration}
                    </p>
                  </div>

                  <div className="rounded-[28px] bg-amber-50 p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-amber-700">
                      {t("translation", language)} · {getLanguageLabel(language)}
                    </p>
                    <p className="mt-3 text-lg leading-relaxed text-foreground">
                      {selectedTranslation.simple}
                    </p>
                  </div>

                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {selectedTranslation.deep}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {bookmarks.includes(selectedRef) ? (
                      <button
                        type="button"
                        onClick={() =>
                          setBookmarks((current) =>
                            current.filter((entry) => entry !== selectedRef),
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900"
                      >
                        <Heart size={16} /> {t("saved", language)}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setBookmarks((current) => [...current, selectedRef])}
                        className="inline-flex items-center gap-2 rounded-full bg-[#a96616] px-4 py-2 text-sm font-medium text-white"
                      >
                        <Heart size={16} /> {t("saveVerse", language)}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        onNavigate({
                          view: "verse",
                          chapter: selectedVerseData.chapter,
                          verse: selectedVerseData.verse,
                        })
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-foreground"
                    >
                      <Headphones size={16} /> {t("openVersePage", language)}
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            <AudioBar
              src={getVerseAudioUrl(selectedVerseData.chapter, selectedVerseData.verse, language)}
              title={`Bhagavad Gita ${selectedRef}`}
              language={language}
            />
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
