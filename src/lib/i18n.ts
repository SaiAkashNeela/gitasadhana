export type SupportedLanguage = "en" | "hi" | "te" | "sa";

export const translations: Record<string, Record<SupportedLanguage, string>> = {
  // Navigation Tabs
  home: {
    en: "Home",
    hi: "मुख्यपृष्ठ",
    te: "హోమ్",
    sa: "गृहम्",
  },
  chapters: {
    en: "Chapters",
    hi: "अध्याय",
    te: "అధ్యాయాలు",
    sa: "अध्यायाः",
  },
  wisdom: {
    en: "Wisdom",
    hi: "दिव्य ज्ञान",
    te: "జ్ఞానం",
    sa: "ज्ञानम्",
  },
  saved: {
    en: "Saved",
    hi: "संरक्षित",
    te: "భద్రపరచినవి",
    sa: "संरक्षितम्",
  },
  profile: {
    en: "Profile",
    hi: "प्रोफ़ाइल",
    te: "ప్రొఫైల్",
    sa: "विवरणम्",
  },

  // Headers & Global UI
  settings: {
    en: "Settings",
    hi: "सेटिंग्स",
    te: "సెట్టింగులు",
    sa: "संयोजनाः",
  },
  offlineLibrary: {
    en: "Offline Library",
    hi: "ऑफ़लाइन पुस्तकालय",
    te: "ఆఫ్‌లైన్ లైబ్రరీ",
    sa: "पुस्तकालयः",
  },
  dashboardAndSettings: {
    en: "Dashboard & Settings",
    hi: "डैशबोर्ड और सेटिंग्स",
    te: "డాష్‌బోర్డ్ & సెట్టింగులు",
    sa: "फलकम् च संयोजनाः",
  },
  dailyReminder: {
    en: "Daily Reminder",
    hi: "दैनिक अनुस्मारक",
    te: "రోజువారీ రిమైండర్",
    sa: "दैनिक स्मरणम्",
  },

  // Streaks & Stats
  streak: {
    en: "Streak",
    hi: "नियमितता",
    te: "స్ట్రీక్",
    sa: "नैरन्तर्यम्",
  },
  verses: {
    en: "Verses",
    hi: "श्लोक",
    te: "శ్లోకాలు",
    sa: "श्लोकाः",
  },
  minutes: {
    en: "Minutes",
    hi: "मिनट",
    te: "నిమిషాలు",
    sa: "निमेषाः",
  },
  streaksSub: {
    en: "Streak count",
    hi: "दैनिक निरंतरता",
    te: "స్ట్రీక్ గణన",
    sa: "नैरन्तर्यम्",
  },
  versesReadSub: {
    en: "Verses read",
    hi: "पढ़े गए श्लोक",
    te: "చదివిన శ్లోకాలు",
    sa: "पठिताः श्लोकाः",
  },
  minutesReadSub: {
    en: "Minutes spent",
    hi: "कुल समय (मिनट)",
    te: "గడిపిన సమయం",
    sa: "पठित समयः",
  },

  // Section titles
  readingSettings: {
    en: "Reading Settings",
    hi: "पठन सेटिंग्स",
    te: "పఠన సెట్టింగులు",
    sa: "पठन संयोजनाः",
  },
  practiceTools: {
    en: "Practice & Tools",
    hi: "साधना व उपकरण",
    te: "సాధన & సాధనాలు",
    sa: "साधना उपकरणाः",
  },
  notesAndReflections: {
    en: "Notes & Reflections",
    hi: "टिप्पणी और विचार",
    te: "గమనికలు & ఆలోచనలు",
    sa: "टिप्पणी च चिन्तनम्",
  },
  readingHistory: {
    en: "Reading history",
    hi: "पठन इतिहास",
    te: "పఠన చరిత్ర",
    sa: "पठन इतिहासः",
  },
  downloads: {
    en: "Downloads",
    hi: "डाउनलोड्स",
    te: "డౌన్‌లోడ్‌లు",
    sa: "अवरोहणम्",
  },
  dailyJourney: {
    en: "Daily journey",
    hi: "दैनिक यात्रा",
    te: "రోజువారీ ప్రయాణం",
    sa: "दैनिक यात्रा",
  },
  theme: {
    en: "Theme",
    hi: "थीम",
    te: "థీమ్",
    sa: "वर्णक्रमः",
  },
  language: {
    en: "Language",
    hi: "भाषा",
    te: "భాష",
    sa: "भाषा",
  },

  // Authentication & Progress Backup
  backupProgressTitle: {
    en: "Backup your progress",
    hi: "अपनी प्रगति सुरक्षित करें",
    te: "మీ ప్రగతిని బ్యాకప్ చేయండి",
    sa: "प्रगतिं संरक्षतु",
  },
  backupProgressSub: {
    en: "Sign in to back up your streaks, bookmarks, and reflections to the cloud.",
    hi: "क्लाउड पर अपनी लकीरें, बुकमार्क और विचार सुरक्षित करने के लिए साइन इन करें।",
    te: "మీ స్ట్రీక్స్, బుక్‌మార్క్‌లు మరియు ఆలోచనలను క్లౌడ్‌లో బ్యాకప్ చేయడానికి సైన్ ఇన్ చేయండి.",
    sa: "स्वकीय प्रगतिं मेघपटले संरक्षितुं प्रवेशं करोतु।",
  },
  continueWithGoogle: {
    en: "Continue with Google",
    hi: "गूगल के साथ जारी रखें",
    te: "గూగుల్‌తో కొనసాగించండి",
    sa: "गूगल द्वारा अग्रे सरतु",
  },
  continueWithApple: {
    en: "Sign in with Apple",
    hi: "एप्पल के साथ साइन इन करें",
    te: "యాపిల్‌తో సైన్ ఇన్ చేయండి",
    sa: "एप्पल द्वारा अग्रे सरतु",
  },
  signOut: {
    en: "Sign out",
    hi: "लॉग आउट करें",
    te: "సైన్ అవుట్",
    sa: "निर्गमनम्",
  },

  // Daily Reminder Config page
  gentleReminder: {
    en: "Gentle reminder",
    hi: "मधुर स्मरण पत्र",
    te: "మధురమైన రిమైండర్",
    sa: "कोमल स्मरणम्",
  },
  dailyNudge: {
    en: "A daily nudge to read one verse",
    hi: "प्रतिदिन एक श्लोक पढ़ने की प्रेरणा",
    te: "రోజుకో శ్లోకం చదవడానికి చిన్న ప్రేరణ",
    sa: "प्रतिदिनं एकश्लोक पठनाय प्रेरणा",
  },
  timeLabel: {
    en: "Time",
    hi: "समय",
    te: "సమయం",
    sa: "समयः",
  },
  saveReminderBtn: {
    en: "Save reminder",
    hi: "अनुस्मारक सुरक्षित करें",
    te: "రిమైండర్ సేవ్ చేయండి",
    sa: "स्मरणं संरक्षतु",
  },
  dailyCommitmentTitle: {
    en: "Daily Commitment",
    hi: "दैनिक संकल्प",
    te: "రోజువారీ సంకల్పం",
    sa: "दैनिक सङ्कल्पः",
  },
  dailyCommitmentSub: {
    en: "Your daily reminder will trigger every day to help you build a consistent meditation streak.",
    hi: "आपकी दैनिक निरंतरता बनाए रखने के लिए यह अनुस्मारक प्रतिदिन बज उठेगा।",
    te: "మీరు స్థిరమైన ధ్యాన సాధనను నిర్మించడంలో సహాయపడటానికి మీ రోజువారీ రిమైండర్ ప్రతిరోజూ పనిచేస్తుంది.",
    sa: "भवतः दैनिक नैरन्तर्याय एतत् स्मरणं प्रतिदिनं प्रचालयिष्यति।",
  },

  // Offline / Downloads Tab
  localStorageTitle: {
    en: "Local Storage",
    hi: "स्थानीय भंडारण",
    te: "లోకల్ స్టోరేజ్",
    sa: "स्थानीय कोशः",
  },
  usedSpace: {
    en: "used",
    hi: "उपयोग हुआ",
    te: "ఉపయోగించబడింది",
    sa: "उपयुक्तम्",
  },
  versesOffline: {
    en: "verses offline",
    hi: "श्लोक ऑफ़लाइन",
    te: "శ్లోకాలు ఆఫ్‌లైన్",
    sa: "श्लोकाः ऑफ़लाइन",
  },
  fullGitaOffline: {
    en: "Full Gita Offline",
    hi: "संपूर्ण गीता ऑफ़लाइन",
    te: "పూర్తి గీత ఆఫ్‌లైన్",
    sa: "सम्पूर्ण गीता ऑफ़लाइन",
  },
  myLibrary: {
    en: "My Library",
    hi: "मेरा पुस्तकालय",
    te: "నా లైబ్రరీ",
    sa: "मम पुस्तकालयः",
  },
  browseAndDownload: {
    en: "Browse & Download",
    hi: "खोजें और डाउनलोड करें",
    te: "బ్రౌజ్ & డౌన్‌లోడ్",
    sa: "अन्वेषणं च अवरोहणम्",
  },
  downloadCompleteGita: {
    en: "Download Complete Gita",
    hi: "संपूर्ण गीता डाउनलोड करें",
    te: "పూర్తి గీతను డౌన్‌లోడ్ చేయండి",
    sa: "सम्पूर्ण गीता अवरोहणम्",
  },
  fullGitaAudioTitle: {
    en: "Full Bhagavad Gita Audio",
    hi: "संपूर्ण भगवद गीता ऑडियो",
    te: "పూర్తి భగవద్గీత ఆడియో",
    sa: "सम्पूर्ण भगवद्गीता स्वरः",
  },
  fullGitaAudioDesc: {
    en: "Download the complete audio recitation of all 18 chapters and 700 verses in Sanskrit for offline meditation.",
    hi: "ऑफ़लाइन ध्यान के लिए संस्कृत में सभी 18 अध्यायों और 700 श्लोकों का संपूर्ण पाठ डाउनलोड करें।",
    te: "ఆఫ్‌లైన్ ధ్యానం కోసం సంస్కృతంలో మొత్తం 18 అధ్యాయాలు మరియు 700 శ్లోకాల పూర్తి ఆడియోను డౌన్‌లోడ్ చేయండి.",
    sa: "ऑफ़लाइन ध्यानार्थं संस्कृते सर्वे १८ अध्यायाः ७०० श्लोकाः च अवरोहणम् कुर्वन्तु।",
  },

  // Audio Player Controls
  nowPlaying: {
    en: "Now Playing",
    hi: "अब चल रहा है",
    te: "ఇప్పుడు ప్లే అవుతోంది",
    sa: "अधुना प्रचलति",
  },
  upNext: {
    en: "UP NEXT",
    hi: "आगे",
    te: "తరువాత",
    sa: "अग्रिमः",
  },
  playbackSpeed: {
    en: "Playback speed",
    hi: "पठन गति",
    te: "ప్లేబ్యాక్ వేగం",
    sa: "पठन गतिः",
  },
  savedOfflineToast: {
    en: "Saved offline",
    hi: "ऑफ़लाइन सहेजा गया",
    te: "ఆఫ్‌లైన్‌లో సేవ్ చేయబడింది",
    sa: "ऑफ़लाइन रक्षितम्",
  },

  // Verse Details
  translation: {
    en: "Translation",
    hi: "अनुवाद",
    te: "అనువాదం",
    sa: "अनुवादः",
  },
  transliteration: {
    en: "Transliteration",
    hi: "लिप्यंतरण",
    te: "లిప్యంతరీకరణ",
    sa: "लिप्यन्तरणम्",
  },
  reflectionAndEssence: {
    en: "Reflection & Essence",
    hi: "गहन व्याख्या व सार",
    te: "వివరణ మరియు సారాంశం",
    sa: "चिन्तनम् च सारः",
  },
  wordMeaningsBtn: {
    en: "Word meanings →",
    hi: "शब्दार्थ →",
    te: "పదాల అర్థాలు →",
    sa: "शब्दार्थः →",
  },
  chooseLanguageTitle: {
    en: "Choose your language",
    hi: "अपनी भाषा चुनें",
    te: "మీ భాషను ఎంచుకోండి",
    sa: "स्वभाषां चिनोतु",
  },
  chooseLanguageSub: {
    en: "You can change this anytime in Settings",
    hi: "आप इसे सेटिंग्स में कभी भी बदल सकते हैं",
    te: "మీరు దీన్ని సెట్టింగులలో ఎప్పుడైనా మార్చవచ్చు",
    sa: "संयोजनासु इमाम् कदापि परिवर्तयितुं शक्नुवन्ति",
  },
  continueBtn: {
    en: "Continue",
    hi: "जारी रखें",
    te: "కొనసాగించు",
    sa: "अग्रे सरतु",
  },
  offlineLibrarySub: {
    en: "Read & listen without internet",
    hi: "बिना इंटरनेट के पढ़ें और सुनें",
    te: "ఇంటర్నెట్ లేకుండా చదవండి & వినండి",
    sa: "अन्तर्जालं विना पठन्तु शृण्वन्तु च",
  },
  lightMode: {
    en: "Light",
    hi: "लाइट",
    te: "లైట్",
    sa: "शुभ्रः",
  },
  darkMode: {
    en: "Dark",
    hi: "डार्क",
    te: "డార్క్",
    sa: "श्यामः",
  },
  tracks: {
    en: "tracks",
    hi: "ट्रैक्स",
    te: "ట్రాక్‌లు",
    sa: "स्वराः",
  },
  // Journey Screen
  yourJourney: {
    en: "Your Journey",
    hi: "आपकी यात्रा",
    te: "మీ ప్రయాణం",
    sa: "भवतः यात्रा",
  },
  dayStreak: {
    en: "day streak",
    hi: "दिन की निरंतरता",
    te: "రోజుల స్ట్రీక్",
    sa: "दिवसानां नैरन्तर्यम्",
  },
  daysStreakCount: {
    en: "days",
    hi: "दिन",
    te: "రోజులు",
    sa: "दिवसाः",
  },
  readTime: {
    en: "Read time",
    hi: "पठन समय",
    te: "చదివిన సమయం",
    sa: "पठित कालः",
  },
  last14Days: {
    en: "Last 14 days",
    hi: "पिछले १४ दिन",
    te: "గత 14 రోజులు",
    sa: "विगत १४ दिवसाः",
  },
  everyMorningAt: {
    en: "Every morning at",
    hi: "हर सुबह",
    te: "ప్రతి ఉదయం",
    sa: "प्रति प्रातः काले",
  },
  disabled: {
    en: "Disabled",
    hi: "निष्क्रिय",
    te: "నిలిపివేయబడింది",
    sa: "निष्क्रियम्",
  },

  // Saved Screens
  savedWisdom: {
    en: "Saved Wisdom",
    hi: "संरक्षित ज्ञान",
    te: "భద్రపరిచిన జ్ఞానం",
    sa: "संरक्षितं ज्ञानम्",
  },
  verseSaves: {
    en: "Verse Saves",
    hi: "संरक्षित श्लोक",
    te: "భద్రపరిచిన శ్లోకాలు",
    sa: "संरक्षिताः श्लोकाः",
  },
  wisdomSaves: {
    en: "Wisdom Saves",
    hi: "संरक्षित विचार",
    te: "భద్రపరిచిన జ్ఞానాలు",
    sa: "संरक्षिताः विचाराः",
  },
  noSavedBookmarks: {
    en: "No saved bookmarks",
    hi: "कोई बुकमार्क संरक्षित नहीं",
    te: "సేవ్ చేసిన బుక్‌మార్క్‌లు లేవు",
    sa: "न किमपि संरक्षितं पुस्तकचिह्नम्",
  },
  noSavedBookmarksSub: {
    en: "Tap the bookmark icon on any verse to keep it close.",
    hi: "श्लोकों को अपने पास रखने के लिए बुकमार्क आइकन दबाएं।",
    te: "శ్లోకాలను దగ్గరగా ఉంచుకోవడానికి బుక్‌మార్క్ చిహ్నాన్ని నొక్కండి.",
    sa: "श्लोकान् स्वसमीपे स्थापयितुं पुस्तकचिह्नं नुदन्तु।",
  },
  noFavorites: {
    en: "No favorites yet",
    hi: "अभी तक कोई पसंदीदा नहीं",
    te: "ఇంకా ఇష్టమైనవి లేవు",
    sa: "न किमपि प्रियतम्",
  },
  noFavoritesSub: {
    en: "Tap the heart icon on any verse or player to add it here.",
    hi: "श्लोक या प्लेयर पर पसंदीदा (दिल) आइकन दबाकर यहाँ जोड़ें।",
    te: "ఏదైనా శ్లోకం లేదా ప్లేయర్‌లో గుండె చిహ్నాన్ని నొక్కడం ద్వారా ఇక్కడ జోడించవచ్చు.",
    sa: "कस्मिंश्चित् श्लोके वा क्रीडके हृदयचिह्नं नुदन्तु।",
  },
  favorites: {
    en: "Favorites",
    hi: "पसंदीदा",
    te: "ఇష్టమైనవి",
    sa: "प्रियतमाः",
  },
  noReflections: {
    en: "No reflections yet",
    hi: "अभी तक कोई विचार नहीं",
    te: "ఇంకా ఆలోచనలు లేవు",
    sa: "न किमपि चिन्तनम्",
  },
  noReflectionsSub: {
    en: "Write your first thought above — even one line is enough.",
    hi: "अपना पहला विचार ऊपर लिखें — एक पंक्ति भी पर्याप्त है।",
    te: "మీ మొదటి ఆలోచనను పైన రాయండి — ఒక్క లైన్ అయినా చాలు.",
    sa: "स्वकीयप्रथमं विचारं उपरि लिखतु — एका पङ्क्तिः अपि पर्याप्ता।",
  },
  writeReflectionPlaceholder: {
    en: "A thought, a feeling, a question…",
    hi: "एक विचार, एक भावना, एक प्रश्न...",
    te: "ఒక ఆలోచన, ఒక అనుభూతి, ఒక ప్రశ్న...",
    sa: "एकः विचारः, एका भावना, एकः प्रश्नः...",
  },
  saveBtn: {
    en: "Save",
    hi: "सुरक्षित करें",
    te: "సేవ్",
    sa: "रक्षतु",
  },
  deletedNoteToast: {
    en: "Deleted reflection",
    hi: "विचार हटा दिया गया",
    te: "ఆలోచన తొలగించబడింది",
    sa: "विचारः निष्कासितः",
  },
  reflectionSavedToast: {
    en: "Reflection saved",
    hi: "विचार सुरक्षित किया गया",
    te: "ఆలోచన सेवे किया गया",
    sa: "चिन्तनं रक्षितम्",
  },
  historyEmpty: {
    en: "Your history is clear. Begin reading a verse!",
    hi: "आपका इतिहास रिक्त है। श्लोक पढ़ना शुरू करें!",
    te: "మీ పఠన చరిత్ర ఖాళీగా ఉంది. శ్లోకం చదవడం ప్రారంభించండి!",
    sa: "भवतः इतिहासः रिक्तः अस्ति। श्लोक पठनं आरभताम्!",
  },
  chapterLabel: {
    en: "Chapter",
    hi: "अध्याय",
    te: "అధ్యాయం",
    sa: "अध्यायः",
  },
  verseLabel: {
    en: "Verse",
    hi: "श्लोक",
    te: "శ్లోకం",
    sa: "श्लोकः",
  },

  // Wisdom Screen & Themes
  dailyWisdom: {
    en: "Daily wisdom",
    hi: "दैनिक सुविचार",
    te: "రోజువారీ సుభాషితం",
    sa: "दैनिक सुभाषितम्",
  },
  exploreByTheme: {
    en: "Explore by theme",
    hi: "विषय के अनुसार खोजें",
    te: "విషయం ఆధారంగా అన్వేషించండి",
    sa: "विषयानुसारं अन्वेषणं",
  },
  curatedThemesCount: {
    en: "6 curated themes",
    hi: "६ चुनिंदा विषय",
    te: "6 ఎంచుకున్న విషయాలు",
    sa: "६ विषयाः",
  },
  gitaQuote: {
    en: "Gita Quote",
    hi: "गीता वचन",
    te: "గీతా వాక్యం",
    sa: "गीता वचनम्",
  },
  addedToFavoritesToast: {
    en: "Added to favorites",
    hi: "पसंदीदा में जोड़ा गया",
    te: "ఇష్టమైన వాటిలో చేర్చబడింది",
    sa: "प्रियतमेषु योजितम्",
  },
  sharedSuccessfullyToast: {
    en: "Shared successfully",
    hi: "सफलतापूर्वक साझा किया गया",
    te: "విజయవంతంగా భాగస్వామ్యం చేయబడింది",
    sa: "सफलतापूर्वक प्रेषितम्",
  },
  wisdomThemesTitle: {
    en: "Themes",
    hi: "दिव्य विषय",
    te: "విషయాలు",
    sa: "विषयाः",
  },
  wisdomThemesSubtitle: {
    en: "Wisdom organized by what you seek",
    hi: "ज्ञान आपकी खोज के आधार पर व्यवस्थित",
    te: "మీరు కోరుకునేదాని ఆధారంగా క్రమబద్ధీకరించిన జ్ఞానం",
    sa: "भवतः आवश्यकतानुसारं सुव्यवस्थितं ज्ञानम्",
  },

  // Theme changing toasts
  themeChangedToast: {
    en: "mode enabled",
    hi: "मोड सक्रिय किया गया",
    te: "మోడ్ ప్రారంభించబడింది",
    sa: "सक्रियम्",
  },

  // Theme titles translated
  t1: {
    en: "On Duty",
    hi: "कर्तव्य मार्ग",
    te: "కర్తవ్యం",
    sa: "कर्तव्यम्",
  },
  t2: {
    en: "On Detachment",
    hi: "वैराग्य भाव",
    te: "వైరాగ్యం",
    sa: "वैराग्यम्",
  },
  t3: {
    en: "On Devotion",
    hi: "भक्ति योग",
    te: "భక్తి",
    sa: "भक्तिः",
  },
  t4: {
    en: "On Meditation",
    hi: "ध्यान योग",
    te: "ధ్యానం",
    sa: "ध्यानम्",
  },
  t5: {
    en: "On The Soul",
    hi: "आत्मा का स्वरूप",
    te: "ఆత్మ",
    sa: "आत्मा",
  },
  t6: {
    en: "On Liberation",
    hi: "मोक्ष मार्ग",
    te: "మోక్షం",
    sa: "मोक्षः",
  },
  todaysVerse: {
    en: "Today's Verse",
    hi: "आज का श्लोक",
    te: "ఈరోజు శ్లోకం",
    sa: "अद्यतनः श्लोकः",
  },
  viewBtn: {
    en: "View",
    hi: "देखें",
    te: "చూడండి",
    sa: "पश्यतु",
  },
  continueReading: {
    en: "Continue Reading",
    hi: "पठन जारी रखें",
    te: "పఠనం కొనసాగించండి",
    sa: "पठनम् अनुवर्तताम्",
  },
  allBtn: {
    en: "All",
    hi: "सभी",
    te: "అన్నీ",
    sa: "सर्वाणि",
  },
  exploreBtn: {
    en: "Explore",
    hi: "खोजें",
    te: "అన్వేషించండి",
    sa: "अन्वेषणं करोतु",
  },
  wisdomForToday: {
    en: "Wisdom for Today",
    hi: "आज का सुविचार",
    te: "ఈరోజు సుభాషితం",
    sa: "अद्यतनं ज्ञानम्",
  },
  beginChapterBtn: {
    en: "Begin Chapter",
    hi: "अध्याय प्रारंभ करें",
    te: "అధ్యాయం ప్రారంభించండి",
    sa: "अध्यायस्य आरम्भः",
  },
  chapterOfflineBtn: {
    en: "Chapter Offline (Click to Delete)",
    hi: "ऑफ़लाइन अध्याय (हटाने के लिए दबाएं)",
    te: "ఆఫ్‌లైన్ అధ్యాయం (తొలగించడానికి నొక్కండి)",
    sa: "ऑफ़लाइन अध्यायः (निष्कासनाय नुदन्तु)",
  },
  downloadingChapterBtn: {
    en: "Downloading Chapter Audio",
    hi: "अध्याय ऑडियो डाउनलोड हो रहा है",
    te: "అధ్యాయం ఆడియో డౌన్‌లోడ్ అవుతోంది",
    sa: "अध्याय स्वरस्य अवरोहणम् प्रचलति",
  },
  downloadChapterBtn: {
    en: "Download Chapter Audio",
    hi: "अध्याय ऑडियो डाउनलोड करें",
    te: "అధ్యాయం ఆడియో డౌన్‌లోడ్ చేయండి",
    sa: "अध्याय स्वरस्य अवरोहणम् करोतु",
  },
  readLabel: {
    en: "Read",
    hi: "पढ़ा गया",
    te: "చదివినవి",
    sa: "पठितम्",
  },
  lengthLabel: {
    en: "Length",
    hi: "अवधि",
    te: "వ్యవధి",
    sa: "कालमानम्",
  },
  searchTitle: {
    en: "Search",
    hi: "खोजें",
    te: "వెతకండి",
    sa: "अन्वेषणम्",
  },
  searchPlaceholder: {
    en: "Search verses, words, themes…",
    hi: "श्लोक, शब्द, या विषय खोजें...",
    te: "శ్లోకాలు, పదాలు, విషయాలు వెతకండి...",
    sa: "श्लोकान्, शब्दान्, विषयान् अन्वेषयतु...",
  },
  suggestedLabel: {
    en: "Suggested",
    hi: "सुझाए गए",
    te: "సూచించబడినవి",
    sa: "सुझापिताः",
  },
  recentLabel: {
    en: "Recent",
    hi: "हाल ही में",
    te: "ఇటీవలివి",
    sa: "नूतनाः",
  },
  versesFound: {
    en: "verses found",
    hi: "श्लोक मिले",
    te: "శ్లోకాలు కనుగొనబడ్డాయి",
    sa: "श्लोकाः प्राप्ताः",
  },
  nothingYet: {
    en: "Nothing yet",
    hi: "अभी कुछ नहीं मिला",
    te: "ఇंका ఏమీ లేదు",
    sa: "अद्यापि न किमपि",
  },
  tryDifferentWord: {
    en: "Try a different word — perhaps a feeling or a theme.",
    hi: "कोई दूसरा शब्द आज़माएं — जैसे कोई भावना या विषय।",
    te: "మరో పదం ప్రయత్నించండి — బహుశా ఒక అనుభూతి లేదా విషయం.",
    sa: "अन्यं शब्दं प्रयतताम् — काचित् भावना वा विषयः।",
  },
  leftOffAtVerse: {
    en: "You left off at Verse",
    hi: "आपने श्लोक पर पढ़ना छोड़ा",
    te: "మీరు శ్లోకం వద్ద ఆపివేసారు",
    sa: "भवतः श्लोके विरामाः",
  },
  viewAll: {
    en: "View All",
    hi: "सभी देखें",
    te: "అన్నీ చూడండి",
    sa: "सर्वं पश्यतु",
  },
  sloganTitle: {
    en: "Timeless wisdom. For everyday life.",
    hi: "शाश्वत ज्ञान। दैनिक जीवन के लिए।",
    te: "శాశ్వత జ్ఞానం. రోజువారీ జీవితం కోసం.",
    sa: "शाश्वत ज्ञानम्। दैनिक जीवनाय।",
  },
  sloganDesc: {
    en: "Explore the teachings of the Bhagavad Gita and bring clarity, peace and purpose to your life.",
    hi: "भगवद गीता की शिक्षाओं का अन्वेषण करें और अपने जीवन में स्पष्टता, शांति और उद्देश्य लाएं।",
    te: "భగవద్గీత బోధనలను అన్వేషించండి మరియు మీ జీవితంలో స్పష్టత, శాంతి మరియు ప్రయోజనాన్ని తీసుకురండి.",
    sa: "भगవद्गीतायाः उपदेशान् अन्वेषयन्तु तथा स्वकीये जीवने स्पष्टता, शान्तिं च आनयन्तु।",
  },
  wisdomForLife: {
    en: "Wisdom for Life",
    hi: "जीवन के लिए ज्ञान",
    te: "జీవితం కోసం జ్ఞానం",
    sa: "जीवनाय ज्ञानम्",
  },
  recitationAndCommentary: {
    en: "Sanskrit Recitation & Commentary",
    hi: "संस्कृत पाठ और व्याख्या",
    te: "సంస్కృత పఠనం & వ్యాఖ్యానం",
    sa: "संस्कृत पठनं च व्याख्या",
  },
  noAudioLoaded: {
    en: "No audio loaded",
    hi: "कोई ऑडियो लोड नहीं",
    te: "ఆడియో లోడ్ కాలేదు",
    sa: "न किमपि स्वरं लोड अस्ति",
  },
  browseGitaToListen: {
    en: "Browse the Gita and select 'Listen' on any verse to start playback.",
    hi: "गीता को खोजें और प्लेबैक शुरू करने के लिए किसी भी श्लोक पर 'सुनें' चुनें।",
    te: "గీతను బ్రౌజ్ చేయండి మరియు ప్లేబ్యాక్ ప్రారంభించడానికి ఏదైనా శ్లోకంపై 'వినండి' ఎంచుకోండి.",
    sa: "गीतां पश्यतु तथा स्वर पठनार्थं कस्मिंश्चित् श्लोके 'शृणोतु' चिनोतु।",
  },
  sanskritRecitation: {
    en: "Sanskrit Recitation",
    hi: "संस्कृत पाठ",
    te: "సంస్కృత పఠనం",
    sa: "संस्कृत पठनम्",
  },
  removedFromFavoritesToast: {
    en: "Removed from Favorites",
    hi: "पसंदीदा से हटाया गया",
    te: "ఇష్టమైన వాటి నుండి తొలగించబడింది",
    sa: "प्रियतమాत् निष्कासितम्",
  },
  playbackSpeedSetToast: {
    en: "Playback speed set to",
    hi: "पठन गति सेट की गई",
    te: "ప్లేబ్యాక్ వేగం సెట్ చేయబడింది",
    sa: "पठन गतिः निर्धारिता",
  },
  allChapters: {
    en: "All Chapters",
    hi: "सभी अध्याय",
    te: "అన్ని అధ్యాయాలు",
    sa: "सर्वे अध्यायाः",
  },
  yogaOnly: {
    en: "Yoga Only",
    hi: "केवल योग",
    te: "యోగా మాత్రమే",
    sa: "केवल योगः",
  },
  noMatchingChapters: {
    en: "No matching chapters found.",
    hi: "कोई मेल खाता अध्याय नहीं मिला।",
    te: "సరిపోలే అధ్యాయాలు ఏవీ కనుగొనబడలేదు.",
    sa: "न किमपि अध्यायम् प्राप्तम्।",
  },
  verseOfTheDay: {
    en: "Verse of the day",
    hi: "आज का श्लोक",
    te: "ఈరోజు శ్లోకం",
    sa: "अद्यतनः श्लोकः",
  },
  endOfChapterToast: {
    en: "End of Chapter",
    hi: "अध्याय का अंत",
    te: "అధ్యాయం ముగింపు",
    sa: "अध्यायस्य समाप्तिः",
  },
  startOfChapterToast: {
    en: "Start of Chapter",
    hi: "अध्याय का प्रारंभ",
    te: "అధ్యాయం ప్రారంభం",
    sa: "अध्यायस्य आरम्भः",
  },
  exploreChaptersDesc: {
    en: "Explore the 18 chapters of the Bhagavad Gita",
    hi: "भगवद गीता के १८ अध्यायों का अन्वेषण करें",
    te: "భగవద్గీత యొక్క 18 అధ్యాయాలను అన్వేషించండి",
    sa: "भगवद्गीतायाः १८ अध्यायानां अन्वेषणं कुर्वन्तु",
  },
  searchChaptersPlaceholder: {
    en: "Search chapters...",
    hi: "अध्याय खोजें...",
    te: "అధ్యాయాలను వెతకండి...",
    sa: "అध्याయాన్ అన్వేషయతు...",
  },
  commentary: {
    en: "Commentary",
    hi: "व्याख्या",
    te: "వ్యాఖ్యానం",
    sa: "व्याख्या",
  },
  reflection: {
    en: "Reflection",
    hi: "गहन विचार",
    te: "ఆలోచన",
    sa: "चिन्तनम्",
  },
  deeperLook: {
    en: "A deeper look",
    hi: "गहन विश्लेषण",
    te: "వివరణాత్మక విశ్లేషణ",
    sa: "गहन विश्लेषणम्",
  },
  wordMeanings: {
    en: "Word Meanings",
    hi: "शब्दार्थ",
    te: "పదాల అర్థాలు",
    sa: "शब्दार्थाः",
  },
  languageNotSupported: {
    en: "Language Not Supported",
    hi: "भाषा समर्थित नहीं है",
    te: "భాషకు మద్దతు లేదు",
    sa: "भाषा न समर्थिता",
  },
  wordBreakdownAvailableEnglish: {
    en: "Word-by-word breakdowns are currently only available when your app reading language is set to English.",
    hi: "शब्द-दर-शब्द अनुवाद वर्तमान में केवल तभी उपलब्ध हैं जब आपकी ऐप पठन भाषा अंग्रेजी पर सेट हो।",
    te: "మీ యాప్ పఠన భాష ఇంగ్లీష్‌లో ఉన్నప్పుడు మాత్రమే ప్రతి పదం యొక్క వివరణాత్మక అర్థాలు అందుబాటులో ఉంటాయి.",
    sa: "प्रतिशब्दं विश्लेषणम् केवलम् तदा एव लभ्यते यदा पठनाय आङ्ग्लभाषा चिता भवति।",
  },
  switchToEnglish: {
    en: "Switch to English",
    hi: "अंग्रेजी में बदलें",
    te: "ఇంగ్లీష్ లోకి మారండి",
    sa: "आङ्ग्लभाषां प्रति गच्छतु",
  },
  allCaughtUp: {
    en: "All caught up!",
    hi: "सभी सूचनाएं पढ़ ली गई हैं!",
    te: "అన్నీ చూసేశారు!",
    sa: "सर्वाणि पठितानि!",
  },
  noNotificationsInCategory: {
    en: "You have no notifications in this category.",
    hi: "आपके पास इस श्रेणी में कोई सूचना नहीं है।",
    te: "ఈ విభాగంలో మీకు ఎటువంటి నోటిఫికేషన్‌లు లేవు.",
    sa: "अस्यां श्रेण्यां कापि सूचना नास्ति।",
  },
  stayUpdatedJourney: {
    en: "Stay updated on your spiritual journey",
    hi: "अपनी आध्यात्मिक यात्रा से जुड़े रहें",
    te: "మీ ఆధ్యాత్మిక ప్రయాణంపై నిరంతరం అప్‌డేట్ అవ్వండి",
    sa: "स्वकीय आध्यात्मिक यात्रायां नित्यं प्रबुद्धाः भवन्तु",
  },
  yourLibraryIsEmpty: {
    en: "Your library is empty",
    hi: "आपकी लाइब्रेरी खाली है",
    te: "మీ లైబ్రరీ ఖాళీగా ఉంది",
    sa: "भवतः पुस्तकालयः रिक्तः अस्ति",
  },
  libraryIsEmptySub: {
    en: "Switch to the 'Browse & Download' tab or click the download button on any verse to download recitations.",
    hi: "'ब्राउज़ और डाउनलोड' टैब पर जाएं या पाठ डाउनलोड करने के लिए किसी भी श्लोक पर डाउनलोड बटन पर क्लिक करें।",
    te: "ఆఫ్‌లైన్ పాఠాలను డౌన్‌లోడ్ చేయడానికి 'బ్రౌజ్ & డౌన్‌లోడ్' ట్యాబ్‌కు మారండి లేదా ఏదైనా శ్లోకంపై డౌన్‌లోడ్ బటన్‌ను క్లిక్ చేయండి.",
    sa: "अवरोहणार्थं 'अवरोहणम्' इति फलकं गच्छन्तु अथवा कस्मिन्नपि श्लोके अवरोहण-बटनं क्लिक् कुर्वन्तु।",
  },
  completeBhagavadGita: {
    en: "Complete Bhagavad Gita",
    hi: "संपूर्ण भगवद गीता",
    te: "సంపూర్ణ భగవద్గీత",
    sa: "सम्पूर्णा भगवद्गीता",
  },
  all18ChaptersOffline: {
    en: "All 18 Chapters · 700 Verses offline",
    hi: "सभी १८ अध्याय · ७०० श्लोक ऑफ़लाइन",
    te: "అన్ని 18 అధ్యాయాలు · 700 శ్లోకాలు ఆఫ్‌లైన్",
    sa: "सर्वे १८ अध्यायाः · ७०० श्लोकाः ऑफ़लाइन",
  },
  completeChapterRecitation: {
    en: "Complete Chapter Recitation",
    hi: "संपूर्ण अध्याय पाठ",
    te: "సంపూర్ణ అధ్యాయ పారాయణం",
    sa: "सम्पूर्णः अध्याय पाठः",
  },
  individualVerseRecitation: {
    en: "Individual Verse Recitation",
    hi: "व्यक्तिगत श्लोक पाठ",
    te: "వ్యక్తిగత శ్లోక పారాయణం",
    sa: "व्यक्तिगतः श्लोक पाठः",
  },
  clearAllDownloadsConfirm: {
    en: "Clear all offline downloads? This action is permanent.",
    hi: "सभी ऑफ़लाइन डाउनलोड साफ़ करें? यह क्रिया स्थायी है।",
    te: "ఆఫ్‌లైన్ డౌన్‌లోడ్‌లన్నింటినీ తొలగించాలా? ఈ చర్య శాశ్వతమైనది.",
    sa: "सर्वाणि अवरोहितानि निष्कासयितुं इच्छन्ति वा? एतत् अपरिवर्तनीयम्।",
  },
  deleteChapterConfirm: {
    en: "Delete offline audio for Chapter",
    hi: "अध्याय के लिए ऑफ़लाइन ऑडियो हटाएं",
    te: "ఈ అధ్యాయం యొక్క ఆఫ్‌లైన్ ఆడియోను తొలగించండి",
    sa: "अध्यायस्य ऑफ़लाइन ध्वन्यालेखं निष्कासयतु",
  },
  deleteVerseConfirm: {
    en: "Delete offline audio for Verse",
    hi: "श्लोक के लिए ऑफ़लाइन ऑडियो हटाएं",
    te: "ఈ శ్లోకం యొక్క ఆఫ్‌లైన్ ఆడియోను తొలగించండి",
    sa: "श्लोकस्य ऑफ़लाइन ध्वन्यालेखं निष्कासयतु",
  },
  offlineReady: {
    en: "Offline Ready",
    hi: "ऑफ़लाइन तैयार",
    te: "ఆఫ్‌లైన్ సిద్ధంగా ఉంది",
    sa: "ऑफ़लाइन सज्जः",
  },
  downloadingEntireGita: {
    en: "Downloading entire Gita...",
    hi: "संपूर्ण गीता डाउनलोड हो रही है...",
    te: "సంపూర్ణ గీత డౌన్‌లోడ్ అవుతోంది...",
    sa: "सम्पूर्णा गीता अवरोह्यते...",
  },
  chaptersRecitations: {
    en: "Chapters Recitations",
    hi: "अध्याय पाठ",
    te: "అధ్యాయాల పారాయణాలు",
    sa: "अध्यायानां पाठाः",
  },
  offline: {
    en: "Offline",
    hi: "ऑफ़लाइन",
    te: "ఆఫ్‌లైన్",
    sa: "ऑफ़लाइन",
  },
  hariOm: {
    en: "Hari Om",
    hi: "हरि ॐ",
    te: "హరి ఓం",
    sa: "हरि ॐ",
  },
  downloadForOffline: {
    en: "Download for offline",
    hi: "ऑफ़लाइन सुनने के लिए डाउनलोड करें",
    te: "ఆఫ్‌లైన్ కోసం డౌన్‌లోడ్ చేయండి",
    sa: "ऑफ़लाइन श्रवणार्थं अवरोहणम्",
  },
};

/**
 * Translates a key based on the selected language.
 * Falls back to English if the key or language translation is not found.
 */
export function t(key: string, lang: string): string {
  const languageCode = (["en", "hi", "te", "sa"].includes(lang) ? lang : "en") as SupportedLanguage;
  const translationEntry = translations[key];
  if (!translationEntry) {
    return key;
  }
  return translationEntry[languageCode] || translationEntry["en"] || key;
}
