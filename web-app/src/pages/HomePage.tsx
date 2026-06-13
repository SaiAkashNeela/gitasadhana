import { ArrowRight, BookOpen, Headphones, Heart, Sparkles, WandSparkles } from "lucide-react";
import {
  chapters,
  formatVerseRef,
  getChapterSummary,
  getChapterThumbnail,
  getChapterTitle,
  getLanguageLabel,
  getVerse,
  getVerseTranslation,
  PLACEHOLDER_IMG,
  type LanguageCode,
} from "../lib/gita-data";
import { t } from "../lib/mobile-i18n";
import type { AppRoute } from "../lib/hash-route";
import {
  Card,
  FeatureTiles,
  ImageCard,
  PageFrame,
  PulseCaption,
  SectionHeading,
  SectionShellLink,
} from "../components/site-shell";

export function HomePage({
  bookmarksCount,
  language,
  onNavigate,
}: {
  bookmarksCount: number;
  language: LanguageCode;
  onNavigate: (route: AppRoute) => void;
}) {
  const verse = getVerse(2, 47)!;
  const translation = getVerseTranslation(verse, language) ?? verse.translation.en;
  const langLabel = getLanguageLabel(language);
  const spotlightChapters = chapters.slice(0, 6);

  const featureCards = [
    {
      icon: <BookOpen size={18} className="text-amber-700" />,
      title: t("verseExplorerTitle", language),
      text: t("verseExplorerDesc", language),
    },
    {
      icon: <WandSparkles size={18} className="text-amber-700" />,
      title: t("chapterSummariesTitle", language),
      text: t("chapterSummariesDesc", language).replace("{language}", langLabel),
    },
    {
      icon: <Headphones size={18} className="text-amber-700" />,
      title: t("audioReadingTitle", language),
      text: t("audioReadingDesc", language),
    },
    {
      icon: <Sparkles size={18} className="text-amber-700" />,
      title: t("gitaAiGuideTitle", language),
      text: t("gitaAiGuideDesc", language),
    },
  ];

  return (
    <PageFrame>
      <div className="space-y-8 lg:space-y-10">
        <Card className="overflow-hidden border-amber-100 bg-[#fffaf2] shadow-[0_22px_70px_-36px_rgba(112,70,17,0.35)]">
          <div className="grid gap-0 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="relative p-6 md:p-10 lg:p-12">
              <PulseCaption language={language} />
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.3em] text-amber-800">
                {t("welcomeLine1", language)}
              </div>
              <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-[0.95] text-foreground md:text-6xl lg:text-7xl">
                {t("welcomeLine2", language)}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {t("welcomeSub", language)}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <SectionShellLink
                  label={t("ContinueReading", language)}
                  icon={<ArrowRight size={16} />}
                  onClick={() => onNavigate({ view: "chapter", chapter: 2 })}
                />
                <SectionShellLink
                  label={t("chapters", language)}
                  icon={<BookOpen size={16} />}
                  onClick={() => onNavigate({ view: "chapters" })}
                />
              </div>

              <FeatureTiles
                tiles={[
                  {
                    value: "18",
                    label: t("chapters", language),
                    icon: <BookOpen size={18} className="text-amber-700" />,
                  },
                  {
                    value: "700+",
                    label: t("verses", language),
                    icon: <Sparkles size={18} className="text-amber-700" />,
                  },
                  {
                    value: langLabel,
                    label: t("language", language),
                    icon: <WandSparkles size={18} className="text-amber-700" />,
                  },
                  {
                    value: bookmarksCount.toString(),
                    label: t("saved", language),
                    icon: <Heart size={18} className="text-amber-700" />,
                  },
                ]}
              />
            </div>

            <div className="relative min-h-[460px] overflow-hidden">
              <ImageCard
                src="/assets/images/lord_krishna.png"
                alt={t("lordKrishnaImage", language)}
                className="absolute inset-0"
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,248,233,0.18),transparent_26%),linear-gradient(180deg,rgba(75,41,12,0.08),rgba(25,14,4,0.75))]" />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <div className="max-w-xl rounded-[28px] border border-white/12 bg-black/20 p-5 text-white backdrop-blur-md">
                  <p className="text-xs uppercase tracking-[0.32em] text-white/70">
                    {t("verseSpotlight", language)}
                  </p>
                  <p className="mt-3 font-serif text-2xl leading-snug md:text-3xl">
                    “{translation.simple}”
                  </p>
                  <p className="mt-3 text-sm text-white/75">
                    Bhagavad Gita {formatVerseRef(verse.chapter, verse.verse)} in {langLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <section>
          <SectionHeading
            eyebrow={t("coreFlows", language)}
            title={t("coreFlowsTitle", language)}
            sub={t("coreFlowsSub", language)}
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((card) => (
              <Card
                key={card.title}
                className="p-5 transition hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-30px_rgba(112,70,17,0.38)]"
              >
                <div className="flex items-center gap-2 text-amber-700">
                  {card.icon}
                  <p className="text-xs uppercase tracking-[0.28em]">{card.title}</p>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{card.text}</p>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.36em] text-[#8a6747]">
                {t("chapters", language)}
              </p>
              <h2 className="mt-2 font-serif text-3xl text-foreground md:text-4xl">
                {t("exploreChaptersDesc", language)}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate({ view: "chapters" })}
              className="hidden rounded-full border border-black/8 bg-white/80 px-4 py-2 text-sm font-medium text-foreground md:inline-flex"
            >
              {t("viewAllChapters", language)}
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {spotlightChapters.map((chapter) => (
              <button
                key={chapter.chapter_number}
                type="button"
                onClick={() => onNavigate({ view: "chapter", chapter: chapter.chapter_number })}
                className="group overflow-hidden rounded-[28px] border border-black/5 bg-[rgba(255,252,246,0.98)] text-left shadow-[0_18px_50px_-34px_rgba(112,70,17,0.24)] transition hover:-translate-y-0.5 hover:border-amber-200"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={getChapterThumbnail(chapter.chapter_number)}
                    alt={getChapterTitle(chapter.chapter_number, language)}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
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
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                      {t("continueReading", language)} <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="overflow-hidden">
            <div className="grid gap-0 md:grid-cols-[0.92fr_1.08fr]">
              <div className="p-6 md:p-8">
                <p className="text-[11px] uppercase tracking-[0.36em] text-[#8a6747]">
                  {t("verseOfTheDay", language)}
                </p>
                <h3 className="mt-3 font-serif text-3xl text-foreground">
                  {t("translation", language)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {t("reflectionAndEssence", language)}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <SectionShellLink
                    label={`${t("verseLabel", language)} 2.47`}
                    icon={<ArrowRight size={16} />}
                    onClick={() => onNavigate({ view: "verse", chapter: 2, verse: 47 })}
                  />
                </div>
              </div>
              <ImageCard
                src={PLACEHOLDER_IMG}
                alt={t("verseReadingScene", language)}
                className="h-64 md:h-full"
              />
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="grid gap-0 md:grid-cols-[0.92fr_1.08fr]">
              <div className="p-6 md:p-8">
                <p className="text-[11px] uppercase tracking-[0.36em] text-[#8a6747]">
                  {t("gitaAi", language)}
                </p>
                <h3 className="mt-3 font-serif text-3xl text-foreground">
                  {t("aiHomeTitle", language)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {t("aiHomeDesc", language)}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <SectionShellLink
                    label={t("openAi", language)}
                    icon={<Sparkles size={16} />}
                    onClick={() => onNavigate({ view: "ai" })}
                  />
                </div>
              </div>
              <ImageCard
                src="/assets/images/scene_8.png"
                alt={t("gitaAiScene", language)}
                className="h-64 md:h-full"
              />
            </div>
          </Card>
        </section>
      </div>
    </PageFrame>
  );
}
