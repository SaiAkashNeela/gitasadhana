import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import App from "@/app/App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Easy Gita — The eternal song, made simple" },
      { name: "description", content: "A calm, devotional Bhagavad Gita reading experience. Verse by verse, word by word." },
      { property: "og:title", content: "Easy Gita" },
      { property: "og:description", content: "A calm, devotional Bhagavad Gita reading experience." },
      { property: "og:image", content: "https://static.zingdelights.com/4.png" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@400;500;600&family=Tiro+Devanagari+Sanskrit&display=swap",
      },
    ],
  }),
  component: Index,
});

function Index() {
  // HashRouter relies on window; render only on client to avoid SSR mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div className="min-h-dvh bg-gradient-warm" />;
  }
  return <App />;
}
