const fs = require('fs');

const generatedTranslations = {
  remindersTitle: { en: "Reminders", hi: "अनुस्मारक", te: "రిమైండర్‌లు", sa: "स्मरणानि" },
  updatesTitle: { en: "Updates", hi: "अपडेट", te: "నవీకరణలు", sa: "अद्यतनानि" },
  quotesTitle: { en: "Quotes", hi: "सुविचार", te: "సుభాషితాలు", sa: "वचनानि" },
  achievementsTitle: { en: "Achievements", hi: "उपलब्धियां", te: "విజయాలు", sa: "प्राप्तयः" },
  Today: { en: "Today", hi: "आज", te: "ఈరోజు", sa: "अद्य" },
  ThisWeek: { en: "This Week", hi: "इस सप्ताह", te: "ఈ వారం", sa: "अस्मिन् सप्ताहे" },
  Earlier: { en: "Earlier", hi: "पहले", te: "ఇంతకు ముందు", sa: "पूर्वम्" },
  DailyReminder: { en: "Daily Reminder", hi: "दैनिक अनुस्मारक", te: "రోజువారీ రిమైండర్", sa: "दैनिक स्मरणम्" },
  TimetoreadyourGitafortoday: { en: "Time to read your Gita for today.", hi: "आज के लिए अपनी गीता पढ़ने का समय आ गया है।", te: "ఈరోజు మీ గీతను చదివే సమయం ఆసన్నమైంది.", sa: "अद्यतन गीता पठनस्य समयः जातः।" },
  ContinueReading: { en: "Continue Reading", hi: "पठन जारी रखें", te: "పఠనం కొనసాగించండి", sa: "पठनम् अनुवर्तताम्" },
  NewVerseofWisdom: { en: "New Verse of Wisdom", hi: "ज्ञान का नया श्लोक", te: "కొత్త జ్ఞాన శ్లోకం", sa: "नूतन ज्ञान श्लोकः" },
  Anewverseiswaitingforyou: { en: "A new verse is waiting for you.", hi: "एक नया श्लोक आपकी प्रतीक्षा कर रहा है।", te: "ఒక కొత్త శ్లోకం మీకోసం వేచి ఉంది.", sa: "एकः नूतनः श्लोकः भवतः प्रतीक्षां करोति।" },
  BhagavadGita247: { en: "Bhagavad Gita 2.47", hi: "भगवद गीता २.४७", te: "భగవద్గీత 2.47", sa: "भगवद्गीता २.४७" },
  AchievementUnlocked: { en: "Achievement Unlocked!", hi: "उपलब्धि हासिल की!", te: "విజయం సాధించారు!", sa: "प्राप्तिः सिद्धा!" },
  Youvecompleted7daysofreading: { en: "You've completed 7 days of reading.", hi: "आपने 7 दिन का पठन पूरा कर लिया है।", te: "మీరు 7 రోజుల పఠనాన్ని పూర్తి చేసారు.", sa: "भवता ७ दिनानां पठनं पूर्णं कृतम्।" },
  Keepgoing: { en: "Keep going!", hi: "जारी रखें!", te: "కొనసాగించండి!", sa: "अग्रे सरतु!" },
  UpcomingReminder: { en: "Upcoming Reminder", hi: "आगामी अनुस्मारक", te: "రాబోయే రిమైండర్", sa: "आगामि स्मरणम्" },
  Getreadyforyourreadingtimetomorrow: { en: "Get ready for your reading time tomorrow.", hi: "कल अपने पठन के समय के लिए तैयार रहें।", te: "రేపు మీ పఠన సమయానికి సిద్ధంగా ఉండండి.", sa: "श्वः पठनार्थं सज्जः भवतु।" },
  Dailyat700AM: { en: "Daily at 7:00 AM", hi: "प्रतिदिन सुबह 7:00 बजे", te: "ప్రతిరోజూ ఉదయం 7:00 గంటలకు", sa: "प्रतिदिनं प्रातः ७:०० वादने" },
  ChapterCompleted: { en: "Chapter Completed", hi: "अध्याय पूरा हुआ", te: "అధ్యాయం పూర్తయింది", sa: "अध्यायः पूर्णः" },
  GreatjobYouvecompletedChapter1: { en: "Great job! You've completed Chapter 1.", hi: "बहुत बढ़िया! आपने अध्याय 1 पूरा कर लिया है।", te: "చాలా బాగుంది! మీరు అధ్యాయం 1 పూర్తి చేసారు.", sa: "उत्तमम्! भवता प्रथमः अध्यायः पूर्णः कृतः।" },
  ArjunaViadaYoga: { en: "Arjuna Viṣāda Yoga", hi: "अर्जुन विषाद योग", te: "అర్జున విషాద యోగం", sa: "अर्जुन विषाद योगः" },
  SharetheWisdom: { en: "Share the Wisdom", hi: "ज्ञान साझा करें", te: "జ్ఞానాన్ని పంచుకోండి", sa: "ज्ञानं प्रसारयन्तु" },
  Inspireothersbysharingaverse: { en: "Inspire others by sharing a verse.", hi: "एक श्लोक साझा करके दूसरों को प्रेरित करें।", te: "ఒక శ్లోకాన్ని పంచుకోవడం ద్వారా ఇతరులకు స్ఫూర్తినివ్వండి.", sa: "एकं श्लोकं प्रसार्य अन्यान् प्रेरयन्तु।" },
  ShareNow: { en: "Share Now", hi: "अभी साझा करें", te: "ఇప్పుడే పంచుకోండి", sa: "अधुना प्रसारयन्तु" },
  WhatsNew: { en: "What's New", hi: "नया क्या है", te: "కొత్తగా ఏముంది", sa: "नूतनम् किम्" },
  ExplorenewfeaturesinEasyGita: { en: "Explore new features in Gita Sadhana.", hi: "गीता साधना में नई सुविधाएँ खोजें।", te: "గీతా సాధనలో కొత్త ఫీచర్లను అన్వేషించండి.", sa: "गीता साधनायां नूतनानि अङ्गानि अन्वेषयन्तु।" },
  Seewhatsnew: { en: "See what's new", hi: "देखें नया क्या है", te: "కొత్తగా ఏముందో చూడండి", sa: "नूतनम् किं पश्यन्तु" }
};

const generatedAdditionalTranslations = {};
for (const [key, value] of Object.entries(generatedTranslations)) {
  generatedAdditionalTranslations[key] = {
    kn: value.en, ml: value.en, bn: value.en, gu: value.en, mr: value.en, pa: value.en, ta: value.en
  };
}

let content = fs.readFileSync('src/lib/i18n.ts', 'utf8');

let appendTranslationsStr = "";
for (const [key, val] of Object.entries(generatedTranslations)) {
  if (!content.includes(`"${key}": {`) && !content.includes(`${key}: {`)) {
    appendTranslationsStr += `  "${key}": ${JSON.stringify(val, null, 4).split('\n').join('\n  ')},\n`;
  }
}

let appendAdditionalTranslationsStr = "";
for (const [key, val] of Object.entries(generatedAdditionalTranslations)) {
  if (!content.includes(`"${key}": {`) && !content.includes(`${key}: {`)) {
    appendAdditionalTranslationsStr += `  "${key}": ${JSON.stringify(val, null, 4).split('\n').join('\n  ')},\n`;
  }
}

// Find insertion point for translations
const translationsMatch = content.match(/export const translations:.*?\{/);
if (translationsMatch) {
  content = content.replace(
    translationsMatch[0],
    translationsMatch[0] + '\n' + appendTranslationsStr
  );
}

// Find insertion point for additionalTranslations
const additionalTranslationsMatch = content.match(/export const additionalTranslations:.*?\{/);
if (additionalTranslationsMatch) {
  content = content.replace(
    additionalTranslationsMatch[0],
    additionalTranslationsMatch[0] + '\n' + appendAdditionalTranslationsStr
  );
}

fs.writeFileSync('src/lib/i18n.ts', content);
console.log("Successfully patched i18n.ts");
