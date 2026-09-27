export const siteMetadata = {
  brandName: "GitaSadhana",
  displayName: "Gita Sadhana",
  tagline: "Ancient Wisdom for Modern Life",
  description:
    "Explore Bhagavad Gita chapters, verses, translations, audio recitation, and AI guidance with GitaSadhana by Sai Akash Neela.",
  founderName: "Sai Akash Neela",
  siteUrl: "https://gitasadhana.com",
  personalSiteUrl: "https://saiakashneela.com",
  githubUrl: "https://github.com/SaiAkashNeela",
  defaultShareImage: "/favicon-logo.png",
  appStoreUrl: "https://apps.apple.com/",
  playStoreUrl: "https://play.google.com/store",
  mobileRedirectUrl: "https://gitasadhana.com",
  chapterCount: 18,
  verseCountApprox: 700,
  keywords: [
    "GitaSadhana",
    "Gita Sadhana",
    "Sai Akash Neela",
    "Bhagavad Gita",
    "Bhagavad Gita study",
    "Bhagavad Gita verses",
    "Bhagavad Gita chapters",
    "Krishna teachings",
    "gitasadhana.com",
    "saiakashneela.com",
  ],
  sameAs: [
    "https://github.com/SaiAkashNeela",
    "https://saiakashneela.com",
    "https://gitasadhana.com",
  ],
} as const;

export function absoluteSiteUrl(pathname = "") {
  if (!pathname) return siteMetadata.siteUrl;
  if (/^https?:\/\//i.test(pathname)) return pathname;
  return new URL(pathname.replace(/^\//, ""), `${siteMetadata.siteUrl.replace(/\/$/, "")}/`).toString();
}

export function normalizePath(pathname: string) {
  if (!pathname || pathname === "/") return "/";
  const trimmed = pathname.trim();
  if (!trimmed.startsWith("/")) return `/${trimmed}`;
  return trimmed.replace(/\/+$/, "") || "/";
}
