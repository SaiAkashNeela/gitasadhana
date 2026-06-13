import { Card, PageFrame, SectionHeading } from "../components/site-shell";
import {
  PLACEHOLDER_IMG,
  articles,
  wisdomCards,
  getLanguageLabel,
  type LanguageCode,
} from "../lib/gita-data";
import { t } from "../lib/mobile-i18n";

export function StudyPage({ language }: { language: LanguageCode }) {
  const themeKeys: Record<string, string> = {
    Detachment: "detachment",
    "Self-Discipline": "selfDiscipline",
    Dharma: "dharma",
    "Inner Peace": "innerPeace",
    Devotion: "devotion",
    Purpose: "purpose",
  };

  const lineKeys: Record<string, string> = {
    "Perform every action as an offering, free from the grip of its result.": "detachmentLine",
    "The mind, when conquered, becomes the truest friend of the soul.": "selfDisciplineLine",
    "Better one's own duty performed imperfectly than another's done well.": "dharmaLine",
    "He who is unmoved by joy or sorrow attains the eternal abode.": "innerPeaceLine",
    "Offer a leaf, a flower, a fruit, or water with love — and I receive it.": "devotionLine",
    "Established in yoga, perform your work — for yoga is skill in action.": "purposeLine",
  };

  const articleKeys: Record<string, { title: string; excerpt: string; tag: string }> = {
    "Applying Karma Yoga at Work": {
      title: "applyingKarmaYogaAtWork",
      excerpt: "applyingKarmaYogaAtWorkExcerpt",
      tag: "workAndLife",
    },
    "What Krishna Teaches About Anxiety": {
      title: "whatKrishnaTeachesAboutAnxiety",
      excerpt: "whatKrishnaTeachesAboutAnxietyExcerpt",
      tag: "mindfulness",
    },
    "Dharma in Modern Life": {
      title: "dharmaInModernLife",
      excerpt: "dharmaInModernLifeExcerpt",
      tag: "philosophy",
    },
    "Understanding Detachment": {
      title: "understandingDetachment",
      excerpt: "understandingDetachmentExcerpt",
      tag: "reflection",
    },
  };

  return (
    <PageFrame>
      <section className="space-y-10">
        <div>
          <SectionHeading
            eyebrow={t("study", language)}
            title={t("dailyWisdom", language)}
            sub={`${t("yourJourney", language)} · ${getLanguageLabel(language)}`}
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {wisdomCards.map((item) => (
              <Card key={item.theme} className="p-5">
                <div className="flex items-center gap-2 text-amber-700">
                  <span className="text-xs uppercase tracking-[0.28em]">
                    {t(themeKeys[item.theme] ?? item.theme, language)}
                  </span>
                </div>
                <p className="mt-4 font-serif text-2xl leading-snug text-foreground">
                  “{t(lineKeys[item.line] ?? item.line, language)}”
                </p>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <SectionHeading
            eyebrow={t("insights", language)}
            title={t("quotesTitle", language)}
            sub={t("gitaQuote", language)}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {articles.map((article) => (
              <Card key={article.title} className="overflow-hidden">
                <div className="grid gap-0 md:grid-cols-[180px_minmax(0,1fr)]">
                  <img
                    src={PLACEHOLDER_IMG}
                    alt={t(articleKeys[article.title]?.title ?? article.title, language)}
                    className="h-44 w-full object-cover md:h-full"
                  />
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-amber-700">
                      {t(articleKeys[article.title]?.tag ?? article.tag, language)}
                    </p>
                    <h3 className="mt-2 font-serif text-2xl text-foreground">
                      {t(articleKeys[article.title]?.title ?? article.title, language)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {t(articleKeys[article.title]?.excerpt ?? article.excerpt, language)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
