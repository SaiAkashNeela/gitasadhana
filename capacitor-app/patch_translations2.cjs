const fs = require('fs');

const generatedTranslations = {
  allFieldsRequired: { en: "All fields are required.", hi: "सभी फ़ील्ड आवश्यक हैं।", te: "అన్ని ఫీల్డ్‌లు తప్పనిసరి.", sa: "सर्वाणि क्षेत्राणि आवश्यकानि सन्ति।" },
  correctionSubmittedToast: { en: "Correction submitted. Thank you!", hi: "त्रुटि रिपोर्ट जमा कर दी गई है। धन्यवाद!", te: "సవరణ సమర్పించబడింది. ధన్యవాదాలు!", sa: "त्रुटिः सूचिता। धन्यवादः!" },
  "home": { en: "Home", hi: "मुख्यपृष्ठ", te: "హోమ్", sa: "गृहम्" },
  "chapters": { en: "Chapters", hi: "अध्याय", te: "అధ్యాయాలు", sa: "अध्यायाः" },
  "wisdom": { en: "Wisdom", hi: "दिव्य ज्ञान", te: "జ్ఞానం", sa: "ज्ञानम्" },
  "saved": { en: "Saved", hi: "संरक्षित", te: "భద్రపరచినవి", sa: "संरक्षितम्" },
  "profile": { en: "Profile", hi: "प्रोफ़ाइल", te: "ప్రొఫైల్", sa: "विवरणम्" }
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
