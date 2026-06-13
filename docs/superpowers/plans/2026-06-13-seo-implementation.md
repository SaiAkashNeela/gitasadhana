# GitaSadhana SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship production-grade SEO for GitaSadhana across the public website and shared brand surfaces, including metadata, crawl assets, schema, content architecture, and app-store discovery links.

**Architecture:** Build a shared SEO/brand metadata layer that both the `web-app` and the root app can consume. The web app will inject route-aware metadata, JSON-LD, canonical URLs, and index controls on every page, while a build step generates `robots.txt` and `sitemap.xml` from the same registry so crawl data never drifts from the UI. Brand and store-link content will be added in a way that helps search engines and users without polluting the mobile experience.

**Tech Stack:** React 19, Vite, TypeScript, JSON-LD script injection, static `robots.txt`, generated `sitemap.xml`, hash routing for the web app, existing shared `src/lib/*` utilities, and plain DOM head updates without adding a heavy SEO dependency.

---

### Task 1: Shared SEO Registry and Head Injector

**Files:**
- Create: `src/lib/site-metadata.ts`
- Create: `web-app/src/components/seo-head.tsx`
- Modify: `web-app/src/main.tsx`
- Modify: `web-app/src/App.tsx`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { getPageSeo, siteMetadata } from "../../../src/lib/site-metadata";

describe("site metadata", () => {
  it("returns a canonical title and description for the home page", () => {
    const seo = getPageSeo("home", { language: "en" });
    expect(seo.title).toContain("GitaSadhana");
    expect(seo.description).toContain("Bhagavad Gita");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run src/lib/site-metadata.test.ts -v`
Expected: fail because `src/lib/site-metadata.ts` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export const siteMetadata = {
  brandName: "GitaSadhana",
  fullBrandName: "Gita Sadhana",
  tagline: "Ancient Wisdom for Modern Life",
  siteUrl: "https://gitasadhana.com",
  founderName: "Sai Akash Neela",
  founderSite: "https://saiakashneela.com",
  githubUrl: "https://github.com/SaiAkashNeela",
};

export function getPageSeo(page: string, options: { language: string }) {
  return {
    title: `${siteMetadata.brandName} | ${page}`,
    description: `Explore Bhagavad Gita wisdom with ${siteMetadata.brandName}.`,
    canonical: `${siteMetadata.siteUrl}/${page}`,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run src/lib/site-metadata.test.ts -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/site-metadata.ts web-app/src/components/seo-head.tsx web-app/src/main.tsx web-app/src/App.tsx
git commit -m "feat: add shared seo metadata layer"
```

### Task 2: Route Metadata, Canonicals, and Structured Data in `web-app`

**Files:**
- Create: `web-app/src/lib/seo.ts`
- Create: `web-app/src/components/seo-bridge.tsx`
- Modify: `web-app/src/App.tsx`
- Modify: `web-app/src/pages/HomePage.tsx`
- Modify: `web-app/src/pages/ChaptersPage.tsx`
- Modify: `web-app/src/pages/ChapterPage.tsx`
- Modify: `web-app/src/pages/VersePage.tsx`
- Modify: `web-app/src/pages/AiPage.tsx`
- Modify: `web-app/src/pages/StudyPage.tsx`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { buildPageSeo } from "../src/lib/seo";

describe("buildPageSeo", () => {
  it("marks chapter pages as indexable and verse utility pages with breadcrumbs", () => {
    const seo = buildPageSeo({ route: { view: "chapter", chapter: 2 }, language: "en" });
    expect(seo.title).toContain("Chapter 2");
    expect(seo.structuredData).toContain("BreadcrumbList");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run web-app/src/lib/seo.test.ts -v`
Expected: fail because the SEO builder does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export function buildPageSeo({ route, language }: { route: AppRoute; language: LanguageCode }) {
  return {
    title: "...",
    description: "...",
    canonical: "...",
    robots: route.view === "ai" ? "noindex,follow" : "index,follow",
    structuredData: [
      buildWebSiteJsonLd(),
      buildBreadcrumbJsonLd(route),
      buildPageJsonLd(route),
    ],
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run web-app/src/lib/seo.test.ts -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add web-app/src/lib/seo.ts web-app/src/components/seo-bridge.tsx web-app/src/App.tsx web-app/src/pages/HomePage.tsx web-app/src/pages/ChaptersPage.tsx web-app/src/pages/ChapterPage.tsx web-app/src/pages/VersePage.tsx web-app/src/pages/AiPage.tsx web-app/src/pages/StudyPage.tsx
git commit -m "feat: add route-aware seo to web app"
```

### Task 3: Crawl Assets and SEO File Generation

**Files:**
- Create: `web-app/public/robots.txt`
- Create: `web-app/scripts/generate-seo-assets.mjs`
- Modify: `web-app/package.json`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { generateSitemapUrls } from "../scripts/generate-seo-assets.mjs";

describe("generateSitemapUrls", () => {
  it("includes the home page and chapter pages", () => {
    const urls = generateSitemapUrls();
    expect(urls).toContain("https://gitasadhana.com/");
    expect(urls).toContain("https://gitasadhana.com/#/chapter/2");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run web-app/scripts/generate-seo-assets.test.ts -v`
Expected: fail because the generator module does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```js
import { writeFile } from "node:fs/promises";

export function generateSitemapUrls() {
  return ["https://gitasadhana.com/", "https://gitasadhana.com/#/chapters"];
}

await writeFile("public/sitemap.xml", "<urlset>...</urlset>");
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run web-app/scripts/generate-seo-assets.test.ts -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add web-app/public/robots.txt web-app/scripts/generate-seo-assets.mjs web-app/package.json
git commit -m "feat: generate seo crawl assets"
```

### Task 4: Content SEO, Store CTAs, and Internal Linking

**Files:**
- Modify: `web-app/src/components/site-shell.tsx`
- Modify: `web-app/src/pages/HomePage.tsx`
- Modify: `web-app/src/pages/ChaptersPage.tsx`
- Modify: `web-app/src/pages/ChapterPage.tsx`
- Modify: `web-app/src/pages/VersePage.tsx`
- Modify: `web-app/src/pages/AiPage.tsx`
- Modify: `web-app/src/pages/StudyPage.tsx`
- Modify: `web-app/src/lib/i18n.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { getPageSeo } from "../../../src/lib/site-metadata";

describe("store and brand seo", () => {
  it("mentions the founder and app brand naturally", () => {
    const seo = getPageSeo("home", { language: "en" });
    expect(seo.description).toContain("Sai Akash Neela");
    expect(seo.description).toContain("GitaSadhana");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run src/lib/site-metadata.test.ts -v`
Expected: fail until the richer brand strings are added.

- [ ] **Step 3: Write minimal implementation**

```tsx
<a href={appStoreUrl} aria-label="Download on the App Store">
  <AppStoreIcon />
</a>
<a href={playStoreUrl} aria-label="Get it on Google Play">
  <PlayStoreIcon />
</a>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run src/lib/site-metadata.test.ts -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add web-app/src/components/site-shell.tsx web-app/src/pages/HomePage.tsx web-app/src/pages/ChaptersPage.tsx web-app/src/pages/ChapterPage.tsx web-app/src/pages/VersePage.tsx web-app/src/pages/AiPage.tsx web-app/src/pages/StudyPage.tsx web-app/src/lib/i18n.ts
git commit -m "feat: strengthen content seo and store ctas"
```

### Task 5: Shared Brand Metadata in the Root App

**Files:**
- Create: `src/lib/site-metadata.ts`
- Modify: `src/main.tsx`
- Modify: `src/app/screens.tsx`
- Modify: `src/lib/mediaSession.js`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { siteMetadata } from "./site-metadata";

describe("shared brand metadata", () => {
  it("contains the public brand and founder links", () => {
    expect(siteMetadata.brandName).toBe("GitaSadhana");
    expect(siteMetadata.githubUrl).toContain("SaiAkashNeela");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run src/lib/site-metadata.test.ts -v`
Expected: fail until the shared file exists.

- [ ] **Step 3: Write minimal implementation**

```ts
export const siteMetadata = {
  brandName: "GitaSadhana",
  founderName: "Sai Akash Neela",
  websiteUrl: "https://gitasadhana.com",
  founderUrl: "https://saiakashneela.com",
  githubUrl: "https://github.com/SaiAkashNeela",
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run src/lib/site-metadata.test.ts -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/site-metadata.ts src/main.tsx src/app/screens.tsx src/lib/mediaSession.js
git commit -m "feat: share seo brand metadata with mobile app"
```

### Task 6: Verification and SEO Audit Report

**Files:**
- Create: `docs/seo/audit-report.md`
- Modify: `web-app/index.html`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { getSeoAuditSummary } from "../docs/seo/audit-report";

describe("audit summary", () => {
  it("lists remaining opportunities", () => {
    const summary = getSeoAuditSummary();
    expect(summary).toContain("Lighthouse");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run web-app/docs/seo/audit-report.test.ts -v`
Expected: fail until the audit helper exists.

- [ ] **Step 3: Write minimal implementation**

```md
## Current issues
## Changes made
## Remaining opportunities
## Lighthouse expectations
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run web-app/docs/seo/audit-report.test.ts -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add docs/seo/audit-report.md web-app/index.html
git commit -m "docs: add seo audit report"
```

## Self-Review Checklist

- [ ] Every page route has a title, description, canonical URL, and index rule.
- [ ] `robots.txt` and `sitemap.xml` are generated from the same registry as the UI.
- [ ] Schema output exists for organization, website, breadcrumb, page, article, FAQ, and search action.
- [ ] Store links render in the web app top area with accessible labels.
- [ ] Mobile/tablet redirect remains configurable and does not affect desktop indexing.
- [ ] Brand references are natural, not stuffed.
- [ ] There is a documented SEO audit with current gaps and Lighthouse expectations.
