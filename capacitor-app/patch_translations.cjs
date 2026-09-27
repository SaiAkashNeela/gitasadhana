const fs = require('fs');

const missingKeys = [
  "loadingTitle", "deleteChapterConfirm", "deleteVerseConfirm", "delete", "cancel",
  "savedOfflineLabel", "tapToDelete", "noWordBreakdown", "manageNotificationPreferences",
  "chooseWhatToHear", "clearAllDownloadsConfirm", "audioAutoPlay", "helpSupportTitle",
  "shareWisdom", "copiedToClipboardToast", "contactUsTitle", "privacyPolicyTitle",
  "termsTitle", "verseLanguageCorrectionTitle", "signOutTitle", "signingOut",
  "accountSettingsTitle", "accountSettingsSub", "emailNotifications", "dailyDigest",
  "dailyDigestDesc", "weeklyDigest", "weeklyDigestDesc", "monthlyDigest",
  "monthlyDigestDesc", "noEmails", "noEmailsDesc", "dangerZone", "dangerZoneWarning",
  "deleteAccount", "deletingAccount", "changesSavedNote", "emailUsDirectly",
  "yourEmail", "messageLabel", "contactMessagePlaceholder", "messageSentToast",
  "submitBtn", "privacyLastUpdated", "termsLastUpdated", "correctionHelpText",
  "describeIssueLabel", "submitCorrectionBtn", "languageLabel"
];

const generatedTranslations = {
  loadingTitle: { en: "Loading...", hi: "लोड हो रहा है...", te: "లోడ్ అవుతోంది...", sa: "प्रतीक्ष्यताम्..." },
  deleteChapterConfirm: { en: "Delete Chapter", hi: "अध्याय हटाएँ", te: "అధ్యాయాన్ని తొలగించండి", sa: "अध्यायं निष्कासयन्तु" },
  deleteVerseConfirm: { en: "Delete Verse", hi: "श्लोक हटाएँ", te: "శ్లోకాన్ని తొలగించండి", sa: "श्लोकं निष्कासयन्तु" },
  delete: { en: "Delete", hi: "हटाएँ", te: "తొలగించు", sa: "निष्कासयन्तु" },
  cancel: { en: "Cancel", hi: "रद्द करें", te: "రద్దు చేయి", sa: "रद्द करोतु" },
  savedOfflineLabel: { en: "Saved Offline", hi: "ऑफ़लाइन सहेजा गया", te: "ఆఫ్‌లైన్‌లో సేవ్ చేయబడింది", sa: "ऑफ़लाइन रक्षितम्" },
  tapToDelete: { en: "Tap to Delete", hi: "हटाने के लिए दबाएं", te: "తొలగించడానికి నొక్కండి", sa: "निष्कासनाय नुदन्तु" },
  noWordBreakdown: { en: "No word breakdown available for this verse.", hi: "इस श्लोक के लिए शब्दार्थ उपलब्ध नहीं है।", te: "ఈ శ్లోకానికి పదాల అర్థాలు అందుబాటులో లేవు.", sa: "अस्य श्लोकस्य शब्दार्थः उपलब्धः नास्ति।" },
  manageNotificationPreferences: { en: "Manage Notification Preferences", hi: "अधिसूचना सेटिंग्स प्रबंधित करें", te: "నోటిఫికేషన్ సెట్టింగులను నిర్వహించండి", sa: "सूचना संयोजनाः" },
  chooseWhatToHear: { en: "Choose what you want to hear from us", hi: "चुनें कि आप हमसे क्या सुनना चाहते हैं", te: "మా నుండి మీరు ఏమి వినాలి అని ఎంచుకోండి", sa: "अस्मत् किं श्रोतुमिच्छति तत् चिनोतु" },
  clearAllDownloadsConfirm: { en: "Delete all downloads?", hi: "सभी डाउनलोड हटाएँ?", te: "అన్ని డౌన్‌లోడ్‌లను తొలగించాలా?", sa: "सर्वाणि अवरोहणानि निष्कासयन्तु?" },
  "Audio Auto Play": { en: "Audio Auto Play", hi: "ऑडियो स्वतः प्ले", te: "ఆడియో ఆటో ప్లే", sa: "स्वतः स्वर पठनम्" },
  helpSupportTitle: { en: "Help & Support", hi: "सहायता और समर्थन", te: "సహాయం & మద్దతు", sa: "सहायता" },
  shareWisdom: { en: "Share Wisdom", hi: "ज्ञान साझा करें", te: "జ్ఞానాన్ని పంచుకోండి", sa: "ज्ञानं प्रसारयन्तु" },
  copiedToClipboardToast: { en: "Copied to clipboard", hi: "क्लिपबोर्ड पर कॉपी किया गया", te: "క్లిప్‌బోర్డ్‌కి కాపీ చేయబడింది", sa: "प्रतिलिपिः कृता" },
  contactUsTitle: { en: "Contact Us", hi: "संपर्क करें", te: "మమ్మల్ని సంప్రదించండి", sa: "सम्पर्कं कुर्वन्तु" },
  privacyPolicyTitle: { en: "Privacy Policy", hi: "गोपनीयता नीति", te: "గోప్యతా విధానం", sa: "गोपनीयता नीतिः" },
  termsTitle: { en: "Terms of Service", hi: "सेवा की शर्तें", te: "సేవా నిబంధనలు", sa: "सेवा नियमाः" },
  verseLanguageCorrectionTitle: { en: "Report Correction", hi: "त्रुटि रिपोर्ट करें", te: "లోపాన్ని నివేదించండి", sa: "त्रुटिं सूचयन्तु" },
  signOutTitle: { en: "Sign Out", hi: "लॉग आउट करें", te: "సైన్ అవుట్", sa: "निर्गमनम्" },
  signOutConfirmMessage: { en: "Are you sure you want to sign out?", hi: "क्या आप निश्चित रूप से लॉग आउट करना चाहते हैं?", te: "మీరు సైన్ అవుట్ చేయాలని కచ్చితంగా ఉన్నారా?", sa: "किं निर्गमनं कार्तुम् इच्छसि?" },
  signingOut: { en: "Signing Out...", hi: "लॉग आउट हो रहा है...", te: "సైన్ అవుట్ అవుతోంది...", sa: "निर्गच्छति..." },
  accountSettingsTitle: { en: "Account Settings", hi: "खाता सेटिंग्स", te: "ఖాతా సెట్టింగులు", sa: "खाता संयोजनाः" },
  accountSettingsSub: { en: "Manage your account preferences", hi: "अपनी खाता सेटिंग्स प्रबंधित करें", te: "మీ ఖాతా సెట్టింగులను నిర్వహించండి", sa: "स्वखाता संयोजनाः पालयन्तु" },
  emailNotifications: { en: "Email Notifications", hi: "ईमेल सूचनाएं", te: "ఇమెయిల్ నోటిఫికేషన్‌లు", sa: "ईमेल सूचनाः" },
  dailyDigest: { en: "Daily Digest", hi: "दैनिक सारांश", te: "రోజువారీ సారాంశం", sa: "दैनिक सारः" },
  dailyDigestDesc: { en: "Get a daily dose of wisdom", hi: "प्रतिदिन ज्ञान प्राप्त करें", te: "ప్రతిరోజూ జ్ఞానాన్ని పొందండి", sa: "प्रतिदिनं ज्ञानं प्राप्नोतु" },
  weeklyDigest: { en: "Weekly Digest", hi: "साप्ताहिक सारांश", te: "వారపు సారాంశం", sa: "साप्ताहिक सारः" },
  weeklyDigestDesc: { en: "A weekly summary of verses", hi: "श्लोकों का साप्ताहिक सारांश", te: "శ్లోకాల వారపు సారాంశం", sa: "श्लोकानां साप्ताहिक सारः" },
  monthlyDigest: { en: "Monthly Digest", hi: "मासिक सारांश", te: "నెలవారీ సారాంశం", sa: "मासिक सारः" },
  monthlyDigestDesc: { en: "A monthly overview of your journey", hi: "आपकी यात्रा का मासिक अवलोकन", te: "మీ ప్రయాణం యొక్క నెలవారీ అవలోకనం", sa: "भवतः यात्रायाः मासिक सारः" },
  noEmails: { en: "No Emails", hi: "कोई ईमेल नहीं", te: "ఇమెయిల్‌లు లేవు", sa: "ईमेल नास्ति" },
  noEmailsDesc: { en: "Don't send me any emails", hi: "मुझे कोई ईमेल न भेजें", te: "నాకు ఎటువంటి ఇమెయిల్‌లు పంపవద్దు", sa: "मह्यं ईमेल मा प्रेषयन्तु" },
  dangerZone: { en: "Danger Zone", hi: "खतरे का क्षेत्र", te: "ప్రమాదకరం", sa: "आपत्कालः" },
  dangerZoneWarning: { en: "Once you delete your account, there is no going back. Please be certain.", hi: "एक बार जब आप अपना खाता हटा देते हैं, तो वापस नहीं जाया जा सकता। कृपया सुनिश्चित करें।", te: "మీరు మీ ఖాతాను తొలగించిన తర్వాత, తిరిగి వెళ్ళలేరు. దయచేసి నిర్ధారించుకోండి.", sa: "एकवारं भवान् स्वखातां निष्कासयति चेत्, प्रत्यावर्तनं नास्ति। कृपया सुनिश्चितं कुर्वन्तु।" },
  deleteAccount: { en: "Delete Account", hi: "खाता हटाएँ", te: "ఖాతాను తొలగించండి", sa: "खातां निष्कासयन्तु" },
  deletingAccount: { en: "Deleting Account...", hi: "खाता हटाया जा रहा है...", te: "ఖాతాను తొలగిస్తోంది...", sa: "खातां निष्कासयति..." },
  changesSavedNote: { en: "Changes are automatically saved", hi: "बदलाव स्वतः सहेजे जाते हैं", te: "మార్పులు ఆటోమేటిక్‌గా సేవ్ చేయబడతాయి", sa: "परिवर्तनानि स्वतः रक्षितानि" },
  emailUsDirectly: { en: "Email us directly", hi: "हमें सीधे ईमेल करें", te: "మాకు నేరుగా ఇమెయిల్ చేయండి", sa: "अस्मान् साक्षात् ईमेल कुर्वन्तु" },
  yourEmail: { en: "Your Email", hi: "आपका ईमेल", te: "మీ ఇమెయిల్", sa: "भवतः ईमेल" },
  messageLabel: { en: "Message", hi: "संदेश", te: "సందేశం", sa: "संदेशः" },
  contactMessagePlaceholder: { en: "How can we help you?", hi: "हम आपकी कैसे मदद कर सकते हैं?", te: "మేము మీకు ఎలా సహాయం చేయగలము?", sa: "वयं भवतः कथं साहाय्यं कर्तुं शक्नुमः?" },
  messageSentToast: { en: "Message Sent", hi: "संदेश भेजा गया", te: "సందేశం పంపబడింది", sa: "संदेशः प्रेषितः" },
  submitBtn: { en: "Submit", hi: "जमा करें", te: "సమర్పించు", sa: "समर्पयन्तु" },
  privacyLastUpdated: { en: "Last Updated: June 2024", hi: "अंतिम अद्यतन: जून 2024", te: "చివరిగా అప్‌డేట్ చేయబడింది: జూన్ 2024", sa: "अन्तिमं अद्यतनीकृतम्: जून 2024" },
  termsLastUpdated: { en: "Last Updated: June 2024", hi: "अंतिम अद्यतन: जून 2024", te: "చివరిగా అప్‌డేట్ చేయబడింది: జూన్ 2024", sa: "अन्तिमं अद्यतनीकृतम्: जून 2024" },
  correctionHelpText: { en: "Help us improve Gita Sadhana. Describe the issue.", hi: "गीता साधना को बेहतर बनाने में हमारी मदद करें। समस्या का वर्णन करें।", te: "గీతా సాధనను మెరుగుపరచడంలో మాకు సహాయపడండి. సమస్యను వివరించండి.", sa: "गीता साधनां उन्नतयितुं अस्मत् साहाय्यं कुर्वन्तु। समस्यां वर्णयन्तु।" },
  describeIssueLabel: { en: "Describe Issue", hi: "समस्या का वर्णन करें", te: "సమస్యను వివరించండి", sa: "समस्यां वर्णयन्तु" },
  submitCorrectionBtn: { en: "Submit Correction", hi: "त्रुटि रिपोर्ट जमा करें", te: "సవరణను సమర్పించండి", sa: "त्रुटि सूचयन्तु" }
};

const generatedAdditionalTranslations = {};

for (const [key, value] of Object.entries(generatedTranslations)) {
  generatedAdditionalTranslations[key] = {
    kn: value.en,
    ml: value.en,
    bn: value.en,
    gu: value.en,
    mr: value.en,
    pa: value.en,
    ta: value.en
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
  if (!content.includes(`"${key}": {`) && !content.includes(`${key}: {`) ) {
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
