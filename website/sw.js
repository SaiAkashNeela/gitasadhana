// Offline support. The site's pages, styles, scripts, fonts and core content are cached on
// install, and everything else from this origin is cached as it's used. Pages, code and data
// are fetched fresh whenever there is a connection; images and fonts come from the cache.
// Saved recitations live in their own cache ("gita-audio-v1", see js/offline.js) and are never
// evicted here.
const VERSION = "gita-site-v2";
const SHELL = [
  "./", "index.html", "chapters.html", "chapter.html", "verse.html", "search.html", "wisdom.html", "theme.html",
  "saved.html", "notes.html", "history.html", "journey.html", "offline.html", "ai.html", "settings.html",
  "contact.html", "correction.html", "privacy.html", "terms.html", "404.html",
  "css/styles.css", "manifest.webmanifest",
  "js/config.js", "js/store.js", "js/i18n.js", "js/route.js", "js/titles.js", "js/gita.js", "js/api.js", "js/auth.js", "js/progress.js", "js/ui.js", "js/player.js", "js/offline.js",
  "js/pages/_cards.js", "js/pages/_legal.js", "js/pages/home.js", "js/pages/chapters.js", "js/pages/chapter.js", "js/pages/verse.js",
  "js/pages/search.js", "js/pages/wisdom.js", "js/pages/theme.js", "js/pages/saved.js", "js/pages/notes.js", "js/pages/history.js",
  "js/pages/journey.js", "js/pages/offline.js", "js/pages/ai.js", "js/pages/settings.js", "js/pages/contact.js",
  "js/pages/correction.js", "js/pages/privacy.js", "js/pages/terms.js", "js/pages/notfound.js",
  "vendor/phosphor/regular/style.css", "vendor/phosphor/regular/Phosphor.woff2",
  "vendor/phosphor/fill/style.css", "vendor/phosphor/fill/Phosphor-Fill.woff2",
  "vendor/phosphor/duotone/style.css", "vendor/phosphor/duotone/Phosphor-Duotone.woff2",
  "assets/fonts/Marcellus_400Regular.woff2", "assets/fonts/EBGaramond_400Regular.woff2", "assets/fonts/EBGaramond_500Medium.woff2",
  "assets/fonts/EBGaramond_400Regular_Italic.woff2", "assets/fonts/NotoSerifDevanagari_400Regular.woff2", "assets/fonts/NotoSerifDevanagari_500Medium.woff2",
  "assets/icons/emblem.png", "assets/icons/favicon.png", "assets/icons/icon-512.png",
  "data/chapters.json", "data/verses-core.json", "data/quotes.json", "data/legal.json", "data/i18n/en.json", "data/gita/en.json",
];

// A clean URL that was never opened online falls back to the app page that draws it; the page
// reads the chapter, verse or theme (and the language) from the path.
function shellFor(path) {
  const rest = path.replace(/^\/(hi|sa|te|ta|kn|ml|bn|gu|mr|pa|ne)(?=\/|$)/, "");
  if (/^\/chapter\/\d+\/verse\/\d+\/?$/.test(rest)) return "verse.html";
  if (/^\/chapter\/\d+\/?$/.test(rest)) return "chapter.html";
  if (/^\/theme\/[a-z-]+\/?$/.test(rest)) return "theme.html";
  const page = rest.match(/^\/(chapters|wisdom|ai|contact|privacy|terms)\/?$/)?.[1];
  if (page) return `${page}.html`;
  return rest === "" || rest === "/" ? "index.html" : "404.html";
}

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("gita-site-") && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  // Pages: network first so updates show immediately; the cached copy when offline.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
          return res;
        })
        .catch(async () => (await caches.match(req, { ignoreSearch: true })) ?? (await caches.match(shellFor(url.pathname))) ?? caches.match("404.html")),
    );
    return;
  }
  // Code and content (scripts, styles, JSON, text): network first, so a new release never
  // mixes with old modules; the cached copy when offline.
  if (/\.(js|css|json|txt|md|webmanifest)$/.test(url.pathname)) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(async () => (await caches.match(req)) ?? Response.error()),
    );
    return;
  }
  // Images and fonts: cached copy at once, refreshed in the background.
  e.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const hit = await cache.match(req);
      const fresh = fetch(req)
        .then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => hit);
      return hit ?? fresh;
    }),
  );
});
