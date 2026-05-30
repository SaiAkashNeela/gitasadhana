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

const CHAPTER_TRANSLATIONS: Record<
  number,
  {
    title: { te: string; sa: string };
    summary: { te: string; sa: string };
    fullSummary: { te: string; sa: string };
  }
> = {
  1: {
    title: { te: "అర్జునవిషాద యోగము", sa: "अर्जुनविषादयोगः" },
    summary: { te: "అర్జునుని విషాదము", sa: "अर्जुनस्य विषादः" },
    fullSummary: {
      te: "కురుక్షేత్ర రణరంగంలో తన బంధువులను చూసి అర్జునుడు పొందిన దుఃఖము మరియు వ్యాకులతను ఈ అధ్యాయము వివరిస్తుంది.",
      sa: "कुरुक्षेत्रे युद्धभूमौ स्वजनान् दृष्ट्वा अर्जुनस्य विषादः शोकश्च अस्मिन् अध्याये वर्णितः।",
    },
  },
  2: {
    title: { te: "సాంఖ్య యోగము", sa: "सांख्ययोगः" },
    summary: { te: "జ్ఞాన యోగము", sa: "आत्मज्ञानम्" },
    fullSummary: {
      te: "శ్రీకృష్ణుడు అర్జునునికి ఆత్మ యొక్క నిత్యత్వాన్ని, నిష్కామ కర్మ యోగాన్ని మరియు స్థితప్రజ్ఞుని లక్షణాలను బోధిస్తాడు.",
      sa: "श्रीकृष्णः अर्जुनाय आत्मनः नित्यतां, निष्कामकर्मयोगं, स्थितप्रज्ञस्य लक्षणानि च उपदिशति।",
    },
  },
  3: {
    title: { te: "కర్మ యోగము", sa: "कर्मयोगः" },
    summary: { te: "నిష్కామ కర్మ మార్గము", sa: "निष्कामकर्म" },
    fullSummary: {
      te: "ఫలాపేక్ష లేకుండా తన కర్తవ్య కర్మలను ఆచరించడం ద్వారా మనిషి ఎలా మోక్షాన్ని పొందవచ్చో ఈ అధ్యాయము వివరిస్తుంది.",
      sa: "आसक्तिं विना स्वकर्तव्यकर्मणां आचरणेन मनुष्यः कथं मोक्षं प्राप्नोति इति अस्मिन् अध्याये स्पष्टीकृतम्।",
    },
  },
  4: {
    title: { te: "జ్ఞానకర్మసన్న్యాస యోగము", sa: "ज्ञानकर्मसंन्यासयोगः" },
    summary: { te: "జ్ఞానము మరియు కర్మ సన్యాసము", sa: "ज्ञानकर्मसंन्यासः" },
    fullSummary: {
      te: "జ్ఞానము యొక్క ప్రాముఖ్యతను, యజ్ఞాల రకాలను మరియు కర్మలలో జ్ఞానాన్ని దర్శించే మార్గాన్ని శ్రీకృష్ణుడు బోధిస్తాడు.",
      sa: "दिव्यज्ञानस्य महत्त्वं, यज्ञानां प्रकारान्, कर्मणि ज्ञानदर्शनस्य मार्गं च श्रीकृष्णः अर्जुनाय उपदिशति।",
    },
  },
  5: {
    title: { te: "కర్మసన్న్యాస యోగము", sa: "कर्मसंन्यासयोगः" },
    summary: { te: "కర్మ సన్యాస మార్గము", sa: "कर्मसंन्यासः" },
    fullSummary: {
      te: "కర్మసన్యాసము మరియు కర్మయోగము రెండూ ఒకే పరమపదానికి దారితీస్తాయని, కర్మల యందు అనాసక్తి ముఖ్యాంశమని వివరిస్తుంది.",
      sa: "कर्मसंन्यासः कर्मयोगश्च उभौ अपि एकं परमपदं नयतः, कर्मसु अनासक्तिः एव मुख्यः विषयः इति अस्मिन् अध्याये स्पष्टीकृतम्।",
    },
  },
  6: {
    title: { te: "ఆత్మసంయమ యోగము", sa: "आत्मसंयमयोगः" },
    summary: { te: "ధ్యాన మార్గము", sa: "ध्यानमार्गः" },
    fullSummary: {
      te: "మనస్సును నియంత్రించే మార్గాలను, అష్టాంగ యోగ సాధనను మరియు ధ్యానం ద్వారా పరమాత్మను పొందే విధానాన్ని వివరిస్తుంది.",
      sa: "मनोनिग्रहस्य मार्गान्, अष्टाङ्गयोगस्य साधनां, ध्यानेन परमात्मप्राप्तेः विधिं च अस्मिन् अध्याये श्रीकृष्णः उपदिशति।",
    },
  },
  7: {
    title: { te: "జ్ఞానవిజ్ఞాన యోగము", sa: "ज्ञानविज्ञानयोगः" },
    summary: { te: "భగవద్జ్ఞానము", sa: "भगवद्ज्ञानम्" },
    fullSummary: {
      te: "భగవంతుని పరా-అపరా ప్రకృతులను, మాయా శక్తిని మరియు భగవంతుని శరణు వేడే భక్తుల రకాలను వివరిస్తుంది.",
      sa: "भगवतः परा-अपरा प्रकृत्योः, मायाशक्तेः, भगवच्छरणागतभक्तानां प्रकाराणां च वर्णनं अस्मिन् अध्याये कृतम्।",
    },
  },
  8: {
    title: { te: "అక్షరపరబ్రహ్మ యోగము", sa: "अक्षरब्रह्मयोगः" },
    summary: { te: "శాశ్వత బ్రహ్మ ప్రాప్తి మార్గము", sa: "भगवत्प्राप्तिः" },
    fullSummary: {
      te: "మరణకాలంలో భగవంతుని స్మరించడం యొక్క ప్రాముఖ్యతను మరియు శాశ్వతమైన బ్రహ్మపదాన్ని పొందే మార్గాన్ని తెలుపుతుంది.",
      sa: "प्रयाणकाले भगवत्स्मरणस्य महत्त्वं, शाश्वतस्य ब्रह्मपदस्य प्राप्तेः मार्गं च अस्मिन् अध्याये श्रीकृष्णः वर्णयति।",
    },
  },
  9: {
    title: { te: "రాజవిద్యారాజగుహ్య యోగము", sa: "राजविद्याराजगुह्ययोगः" },
    summary: { te: "పరమ గుహ్య జ్ఞానము", sa: "परमगुह्यज्ञानम्" },
    fullSummary: {
      te: "భగవద్గీతలోని అత్యంత రహస్యమైన దివ్యజ్ఞానాన్ని, భగవంతుని ఐశ్వర్యాన్ని మరియు అనన్య భక్తి యొక్క వైభవాన్ని వివరిస్తుంది.",
      sa: "भगवद्गीतायाः परमगुह्यज्ञानस्य, भगवतः ऐश्वर्यस्य, अनन्यभक्तेः महत्त्वस्य च वर्णनं अस्मिन् अध्याये कृतम्।",
    },
  },
  10: {
    title: { te: "విభూతి యోగము", sa: "विभूतियोगः" },
    summary: { te: "భగవంతుని దివ్య విభూతులు", sa: "भगद्विभूतयः" },
    fullSummary: {
      te: "సమస్త సృష్టిలో వ్యక్తమయ్యే భగవంతుని దివ్య విభూతులను మరియు ఆయన అనంత శక్తి సామర్థ్యాలను వివరిస్తుంది.",
      sa: "समस्ते जगति व्यक्तानां भगवतः दिव्यविभूतीनां तस्य अनन्तसामर्थ्यस्य च वर्णनं अस्मिन् अध्याये कृतम्।",
    },
  },
  11: {
    title: { te: "విశ్వరూపసందర్శన యోగము", sa: "विश्वरूपदर्शनयोगः" },
    summary: { te: "భగవంతుని విశ్వరూప దర్శనము", sa: "विश्वरूपदर्शनम्" },
    fullSummary: {
      te: "అర్జునునికి శ్రీకృష్ణుడు తన దివ్యమైన విశ్వరూపాన్ని ప్రదర్శించడం మరియు ఆ రూప దర్శన వైభవాన్ని వివరిస్తుంది.",
      sa: "अर्जुनस्य प्रार्थनानुसारं श्रीकृष्णः तस्मै स्वकीयं दिव्यं विश्वरूपं दर्शयति, तस्य रूपस्य वर्णनं च अस्मिन् अध्याये अस्ति।",
    },
  },
  12: {
    title: { te: "భక్తి యోగము", sa: "भक्तियोगः" },
    summary: { te: "భక్తి మార్గము", sa: "भक्तिमार्गः" },
    fullSummary: {
      te: "సాకార మరియు నిరాకార ఉపాసనల భేదాన్ని, భక్తి మార్గ విశిష్టతను మరియు ప్రియమైన భక్తుని లక్షణాలను తెలుపుతుంది.",
      sa: "सगुण-निर्गुणोपासनयोः भेदं, भक्तिमार्गस्य श्रेष्ठत्वं, भगवतः प्रियभक्तानां लक्षणानि च अध्याये वर्णितानि।",
    },
  },
  13: {
    title: { te: "క్షేత్రక్షేత్రజ్ఞవిభాగ యోగము", sa: "क्षेत्रक्षेत्रज्ञविभागयोगः" },
    summary: { te: "ప్రకృతి, పురుషుడు మరియు చేతన", sa: "प्रकृतिपुरुषविवेकः" },
    fullSummary: {
      te: "శరీరము (క్షేత్రము) మరియు ఆత్మ (క్షేత్రజ్ఞుడు) మధ్య భేదాన్ని, జ్ఞాన సాధనలను వివరిస్తుంది.",
      sa: "शरीरस्य (क्षेत्रस्य) आत्मनः (क्षेत्रज्ञस्य) च भेदं, ज्ञानस्य साधनानि च अस्मिन् अध्याये श्रीकृष्णः वर्णयति।",
    },
  },
  14: {
    title: { te: "గుణత్రయవిభాగ యోగము", sa: "गुणत्रयविभागयोगः" },
    summary: { te: "ప్రకృతి యొక్క త్రిగుణములు", sa: "प्रकृतिगुणाः" },
    fullSummary: {
      te: "సత్వ, రజో, తమో గుణాల ప్రభావాలను మరియు ఈ త్రిగుణాలను దాటి గుణాతీతుడయ్యే మార్గాన్ని వివరిస్తుంది.",
      sa: "सत्त्व-रज-तमसां त्रयाणां गुणानां प्रभावं, तान् गुणान् अतीत्य गुणातीतपदप्राप्तेः मार्गं च अस्मिन् अध्याये स्पष्टीकृतम्।",
    },
  },
  15: {
    title: { te: "పురుషోత్తమ యోగము", sa: "पुरुषोत्तमयोगः" },
    summary: { te: "పరమ పురుషుని యోగము", sa: "पुरुषोत्तमप्राप्तिः" },
    fullSummary: {
      te: "సంసార వృక్షాన్ని, క్షర-అక్షర పురుషుల భేదాన్ని మరియు సర్వోత్కృష్టుడైన పురుషోత్తముని తత్వాన్ని వివరిస్తుంది.",
      sa: "संसारवृक्षस्य स्वरूपं, क्षर-अक्षरपुरुषयोः भेदं, सर्वोपरि -पुरुषोत्तमस्य स्वरूपं च अस्मिन् अध्याये निरूपितम्।",
    },
  },
  16: {
    title: { te: "దైవాసురసంపద్విభాగ యోగము", sa: "दैवासुरसम्पद्विभागयोगः" },
    summary: { te: "దైవీ మరియు ఆసురీ స్వభావములు", sa: "दैवासुरविवेकः" },
    fullSummary: {
      te: "మనుషులలో ఉండే దైవ గుణాలను మరియు ఆసురీ లక్షణాలను వర్గీకరించి, శాస్త్ర ప్రమాణాల ప్రాముఖ్యతను తెలుపుతుంది.",
      sa: "मनुष्येषु दैवी-आसुरी सम्पदां भेदं, शास्त्राणां अनुसरणं च अध्याये श्रीकृष्णः प्रतिपादयति।",
    },
  },
  17: {
    title: { te: "శ్రద్ధాత్రయవిభాగ యోగము", sa: "श्रद्धात्रयविभागयोगः" },
    summary: { te: "శ్రద్ధ యొక్క మూడు విధములు", sa: "श्रद्धाविवेकः" },
    fullSummary: {
      te: "ఆహారము, యజ్ఞము, తపస్సు మరియు దానములలో ఉండే త్రిగుణ శ్రద్ధల భేదాలను ఈ అధ్యాయము వివరిస్తుంది.",
      sa: "आहार-यज्ञ-तप-दानेषु त्रिविधश्रद्धायाः भेदं 'ॐ तत् सत्' इति मन्त्रस्य रहस्यं च अस्मिन् अध्याये स्पष्टीकृतम्।",
    },
  },
  18: {
    title: { te: "మోక్షసన్న్యాస యోగము", sa: "मोक्षसंन्यासयोगः" },
    summary: { te: "మోక్ష మార్గము మరియు సన్న్యాసము", sa: "परमसंन्यासः / मोक्षः" },
    fullSummary: {
      te: "గీత యొక్క సారాంశముగా కర్మ సన్యాస త్యాగములను, వర్ణ ధర్మాలను మరియు సర్వధర్మాలను త్యజించి శరణాగతి పొందడాన్ని తెలుపుతుంది.",
      sa: "भगवद्गीतायाः साररूपेण संन्यास-त्यागयोः भेदं, वर्णाश्रमधर्मान्, सर्वधर्मान् परित्यज्य शरणगतिप्राप्तिं च अस्मिन् अध्याये श्रीकृष्णः संक्षिपति।",
    },
  },
};

// 1. Fetch all chapters locally (enriched with high-fidelity dynamic localizations for Telugu and Sanskrit)
export function useChapters() {
  return useQuery<Chapter[]>({
    queryKey: ["chapters"],
    queryFn: async () => {
      const baseChapters = (gitaProcessedData as any).chapters || [];
      return baseChapters.map((c: any) => {
        const trans = CHAPTER_TRANSLATIONS[c.chapter_number];
        return {
          ...c,
          title: {
            ...c.title,
            te: trans?.title.te || c.title.te || c.title.en,
            sa: trans?.title.sa || c.title.sa || c.title.en,
          },
          summary: {
            ...c.summary,
            te: trans?.summary.te || c.summary.te || c.summary.en,
            sa: trans?.summary.sa || c.summary.sa || c.summary.en,
          },
          fullSummary: {
            ...c.fullSummary,
            te: trans?.fullSummary.te || c.fullSummary.te || c.fullSummary.en,
            sa: trans?.fullSummary.sa || c.fullSummary.sa || c.fullSummary.en,
          },
        };
      });
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
