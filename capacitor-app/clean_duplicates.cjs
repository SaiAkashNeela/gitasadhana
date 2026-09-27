const fs = require('fs');
let content = fs.readFileSync('src/lib/i18n.ts', 'utf8');

const keysToRemove = ['"home": {', '"chapters": {', '"wisdom": {', '"saved": {', '"profile": {'];

// Let's remove the LAST occurrence of these keys if they appear more than once
// Actually, it's easier to just parse the AST, or we can just replace the specific strings I added.
// In patch_translations2.cjs, I added:
/*
  "home": {
      "en": "Home",
      "hi": "मुख्यपृष्ठ",
      "te": "హోమ్",
      "sa": "गृहम्"
  },
*/
const strToRemove = `"home": {
      "en": "Home",
      "hi": "मुख्यपृष्ठ",
      "te": "హోమ్",
      "sa": "गृहम्"
  },
  "chapters": {
      "en": "Chapters",
      "hi": "अध्याय",
      "te": "అధ్యాయాలు",
      "sa": "अध्यायाः"
  },
  "wisdom": {
      "en": "Wisdom",
      "hi": "दिव्य ज्ञान",
      "te": "జ్ఞానం",
      "sa": "ज्ञानम्"
  },
  "saved": {
      "en": "Saved",
      "hi": "संरक्षित",
      "te": "భద్రపరచినవి",
      "sa": "संरक्षितम्"
  },
  "profile": {
      "en": "Profile",
      "hi": "प्रोफ़ाइल",
      "te": "ప్రొఫైల్",
      "sa": "विवरणम्"
  },`;

content = content.replace(strToRemove, '');

fs.writeFileSync('src/lib/i18n.ts', content);
console.log("Done cleaning i18n duplicates");
