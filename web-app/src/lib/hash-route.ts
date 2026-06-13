import { useEffect, useState } from "react";

export type AppRoute =
  | { view: "home" }
  | { view: "chapters" }
  | { view: "study" }
  | { view: "ai" }
  | { view: "chapter"; chapter: number }
  | { view: "verse"; chapter: number; verse: number };

function clampNumber(value: string | undefined, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return null;
  return Math.min(max, Math.max(min, parsed));
}

export function parseHash(hash: string): AppRoute {
  const raw = hash.replace(/^#\/?/, "").trim();
  if (!raw || raw === "top" || raw === "home") return { view: "home" };

  const parts = raw.split("/").filter(Boolean);
  const [section, a, b] = parts;

  if (section === "chapters") return { view: "chapters" };
  if (section === "study") return { view: "study" };
  if (section === "ai") return { view: "ai" };

  if (section === "chapter") {
    const chapter = clampNumber(a, 1, 18);
    if (chapter) return { view: "chapter", chapter };
  }

  if (section === "verse") {
    const chapter = clampNumber(a, 1, 18);
    const verse = clampNumber(b, 1, 200);
    if (chapter && verse) return { view: "verse", chapter, verse };
  }

  return { view: "home" };
}

export function routeToHash(route: AppRoute) {
  switch (route.view) {
    case "home":
      return "#home";
    case "chapters":
      return "#chapters";
    case "study":
      return "#study";
    case "ai":
      return "#ai";
    case "chapter":
      return `#chapter/${route.chapter}`;
    case "verse":
      return `#verse/${route.chapter}/${route.verse}`;
  }
}

export function useHashRoute() {
  const [route, setRoute] = useState<AppRoute>(() => parseHash(window.location.hash));

  useEffect(() => {
    const update = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", update);
    update();
    return () => window.removeEventListener("hashchange", update);
  }, []);

  const navigate = (next: AppRoute) => {
    const hash = routeToHash(next);
    if (window.location.hash === hash) {
      setRoute(next);
      return;
    }
    window.location.hash = hash;
  };

  return { route, navigate };
}
