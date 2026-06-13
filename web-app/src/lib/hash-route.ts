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

function parseRawRoute(rawRoute: string): AppRoute {
  const raw = rawRoute.replace(/^#\/?/, "").replace(/^\/+/, "").trim();
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

export function parsePath(pathname: string, hash: string) {
  const pathRoute = pathname.replace(/^\/+/, "");
  if (pathRoute) return parseRawRoute(pathRoute);
  return parseRawRoute(hash);
}

export function routeToPath(route: AppRoute) {
  switch (route.view) {
    case "home":
      return "/";
    case "chapters":
      return "/chapters";
    case "study":
      return "/study";
    case "ai":
      return "/ai";
    case "chapter":
      return `/chapter/${route.chapter}`;
    case "verse":
      return `/verse/${route.chapter}/${route.verse}`;
  }
}

export function usePathRoute() {
  const [route, setRoute] = useState<AppRoute>(() =>
    parsePath(window.location.pathname, window.location.hash),
  );

  useEffect(() => {
    const sync = () => setRoute(parsePath(window.location.pathname, window.location.hash));
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    sync();
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  const navigate = (next: AppRoute) => {
    const path = routeToPath(next);
    if (window.location.pathname === path) {
      setRoute(next);
      return;
    }
    window.history.pushState({}, "", path);
    setRoute(next);
  };

  return { route, navigate };
}

export const parseHash = parseRawRoute;
export const routeToHash = routeToPath;
export const useHashRoute = usePathRoute;
