import { useEffect, useMemo, useRef, useState } from "react";
import { auth, renderGoogleSignInButton, restoreAuthSession } from "./lib/auth";
import { apiRequest } from "./lib/backend";
import { getGuestSessionId } from "./lib/guest-session";
import { type ChatMessage } from "./lib/app-types";
import { usePathRoute } from "./lib/hash-route";
import { ChapterPage } from "./pages/ChapterPage";
import { ChaptersPage } from "./pages/ChaptersPage";
import { AiPage } from "./pages/AiPage";
import { HomePage } from "./pages/HomePage";
import { StudyPage } from "./pages/StudyPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { ContactPage } from "./pages/ContactPage";
import { ReportPage } from "./pages/ReportPage";
import { TopNav } from "./components/site-shell";
import { VersePage } from "./pages/VersePage";
import type { AuthSession } from "./lib/backend";
import { type LanguageCode } from "./lib/gita-data";
import { t } from "./lib/mobile-i18n";
import { SeoHead } from "./components/seo-head";
import { getSeoData } from "./lib/seo";
import { siteMetadata } from "../../src/lib/site-metadata";
import { Toaster } from "./components/ui/sonner";

function readJson<T>(key: string, fallback: T) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readString(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function App() {
  const { route, navigate } = usePathRoute();
  const [bookmarks, setBookmarks] = useState<string[]>(() =>
    readJson("gita_web_bookmarks", [] as string[]),
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    readJson("gita_web_chat", [] as ChatMessage[]),
  );
  const [language, setLanguage] = useState<LanguageCode>(
    () => readString("gita_web_language", "en") as LanguageCode,
  );
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [signedInUser, setSignedInUser] = useState<AuthSession["user"] | null>(auth.currentUser);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setSignedInUser);
    return unsubscribe;
  }, []);

  useEffect(() => {
    void restoreAuthSession().then((session) => {
      setSignedInUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    writeJson("gita_web_bookmarks", bookmarks);
  }, [bookmarks]);

  useEffect(() => {
    writeJson("gita_web_chat", messages);
  }, [messages]);

  useEffect(() => {
    writeJson("gita_web_language", language);
  }, [language]);

  useEffect(() => {
    if (signedInUser || !googleButtonRef.current) return;
    void renderGoogleSignInButton(googleButtonRef.current).catch((error) => {
      console.error(error);
    });
  }, [route.view, signedInUser]);

  const routeChapter =
    route.view === "chapter" || route.view === "verse" ? route.chapter : undefined;
  const routeVerse = route.view === "verse" ? route.verse : undefined;
  const seo = useMemo(() => getSeoData(route, language), [route, language]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [route.view, routeChapter, routeVerse]);

  async function sendChatMessage() {
    const text = chatInput.trim();
    if (!text || sending) return;
    const userMessage: ChatMessage = {
      id: `${Date.now()}-u`,
      role: "user",
      text,
      ts: Date.now(),
    };
    setMessages((current) => [...current, userMessage]);
    setChatInput("");
    setSending(true);
    setChatError(null);

    try {
      const response = await apiRequest<{ reply: string | null; limitReached: boolean }>(
        "/ai/chat",
        {
          method: "POST",
          body: {
            message: text,
            history: messages.slice(-16).map((message) => ({
              role: message.role,
              text: message.text,
            })),
            language,
          },
          headers: signedInUser
            ? undefined
            : {
                "x-guest-id": getGuestSessionId(),
              },
        },
      );

      if (response.limitReached) {
        setChatError(t("dailyLimitReached", language));
        return;
      }

      setMessages((current) => [
        ...current,
        { id: `${Date.now()}-m`, role: "model", text: response.reply ?? "", ts: Date.now() },
      ]);
    } catch (error) {
      setChatError(error instanceof Error ? error.message : t("somethingWentWrong", language));
      setMessages((current) => current.filter((message) => message.id !== userMessage.id));
    } finally {
      setSending(false);
    }
  }

  return (
    <div id="top" className="min-h-screen">
      <SeoHead seo={seo} language={language} />
      <TopNav
        route={route}
        signedInUser={signedInUser}
        googleButtonRef={googleButtonRef}
        language={language}
        appStoreUrl={import.meta.env.VITE_APP_STORE_URL || siteMetadata.appStoreUrl}
        playStoreUrl={import.meta.env.VITE_PLAY_STORE_URL || siteMetadata.playStoreUrl}
        onLanguageChange={setLanguage}
        onSignOut={() => {
          void auth.signOut().then(() => setSignedInUser(null));
        }}
        onNavigate={navigate}
      />

      {route.view === "home" && (
        <HomePage bookmarksCount={bookmarks.length} language={language} onNavigate={navigate} />
      )}
      {route.view === "chapters" && <ChaptersPage language={language} onNavigate={navigate} />}
      {route.view === "study" && <StudyPage language={language} />}
      {route.view === "ai" && (
        <AiPage
          messages={messages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          sending={sending}
          chatError={chatError}
          onSend={() => void sendChatMessage()}
          signedInUser={signedInUser}
          googleButtonRef={googleButtonRef}
          language={language}
        />
      )}
      {route.view === "privacy" && <PrivacyPage language={language} onNavigate={navigate} />}
      {route.view === "terms" && <TermsPage language={language} onNavigate={navigate} />}
      {route.view === "contact" && (
        <ContactPage
          language={language}
          signedInEmail={signedInUser?.email ?? null}
          onNavigate={navigate}
        />
      )}
      {route.view === "report" && (
        <ReportPage
          language={language}
          signedInEmail={signedInUser?.email ?? null}
          onNavigate={navigate}
        />
      )}
      {route.view === "chapter" && (
        <ChapterPage
          chapterNumber={route.chapter}
          language={language}
          bookmarks={bookmarks}
          setBookmarks={setBookmarks}
          onNavigate={navigate}
        />
      )}
      {route.view === "verse" && (
        <VersePage
          chapterNumber={route.chapter}
          verseNumber={route.verse}
          language={language}
          bookmarks={bookmarks}
          setBookmarks={setBookmarks}
          onNavigate={navigate}
        />
      )}

      <footer className="border-t border-black/5 bg-[rgba(250,244,233,0.8)]">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-4 py-8 text-sm text-muted-foreground md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p>
              © {new Date().getFullYear()} GitaSadhana. {t("footerWithCare", language)}
            </p>
            <p className="font-serif text-base text-foreground">ॐ शान्तिः शान्तिः शान्तिः</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.24em] text-amber-900/80">
            <span>{siteMetadata.founderName}</span>
            <span>•</span>
            <a
              className="transition hover:text-foreground"
              href={siteMetadata.personalSiteUrl}
              target="_blank"
              rel="noreferrer"
            >
              saiakashneela.com
            </a>
            <span>•</span>
            <a
              className="transition hover:text-foreground"
              href={siteMetadata.githubUrl}
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <span>•</span>
            <a className="transition hover:text-foreground" href={siteMetadata.siteUrl}>
              gitasadhana.com
            </a>
            <span>•</span>
            <button
              type="button"
              onClick={() => navigate({ view: "privacy" })}
              className="transition hover:text-foreground"
            >
              Privacy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => navigate({ view: "terms" })}
              className="transition hover:text-foreground"
            >
              Terms
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => navigate({ view: "contact" })}
              className="transition hover:text-foreground"
            >
              Contact
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => navigate({ view: "report" })}
              className="transition hover:text-foreground"
            >
              Report
            </button>
          </div>
        </div>
      </footer>
      <Toaster richColors position="top-right" />
    </div>
  );
}

export default App;
