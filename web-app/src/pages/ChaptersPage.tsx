import {
  chapters,
  getChapterSummary,
  getChapterThumbnail,
  getChapterTitle,
  type LanguageCode,
} from "../lib/gita-data";
import type { AppRoute } from "../lib/hash-route";
import { Card, PageFrame, SectionHeading } from "../components/site-shell";
import { t } from "../lib/mobile-i18n";

export function ChaptersPage({
  language,
  onNavigate,
}: {
  language: LanguageCode;
  onNavigate: (route: AppRoute) => void;
}) {
  return (
    <PageFrame>
      <section>
        <SectionHeading
          eyebrow={t("chapters", language)}
          title={t("all18Chapters", language)}
          sub={t("chaptersPageSub", language)}
          action={
            <button
              type="button"
              onClick={() => onNavigate({ view: "chapter", chapter: 2 })}
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-foreground"
            >
              {t("continueReadingLink", language)}
            </button>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {chapters.map((chapter) => (
            <Card
              key={chapter.chapter_number}
              className="overflow-hidden transition hover:-translate-y-0.5"
            >
              <button
                type="button"
                onClick={() => onNavigate({ view: "chapter", chapter: chapter.chapter_number })}
                className="grid h-full gap-0 text-left"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={getChapterThumbnail(chapter.chapter_number)}
                    alt={getChapterTitle(chapter.chapter_number, language)}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-white/70">
                      {t("chapterLabel", language)} {chapter.chapter_number}
                    </p>
                    <h3 className="mt-2 font-serif text-2xl">
                      {getChapterTitle(chapter.chapter_number, language)}
                    </h3>
                  </div>
                </div>
                <div className="space-y-4 p-5">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {getChapterSummary(chapter.chapter_number, language)}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.28em] text-amber-700">
                      {chapter.verseCount} {t("verses", language)}
                    </p>
                    <span className="text-sm font-medium text-foreground">
                      {t("readChapter", language)}
                    </span>
                  </div>
                </div>
              </button>
            </Card>
          ))}
        </div>
      </section>
    </PageFrame>
  );
}
