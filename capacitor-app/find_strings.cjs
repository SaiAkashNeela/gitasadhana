const fs = require('fs');

const content = fs.readFileSync('src/app/screens.tsx', 'utf8');

// regex to find JSX text that might be hardcoded
// Looks for > followed by letters/spaces/punctuation, then <
const jsxTextRegex = />([^<{]*[a-zA-Z][^<{]*)</g;

let match;
const suspiciousTexts = new Set();

while ((match = jsxTextRegex.exec(content)) !== null) {
  const text = match[1].trim();
  if (
    text.length > 2 &&
    /[a-zA-Z]/.test(text) &&
    !text.includes('{') &&
    !text.includes('}') &&
    !text.startsWith('http') &&
    !text.match(/^[\d%:\.\s]+$/)
  ) {
    suspiciousTexts.add(text);
  }
}

// Check for title="...", placeholder="...", alt="..." etc
const attrRegex = /(?:title|placeholder|label|alt|body|subtitle)="([^"]*[a-zA-Z][^"]*)"/g;
while ((match = attrRegex.exec(content)) !== null) {
  const text = match[1].trim();
  if (
    text.length > 2 &&
    !text.includes('{') &&
    !text.includes('}') &&
    !text.startsWith('http') &&
    !text.startsWith('chapter_')
  ) {
    suspiciousTexts.add(`ATTR: ${text}`);
  }
}

console.log(Array.from(suspiciousTexts).join('\n'));
