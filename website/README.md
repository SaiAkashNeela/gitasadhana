# Gita Sadhana website

The web version of Gita Sadhana at **https://gitasadhana.com**. It is written in plain HTML, CSS and
JavaScript modules: no framework, no bundler and no build step to run the code. A build script only
pre-renders the Gita's pages for search engines and AI assistants.

It covers everything the app does except reminders: all 18 chapters and 701 verses in 12 languages,
verse-by-verse recitation (speed, repeat, lock-screen controls, auto-advance), offline downloads,
bookmarks, favourites, notes, reading history, streaks and calendar, themes, daily verse and wisdom,
search, Gita AI, Google sign-in with cloud sync, contact and correction forms, and light/dark themes.
It works on phones, tablets and desktops, and installs as an app (PWA) with offline support.

Made by [Sai Akash Neela](https://saiakashneela.com) · [GitHub](https://github.com/SaiAkashNeela)

## Run it

```bash
bun run website          # builds data + pages, then serves website/ on http://localhost:5500
```

Or build once with `bun run build:website` and serve `website/` with any static server. Every page
sets `<base href="/">`, so the site must be served from the root of a host, not a subfolder.

## Deploy

Any static host works. On **Cloudflare Pages**:

| Setting | Value |
| --- | --- |
| Build command | `bun install && bun run build:website` |
| Output directory | `website` |

`_headers` sets caching and security headers on Cloudflare Pages and Netlify. On other hosts, set
`Cache-Control` for `/assets/*` and `/vendor/*`, `no-cache` for `/sw.js`, and serve `404.html` for
missing paths.

Before the first deploy:

1. **Google sign-in.** In Google Cloud Console (project `822836118890`), open the web OAuth client
   `822836118890-c0phehll…` and add `https://gitasadhana.com` (and any preview or local origin, e.g.
   `http://localhost:5500`) under **Authorized JavaScript origins**. Until then the Google button
   shows "origin not allowed".
2. **Search Console and Bing Webmaster Tools.** Verify `gitasadhana.com`, then submit
   `https://gitasadhana.com/sitemap.xml` in both.

## Configuration

`js/config.js` holds the API address, the Google web client ID, the audio host, the site address
(`SITE_URL`, used for canonical links) and the owner credit shown in every footer.

## How pages are built

| Command | What it does |
| --- | --- |
| `bun run build:website` | Runs the two scripts below |
| `scripts/build-website-data.mjs` | Copies Gita content from `src/data/` and `assets/gita/` into `data/`, and writes the interface strings for 12 languages (`data/i18n/`) from the app's dictionaries plus `i18n-source/web-strings.json` (web-only strings) |
| `scripts/build-website-seo.mjs` | Pre-renders every content page in every language and writes the sitemaps, `robots.txt`, `llms.txt`, `llms-full.txt`, chapter Markdown and `humans.txt` |
| `bun run build:website:og` | Draws the 1200×630 link-preview cards in `assets/og/` with Chrome (committed; rerun only when chapter names or art change) |
| `scripts/build-website-images.sh` | Makes web-sized artwork and icons from the app's assets (macOS `sips`) |

The root `*.html` files are the templates: the SEO script fills their `<!-- seo -->`,
`<!-- content -->` and `<!-- after -->` blocks, so they can be rebuilt any number of times. The
generated folders (`chapter/`, `hi/`, `sitemap-*.xml` and so on) are in `.gitignore`.

## URLs

English has no prefix; the other 11 languages add theirs (`hi`, `sa`, `te`, `ta`, `kn`, `ml`, `bn`,
`gu`, `mr`, `pa`, `ne`).

| Page | English | Hindi |
| --- | --- | --- |
| Home | `/` | `/hi/` |
| Chapters | `/chapters/` | `/hi/chapters/` |
| Chapter | `/chapter/2/` | `/hi/chapter/2/` |
| Verse | `/chapter/2/verse/47/` | `/hi/chapter/2/verse/47/` |
| Wisdom, themes | `/wisdom/`, `/theme/devotion/` | `/hi/wisdom/`, `/hi/theme/devotion/` |
| Gita AI, contact, privacy, terms | `/ai/`, `/contact/`, `/privacy/`, `/terms/` | (shown in the reader's language) |

Content pages take their language from the URL; everything else (settings, saved, notes, history,
journey, offline, search) follows the language the reader picked. Switching language on a content
page moves to the same page in the new language. Old links such as `verse.html?v=2.47` still work.

## Search engines and AI assistants

- **Pre-rendered HTML.** 8,740 pages (727 per language plus 4) carry the full text: Sanskrit,
  transliteration, translation, word meanings, reflection and essence. Crawlers that don't run
  JavaScript (most AI crawlers) read everything.
- **Every page** has its title, meta description, canonical URL, `hreflang` alternates for all 12
  languages plus `x-default`, Open Graph and Twitter cards with a card image in the page's
  language, and author credit.
- **Structured data (JSON-LD):** `Organization`, `Person` (the owner), `WebSite` with a
  `SearchAction`, the Gita as a `Book`, plus `WebApplication` and `FAQPage` on the home page,
  `Chapter` and `ItemList` on chapter pages, and `Quotation` (with its translation and recitation
  as an `AudioObject`), `Article` (reflection) and `BreadcrumbList` on verse pages.
- **Sitemaps:** `sitemap.xml` indexes one sitemap per language (with `xhtml:link` alternates and
  image entries) and `sitemap-pages.xml`.
- **robots.txt** allows every search engine and AI crawler by name and points to the sitemap and
  `llms.txt`.
- **llms.txt** follows [llmstxt.org](https://llmstxt.org): what the site is, how verses are
  addressed, and links to every chapter. `llms-full.txt` holds the whole Gita in English, and
  every chapter is also available as Markdown at `/chapter/<n>.md`.
- **Personal pages** (saved, notes, history, settings, search and so on) are `noindex`.
- The English home page ends with an about section and common questions. It is written in English
  only, so it is hidden when the reader's language is another one.

## Code

```
index.html, *.html   page templates (one per screen)
css/styles.css       design tokens, layout (sidebar / rail / tab bar) and components
js/config.js         deployment settings and owner credit
js/i18n.js           languages, strings, page language
js/route.js          clean URLs and link builders
js/titles.js         page titles, shared with the SEO build
js/gita.js           chapters, verses, translations, search, themes
js/progress.js       streaks, bookmarks, notes, settings, cloud sync (same storage keys as the app)
js/auth.js, api.js   Google sign-in and the Cloudflare Worker API
js/player.js         recitation player
js/offline.js        saved recitations (Cache Storage, through the API's audio proxy)
js/ui.js             page shell, language menu, toasts, dialogs
js/pages/*.js        one module per page
sw.js                service worker (offline pages, code and art)
vendor/phosphor/     Phosphor icon font (regular, fill, duotone)
assets/              fonts, art, icons, link-preview cards
```
