import { type AppRoute } from "./hash-route";
import {
  formatVerseRef,
  getChapterFullSummary,
  getChapterSummary,
  getChapterTitle,
  getVerse,
  getVerseTranslation,
  type LanguageCode,
} from "./gita-data";
import { siteMetadata, absoluteSiteUrl } from "../../../src/lib/site-metadata";

type JsonLd = Record<string, unknown>;

export type SeoData = {
  title: string;
  description: string;
  canonicalPath: string;
  canonicalUrl: string;
  ogType: "website" | "article";
  robots: string;
  keywords: string[];
  breadcrumbItems: Array<{ label: string; href?: string }>;
  jsonLd: JsonLd[];
};

function routeLabel(route: AppRoute, language: LanguageCode) {
  switch (route.view) {
    case "home":
      return siteMetadata.brandName;
    case "chapters":
      return "Bhagavad Gita Chapters";
    case "study":
      return "Bhagavad Gita Study";
    case "ai":
      return "Gita AI";
    case "chapter":
      return getChapterTitle(route.chapter, language);
    case "verse":
      return `Bhagavad Gita ${formatVerseRef(route.chapter, route.verse)}`;
  }
}

function breadcrumbItems(route: AppRoute, language: LanguageCode) {
  const home = { label: siteMetadata.brandName, href: "/" };
  const chaptersCrumb = { label: "Chapters", href: "/chapters" };
  const studyCrumb = { label: "Study", href: "/study" };
  const aiCrumb = { label: "AI Guide", href: "/ai" };

  switch (route.view) {
    case "home":
      return [home];
    case "chapters":
      return [home, chaptersCrumb];
    case "study":
      return [home, studyCrumb];
    case "ai":
      return [home, aiCrumb];
    case "chapter":
      return [home, chaptersCrumb, { label: routeLabel(route, language) }];
    case "verse":
      return [
        home,
        chaptersCrumb,
        {
          label: `Chapter ${route.chapter}`,
          href: `/chapter/${route.chapter}`,
        },
        { label: `Verse ${formatVerseRef(route.chapter, route.verse)}` },
      ];
  }
}

function buildOrganizationSchema(): JsonLd {
  return {
    "@type": "Organization",
    "@id": `${siteMetadata.siteUrl}/#organization`,
    name: siteMetadata.brandName,
    alternateName: siteMetadata.displayName,
    url: siteMetadata.siteUrl,
    logo: absoluteSiteUrl("/favicon.png"),
    description: siteMetadata.description,
    founder: {
      "@type": "Person",
      name: siteMetadata.founderName,
      url: siteMetadata.personalSiteUrl,
    },
    sameAs: siteMetadata.sameAs,
  };
}

function buildWebsiteSchema(canonicalUrl: string): JsonLd {
  return {
    "@type": "WebSite",
    "@id": `${siteMetadata.siteUrl}/#website`,
    url: siteMetadata.siteUrl,
    name: siteMetadata.brandName,
    description: siteMetadata.description,
    publisher: { "@id": `${siteMetadata.siteUrl}/#organization` },
    inLanguage: "en",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteMetadata.siteUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
    isPartOf: {
      "@id": `${siteMetadata.siteUrl}/#organization`,
    },
    mainEntityOfPage: canonicalUrl,
  };
}

function buildWebPageSchema(
  canonicalUrl: string,
  title: string,
  description: string,
  pageType: "website" | "article",
  breadcrumbItemsList: Array<{ label: string; href?: string }>,
): JsonLd {
  return {
    "@type": pageType === "article" ? "Article" : "WebPage",
    "@id": `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: title,
    headline: title,
    description,
    inLanguage: "en",
    isPartOf: {
      "@id": `${siteMetadata.siteUrl}/#website`,
    },
    about: {
      "@id": `${siteMetadata.siteUrl}/#organization`,
    },
    publisher: {
      "@id": `${siteMetadata.siteUrl}/#organization`,
    },
    author: {
      "@type": "Person",
      name: siteMetadata.founderName,
      url: siteMetadata.personalSiteUrl,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbItemsList.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
        item: item.href ? absoluteSiteUrl(item.href) : canonicalUrl,
      })),
    },
  };
}

function buildFaqSchema(faqs: Array<{ question: string; answer: string }>): JsonLd | null {
  if (!faqs.length) return null;
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function buildEducationalSchema(): JsonLd {
  return {
    "@type": "EducationalOrganization",
    name: siteMetadata.brandName,
    url: siteMetadata.siteUrl,
    description: siteMetadata.description,
    sameAs: siteMetadata.sameAs,
  };
}

function chapterFaq(chapterNumber: number, language: LanguageCode) {
  const title = getChapterTitle(chapterNumber, language);
  const summary = getChapterSummary(chapterNumber, language);
  return [
    {
      question: `What is Bhagavad Gita chapter ${chapterNumber} about?`,
      answer: summary || `${title} is one of the 18 chapters of the Bhagavad Gita.`,
    },
    {
      question: `How should I study ${title}?`,
      answer:
        "Read the chapter summary first, then go verse by verse with the Sanskrit, transliteration, and translation to build understanding.",
    },
    {
      question: `Can I listen to the chapter while reading?`,
      answer:
        "Yes. Each verse is paired with audio recitation so you can read and listen together for deeper retention.",
    },
  ];
}

function verseFaq(chapterNumber: number, verseNumber: number, language: LanguageCode) {
  const verse = getVerse(chapterNumber, verseNumber);
  const translation = getVerseTranslation(verse, language) ?? verse?.translation.en;
  return [
    {
      question: `What does Bhagavad Gita ${formatVerseRef(chapterNumber, verseNumber)} mean?`,
      answer:
        translation?.simple ||
        `This verse from Bhagavad Gita ${formatVerseRef(chapterNumber, verseNumber)} offers practical spiritual guidance.`,
    },
    {
      question: "How do I apply this verse in daily life?",
      answer:
        "Focus on one action from the verse, reflect on its meaning, and apply it to work, relationships, or self-discipline during the day.",
    },
    {
      question: "Is there transliteration and audio available?",
      answer:
        "Yes. The verse page includes Sanskrit, transliteration, meaning, and audio playback.",
    },
  ];
}

function studyFaq() {
  return [
    {
      question: "What can I learn from the study page?",
      answer:
        "The study page highlights timeless Bhagavad Gita themes, reflections, and practical life lessons for daily reading.",
    },
    {
      question: "Is the study content beginner friendly?",
      answer:
        "Yes. The content is written to be approachable while still staying faithful to the Bhagavad Gita teachings.",
    },
  ];
}

function aiFaq() {
  return [
    {
      question: "Can I use Gita AI without logging in?",
      answer:
        "Yes. Guest chat is available, and users can also sign in with Google for saved history and a more persistent session.",
    },
    {
      question: "What should I ask Gita AI?",
      answer:
        "Ask about the Bhagavad Gita, Krishna's teachings, karma yoga, bhakti yoga, or practical guidance for everyday life.",
    },
    {
      question: "Does Gita AI replace the verses and chapter pages?",
      answer:
        "No. The AI guide complements the reading experience by helping you explore the source material more deeply.",
    },
  ];
}

export function getSeoData(route: AppRoute, language: LanguageCode): SeoData {
  const canonicalPath =
    route.view === "home"
      ? "/"
      : route.view === "chapter"
        ? `/chapter/${route.chapter}`
        : route.view === "verse"
          ? `/verse/${route.chapter}/${route.verse}`
          : `/${route.view}`;
  const canonicalUrl = absoluteSiteUrl(canonicalPath);
  const breadcrumbItemsList = breadcrumbItems(route, language);

  const homeTitle = `${siteMetadata.brandName} | Bhagavad Gita Study, Verses, and AI Guide`;
  const homeDescription = siteMetadata.description;

  switch (route.view) {
    case "home":
      return {
        title: homeTitle,
        description: homeDescription,
        canonicalPath,
        canonicalUrl,
        ogType: "website",
        robots: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
        keywords: [
          ...siteMetadata.keywords,
          "Bhagavad Gita explained",
          "learn Bhagavad Gita online",
        ],
        breadcrumbItems: breadcrumbItemsList,
        jsonLd: [
          buildOrganizationSchema(),
          buildWebsiteSchema(canonicalUrl),
          buildWebPageSchema(
            canonicalUrl,
            homeTitle,
            homeDescription,
            "website",
            breadcrumbItemsList,
          ),
          buildEducationalSchema(),
        ],
      };
    case "chapters": {
      const title = "Bhagavad Gita Chapters | GitaSadhana";
      const description =
        "Browse all 18 Bhagavad Gita chapters with summaries, titles, and guided reading paths on GitaSadhana.";
      return {
        title,
        description,
        canonicalPath,
        canonicalUrl,
        ogType: "article",
        robots: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
        keywords: [...siteMetadata.keywords, "Bhagavad Gita chapters", "chapter summaries"],
        breadcrumbItems: breadcrumbItemsList,
        jsonLd: [
          buildOrganizationSchema(),
          buildWebPageSchema(canonicalUrl, title, description, "article", breadcrumbItemsList),
          buildFaqSchema([
            {
              question: "How many chapters are in the Bhagavad Gita?",
              answer: "There are 18 chapters in the Bhagavad Gita.",
            },
            {
              question: "Should I start with chapter 1 or chapter 2?",
              answer:
                "Chapter 2 is a strong starting point because it introduces the core teaching of action without attachment.",
            },
          ])!,
        ].filter(Boolean) as JsonLd[],
      };
    }
    case "study": {
      const title = "Bhagavad Gita Study Guide | GitaSadhana";
      const description =
        "Daily wisdom, reflections, and practical Bhagavad Gita lessons for modern life.";
      return {
        title,
        description,
        canonicalPath,
        canonicalUrl,
        ogType: "article",
        robots: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
        keywords: [...siteMetadata.keywords, "Bhagavad Gita lessons", "Krishna teachings on life"],
        breadcrumbItems: breadcrumbItemsList,
        jsonLd: [
          buildOrganizationSchema(),
          buildWebPageSchema(canonicalUrl, title, description, "article", breadcrumbItemsList),
          buildFaqSchema(studyFaq())!,
        ].filter(Boolean) as JsonLd[],
      };
    }
    case "ai": {
      const title = "Gita AI | Ask Krishna-inspired Bhagavad Gita Questions";
      const description =
        "Use Gita AI to ask Bhagavad Gita questions, explore verse meanings, and get practical guidance for daily life.";
      return {
        title,
        description,
        canonicalPath,
        canonicalUrl,
        ogType: "website",
        robots: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
        keywords: [...siteMetadata.keywords, "Bhagavad Gita AI", "Ask Krishna AI"],
        breadcrumbItems: breadcrumbItemsList,
        jsonLd: [
          buildOrganizationSchema(),
          buildWebPageSchema(canonicalUrl, title, description, "website", breadcrumbItemsList),
          buildFaqSchema(aiFaq())!,
        ].filter(Boolean) as JsonLd[],
      };
    }
    case "chapter": {
      const titleText = getChapterTitle(route.chapter, language);
      const summary = getChapterSummary(route.chapter, language);
      const fullSummary = getChapterFullSummary(route.chapter, language);
      const title = `${titleText} | Bhagavad Gita Chapter ${route.chapter} | GitaSadhana`;
      const description =
        summary ||
        fullSummary ||
        `Read Bhagavad Gita chapter ${route.chapter} with summary, verse guidance, and audio on GitaSadhana.`;
      return {
        title,
        description,
        canonicalPath,
        canonicalUrl,
        ogType: "article",
        robots: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
        keywords: [
          ...siteMetadata.keywords,
          `Bhagavad Gita chapter ${route.chapter}`,
          titleText,
          "chapter summary",
        ],
        breadcrumbItems: breadcrumbItemsList,
        jsonLd: [
          buildOrganizationSchema(),
          buildWebPageSchema(canonicalUrl, title, description, "article", breadcrumbItemsList),
          buildFaqSchema(chapterFaq(route.chapter, language))!,
        ].filter(Boolean) as JsonLd[],
      };
    }
    case "verse": {
      const verse = getVerse(route.chapter, route.verse);
      const translation = getVerseTranslation(verse, language) ?? verse?.translation.en;
      const chapterTitle = getChapterTitle(route.chapter, language);
      const ref = formatVerseRef(route.chapter, route.verse);
      const title = `Bhagavad Gita ${ref} | Sanskrit, Translation, Meaning | GitaSadhana`;
      const description =
        translation?.simple ||
        `Explore Bhagavad Gita ${ref} with Sanskrit, transliteration, translation, meaning, and audio recitation.`;
      return {
        title,
        description,
        canonicalPath,
        canonicalUrl,
        ogType: "article",
        robots: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
        keywords: [
          ...siteMetadata.keywords,
          `Bhagavad Gita ${ref}`,
          chapterTitle,
          "verse meaning",
          "Sanskrit verse",
        ],
        breadcrumbItems: breadcrumbItemsList,
        jsonLd: [
          buildOrganizationSchema(),
          buildWebPageSchema(canonicalUrl, title, description, "article", breadcrumbItemsList),
          buildFaqSchema(verseFaq(route.chapter, route.verse, language))!,
        ].filter(Boolean) as JsonLd[],
      };
    }
  }
}
