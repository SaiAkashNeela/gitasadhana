import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webAppRoot = join(__dirname, "..");
const publicDir = join(webAppRoot, "public");
const processedPath = join(webAppRoot, "..", "src", "app", "gita-processed.json");
const siteUrl = "https://gitasadhana.com";

const processed = JSON.parse(await readFile(processedPath, "utf8"));
const chapters = [...(processed.chapters ?? [])].sort(
  (a, b) => a.chapter_number - b.chapter_number,
);
const verses = Object.values(processed.verses ?? {}).sort((a, b) => {
  if (a.chapter !== b.chapter) return a.chapter - b.chapter;
  return a.verse - b.verse;
});

await mkdir(publicDir, { recursive: true });

const urls = [
  { loc: "/", priority: "1.0", changefreq: "daily" },
  { loc: "/chapters", priority: "0.9", changefreq: "weekly" },
  { loc: "/study", priority: "0.8", changefreq: "weekly" },
  { loc: "/ai", priority: "0.8", changefreq: "weekly" },
  ...chapters.map((chapter) => ({
    loc: `/chapter/${chapter.chapter_number}`,
    priority: "0.85",
    changefreq: "monthly",
  })),
  ...verses.map((verse) => ({
    loc: `/verse/${verse.chapter}/${verse.verse}`,
    priority: "0.7",
    changefreq: "monthly",
  })),
];

const today = new Date().toISOString().slice(0, 10);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (entry) => `  <url>
    <loc>${siteUrl}${entry.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

await writeFile(join(publicDir, "sitemap.xml"), sitemap, "utf8");
