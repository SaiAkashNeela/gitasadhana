import { useEffect } from "react";
import { type LanguageCode } from "../lib/gita-data";
import { type SeoData } from "../lib/seo";

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement | HTMLLinkElement>(selector);
  if (!element) {
    element = document.createElement(selector.startsWith("link") ? "link" : "meta") as
      | HTMLMetaElement
      | HTMLLinkElement;
    document.head.appendChild(element);
  }
  Object.entries(attrs).forEach(([key, value]) => {
    element!.setAttribute(key, value);
  });
}

export function SeoHead({ seo, language }: { seo: SeoData; language: LanguageCode }) {
  useEffect(() => {
    document.title = seo.title;
    document.documentElement.lang = language;

    upsertMeta('meta[name="description"]', {
      name: "description",
      content: seo.description,
    });
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: seo.robots,
    });
    upsertMeta('meta[name="keywords"]', {
      name: "keywords",
      content: seo.keywords.join(", "),
    });
    upsertMeta('meta[property="og:title"]', {
      property: "og:title",
      content: seo.title,
    });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: seo.description,
    });
    upsertMeta('meta[property="og:type"]', {
      property: "og:type",
      content: seo.ogType,
    });
    upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: seo.canonicalUrl,
    });
    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: "/favicon-logo.png",
    });
    upsertMeta('meta[property="og:site_name"]', {
      property: "og:site_name",
      content: "GitaSadhana",
    });
    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });
    upsertMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: seo.title,
    });
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: seo.description,
    });

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = seo.canonicalUrl;

    const ldId = "gita-seo-jsonld";
    let jsonLdScript = document.head.querySelector<HTMLScriptElement>(`#${ldId}`);
    if (!jsonLdScript) {
      jsonLdScript = document.createElement("script");
      jsonLdScript.id = ldId;
      jsonLdScript.type = "application/ld+json";
      document.head.appendChild(jsonLdScript);
    }
    jsonLdScript.textContent = JSON.stringify(seo.jsonLd, null, 2);
  }, [language, seo]);

  return null;
}
