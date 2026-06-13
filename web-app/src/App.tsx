import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Headphones,
  Heart,
  LogOut,
  Pause,
  Play,
  Search,
  Send,
  Sparkles,
  Star,
} from "lucide-react";
import { auth, renderGoogleSignInButton, restoreAuthSession } from "./lib/auth";
import {
  allVerses,
  articles,
  chapters,
  getChapterThumbnail,
  getChapterVerses,
  getVerse,
  getVerseAudioUrl,
  PLACEHOLDER_IMG,
  quotes,
  wisdomCards,
  formatVerseRef,
} from "./lib/gita-data";
import { getGuestSessionId } from "./lib/guest-session";
import { apiRequest } from "./lib/backend";
import type { AuthUser } from "./lib/backend";

type ChatMessage = {
  id: string;
  role: "user" | "model";
  text: string;
  ts: number;
};

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[30px] border border-black/5 bg-[rgba(255,251,244,0.92)] shadow-[0_16px_50px_-34px_rgba(86,58,24,0.45)] backdrop-blur-xl", className)}>
      {children}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  sub,
  action,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.36em] text-[#8a6747]">{eyebrow}</p>
        <h2 className="mt-2 font-serif text-3xl text-foreground md:text-4xl">{title}</h2>
        {sub && <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function TopNav({
  signedInUser,
  googleButtonRef,
  onSignOut,
}: {
  signedInUser: AuthUser | null;
  googleButtonRef: RefObject<HTMLDivElement | null>;
  onSignOut: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[rgba(250,244,233,0.8)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 md:px-6">
        <a href="#top" className="flex items-center gap-3">
          <div className="size-11 overflow-hidden rounded-2xl border border-amber-200/60 shadow-lg shadow-amber-900/10">
            <img src="/favicon-logo.png" alt="GitaSadhana" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="font-serif text-xl text-foreground">GitaSadhana</p>
            <p className="text-xs text-muted-foreground">A calm web home for the Bhagavad Gita</p>
          </div>
        </a>
        <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
          <a href="#chapters" className="hover:text-foreground">Chapters</a>
          <a href="#verses" className="hover:text-foreground">Verses</a>
          <a href="#audio" className="hover:text-foreground">Audio</a>
          <a href="#wisdom" className="hover:text-foreground">Wisdom</a>
          <a href="#insights" className="hover:text-foreground">Insights</a>
        </nav>
        <div className="flex items-center gap-3">
          {signedInUser ? (
            <>
              <div className="hidden items-center gap-3 rounded-full border border-black/5 bg-white/80 px-3 py-2 md:flex">
                <img
                  src={signedInUser.photoURL || "/favicon-logo.png"}
                  alt={signedInUser.displayName}
                  className="size-8 rounded-full object-cover"
                />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{signedInUser.displayName}</p>
                  <p className="text-xs text-muted-foreground">{signedInUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-foreground"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : (
            <div ref={googleButtonRef} />
          )}
        </div>
      </div>
    </header>
  );
}

function AudioBar({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = src;
    audio.load();
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onDuration = () => setDuration(audio.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("durationchange", onDuration);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("durationchange", onDuration);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Audio recitation</p>
          <p className="mt-2 font-serif text-2xl text-foreground">{title}</p>
        </div>
        <button
          type="button"
          onClick={async () => {
            const audio = audioRef.current;
            if (!audio) return;
            if (audio.paused) {
              await audio.play();
            } else {
              audio.pause();
            }
          }}
          className="inline-flex size-12 items-center justify-center rounded-full bg-[#a96616] text-white shadow-lg shadow-amber-900/20"
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
      </div>
      <div className="mt-4">
        <input
          type="range"
          min={0}
          max={Math.max(duration, 0)}
          value={currentTime}
          onChange={(event) => {
            const audio = audioRef.current;
            if (!audio) return;
            audio.currentTime = Number(event.target.value);
            setCurrentTime(Number(event.target.value));
          }}
          className="w-full accent-[#a96616]"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      <audio ref={audioRef} preload="metadata" src={src} />
    </Card>
  );
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

function App() {
  const [activeChapter, setActiveChapter] = useState(2);
  const [activeVerse, setActiveVerse] = useState(47);
  const [verseSearch, setVerseSearch] = useState("");
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("gita_web_bookmarks") || "[]");
    } catch {
      return [];
    }
  });
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("gita_web_chat") || "[]");
    } catch {
      return [];
    }
  });
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [signedInUser, setSignedInUser] = useState(auth.currentUser);
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
    localStorage.setItem("gita_web_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem("gita_web_chat", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (signedInUser || !googleButtonRef.current) return;
    void renderGoogleSignInButton(googleButtonRef.current).catch((error) => {
      console.error(error);
    });
  }, [signedInUser]);

  const selectedChapterData = chapters.find((chapter) => chapter.chapter_number === activeChapter) ?? chapters[0];
  const selectedVerseData = getVerse(activeChapter, activeVerse) ?? getVerse(2, 47)!;
  const verseList = useMemo(() => {
    const items = getChapterVerses(activeChapter);
    if (!verseSearch.trim()) return items;
    const q = verseSearch.trim().toLowerCase();
    return items.filter((verse) => {
      const ref = formatVerseRef(verse.chapter, verse.verse);
      return (
        ref.includes(q) ||
        verse.sanskrit.toLowerCase().includes(q) ||
        verse.transliteration.toLowerCase().includes(q) ||
        verse.translation.en.simple.toLowerCase().includes(q) ||
        verse.translation.en.deep.toLowerCase().includes(q)
      );
    });
  }, [activeChapter, verseSearch]);

  const allVerseResults = useMemo(() => {
    const q = verseSearch.trim().toLowerCase();
    if (!q) return allVerses.slice(0, 24);
    return allVerses.filter((verse) => {
      const ref = formatVerseRef(verse.chapter, verse.verse);
      return (
        ref.includes(q) ||
        verse.sanskrit.toLowerCase().includes(q) ||
        verse.transliteration.toLowerCase().includes(q) ||
        verse.translation.en.simple.toLowerCase().includes(q) ||
        verse.translation.en.deep.toLowerCase().includes(q)
      );
    });
  }, [verseSearch]);

  const chapterQuote = quotes[(activeChapter - 1) % quotes.length] ?? quotes[0];

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
      const response = await apiRequest<{ reply: string | null; limitReached: boolean }>("/ai/chat", {
        method: "POST",
        body: {
          message: text,
          history: messages.slice(-16).map((message) => ({
            role: message.role,
            text: message.text,
          })),
          language: "en",
        },
        headers: signedInUser
          ? undefined
          : {
              "x-guest-id": getGuestSessionId(),
            },
      });

      if (response.limitReached) {
        setChatError("Daily limit reached. Please return tomorrow.");
        return;
      }

      setMessages((current) => [
        ...current,
        { id: `${Date.now()}-m`, role: "model", text: response.reply ?? "", ts: Date.now() },
      ]);
    } catch (error) {
      setChatError(error instanceof Error ? error.message : "Something went wrong.");
      setMessages((current) => current.filter((message) => message.id !== userMessage.id));
    } finally {
      setSending(false);
    }
  }

  return (
    <div id="top" className="min-h-screen">
      <TopNav
        signedInUser={signedInUser}
        googleButtonRef={googleButtonRef}
        onSignOut={() => {
          void auth.signOut().then(() => setSignedInUser(null));
        }}
      />

      <main className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
                <div className="relative p-6 md:p-10">
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs uppercase tracking-[0.32em] text-amber-800">
                    <Sparkles size={14} />
                    Web Edition
                  </div>
                  <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-tight text-foreground md:text-6xl">
                    The Bhagavad Gita, laid out for desktop and tablet reading
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                    Browse all 18 chapters, explore verses with Sanskrit and translations, play verse audio, and sign in with Google on the web.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <a
                      href="#chapters"
                      className="inline-flex items-center gap-2 rounded-full bg-[#a96616] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-amber-900/15 transition hover:bg-[#8d5714]"
                    >
                      Start reading <ArrowRight size={16} />
                    </a>
                    <a
                      href="#audio"
                      className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/80 px-5 py-3 text-sm font-medium text-foreground transition hover:bg-white"
                    >
                      <Headphones size={16} />
                      Audio player
                    </a>
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    {[
                      ["18", "Chapters", BookOpen],
                      ["700+", "Verses", Star],
                      [bookmarks.length.toString(), "Saved verses", Heart],
                    ].map(([value, label, Icon]) => (
                      <Card key={label as string} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-serif text-3xl text-foreground">{value}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
                          </div>
                          <Icon size={18} className="text-amber-700" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="relative min-h-[420px] overflow-hidden">
                  <img
                    src={PLACEHOLDER_IMG}
                    alt="Bhagavad Gita"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/18 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
                    <p className="text-xs uppercase tracking-[0.32em] text-white/70">Today’s verse</p>
                    <p className="mt-2 font-serif text-2xl leading-snug md:text-3xl">
                      “{selectedVerseData.translation.en.simple}”
                    </p>
                    <p className="mt-3 text-sm text-white/75">
                      Bhagavad Gita {formatVerseRef(selectedVerseData.chapter, selectedVerseData.verse)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <section id="chapters" className="scroll-mt-8">
              <SectionHeading
                eyebrow="Library"
                title="All chapters"
                sub="Tap any chapter to open its verses, summary, and audio flow."
              />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {chapters.map((chapter) => (
                  <button
                    key={chapter.chapter_number}
                    type="button"
                    onClick={() => {
                      setActiveChapter(chapter.chapter_number);
                      setActiveVerse(1);
                      setVerseSearch("");
                      document.getElementById("verses")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={cn(
                      "group rounded-[28px] border p-4 text-left transition hover:-translate-y-0.5",
                      activeChapter === chapter.chapter_number
                        ? "border-amber-300 bg-amber-50 shadow-[0_16px_50px_-34px_rgba(86,58,24,0.42)]"
                        : "border-black/5 bg-[rgba(255,252,246,0.96)]"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="size-20 shrink-0 overflow-hidden rounded-[24px] border border-amber-200/50">
                        <img
                          src={getChapterThumbnail(chapter.chapter_number)}
                          alt={chapter.title.en}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.3em] text-amber-700">Chapter {chapter.chapter_number}</p>
                        <h3 className="mt-1 font-serif text-2xl text-foreground">{chapter.title.en}</h3>
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                          {chapter.summary.en}
                        </p>
                        <p className="mt-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                          {chapter.verseCount} verses
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section id="verses" className="scroll-mt-8">
              <SectionHeading
                eyebrow="Reading"
                title={`Chapter ${selectedChapterData.chapter_number}: ${selectedChapterData.title.en}`}
                sub={selectedChapterData.fullSummary.en}
                action={
                  <div className="flex items-center gap-2 rounded-full border border-black/6 bg-white/80 px-3 py-2">
                    <Search size={15} className="text-muted-foreground" />
                    <input
                      value={verseSearch}
                      onChange={(e) => setVerseSearch(e.target.value)}
                      placeholder="Search verses"
                      className="w-44 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                }
              />

              <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-4">
                  <Card className="overflow-hidden p-0">
                    <div className="border-b border-black/5 p-6">
                      <p className="text-xs uppercase tracking-[0.3em] text-amber-700">Verse spotlight</p>
                      <h3 className="mt-2 font-serif text-3xl text-foreground">
                        Chapter {selectedVerseData.chapter}, Verse {selectedVerseData.verse}
                      </h3>
                    </div>
                    <div className="space-y-5 p-6">
                      <p className="whitespace-pre-wrap text-2xl leading-relaxed text-foreground/95">
                        {selectedVerseData.sanskrit}
                      </p>
                      <p className="rounded-[22px] bg-amber-50 p-4 text-base leading-relaxed text-foreground">
                        {selectedVerseData.transliteration}
                      </p>
                      <div className="grid gap-4 md:grid-cols-3">
                        {[
                          ["Simple", selectedVerseData.translation.en.simple],
                          ["Deep", selectedVerseData.translation.en.deep],
                          ["Essence", selectedVerseData.translation.en.essence],
                        ].map(([label, value]) => (
                          <Card key={label as string} className="p-4">
                            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">{label}</p>
                            <p className="mt-2 text-sm leading-relaxed text-foreground">{value as string}</p>
                          </Card>
                        ))}
                      </div>
                      {selectedVerseData.word_meanings && (
                        <Card className="p-4">
                          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Word meanings</p>
                          <p className="mt-2 text-sm leading-relaxed text-foreground">{selectedVerseData.word_meanings}</p>
                        </Card>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {bookmarks.includes(formatVerseRef(selectedVerseData.chapter, selectedVerseData.verse)) ? (
                          <button
                            type="button"
                            onClick={() => setBookmarks((prev) => prev.filter((entry) => entry !== formatVerseRef(selectedVerseData.chapter, selectedVerseData.verse)))}
                            className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900"
                          >
                            <Heart size={16} /> Saved
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setBookmarks((prev) => [...prev, formatVerseRef(selectedVerseData.chapter, selectedVerseData.verse)])}
                            className="inline-flex items-center gap-2 rounded-full bg-[#a96616] px-4 py-2 text-sm font-medium text-white"
                          >
                            <Heart size={16} /> Save verse
                          </button>
                        )}
                        <a
                          href="#audio"
                          className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-foreground"
                        >
                          <Headphones size={16} /> Hear audio
                        </a>
                      </div>
                    </div>
                  </Card>

                  <AudioBar src={getVerseAudioUrl(selectedVerseData.chapter, selectedVerseData.verse)} title={`Verse ${formatVerseRef(selectedVerseData.chapter, selectedVerseData.verse)}`} />
                </div>

                <div className="space-y-4">
                  <Card className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Verses in this chapter</p>
                        <p className="mt-1 font-serif text-xl text-foreground">Browse and open any verse</p>
                      </div>
                    </div>
                    <div className="mt-4 max-h-[620px] space-y-3 overflow-y-auto pr-1 scroll-hide">
                      {verseList.map((verse) => (
                        <button
                          key={`${verse.chapter}-${verse.verse}`}
                          type="button"
                          onClick={() => setActiveVerse(verse.verse)}
                          className={cn(
                            "w-full rounded-[24px] border p-4 text-left transition",
                            activeVerse === verse.verse
                              ? "border-amber-300 bg-amber-50 shadow-lg shadow-amber-900/10"
                              : "border-black/5 bg-white/90 hover:border-amber-200"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.3em] text-amber-700">
                                Verse {verse.chapter}.{verse.verse}
                              </p>
                              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground">
                                {verse.translation.en.simple}
                              </p>
                            </div>
                            <ChevronRight size={16} className="text-muted-foreground" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Search all verses</p>
                    <div className="mt-4 grid gap-3">
                      {allVerseResults.slice(0, 8).map((verse) => (
                        <button
                          key={`${verse.chapter}-${verse.verse}`}
                          type="button"
                          onClick={() => {
                            setActiveChapter(verse.chapter);
                            setActiveVerse(verse.verse);
                          }}
                          className="rounded-[22px] border border-black/5 bg-white/90 p-4 text-left transition hover:border-amber-200"
                        >
                          <p className="text-xs uppercase tracking-[0.28em] text-amber-700">
                            {formatVerseRef(verse.chapter, verse.verse)}
                          </p>
                          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground">
                            {verse.translation.en.simple}
                          </p>
                        </button>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </section>

            <section id="ai" className="scroll-mt-8">
              <SectionHeading
                eyebrow="Assistant"
                title="Gita AI"
                sub="A calm chat space for verses, life questions, and devotional reflection."
              />
              <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <Card className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="size-12 overflow-hidden rounded-2xl border border-amber-200/60 shadow-lg shadow-amber-900/10">
                      <img src="/favicon-logo.png" alt="Gita AI" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="font-serif text-2xl text-foreground">Gita AI</p>
                      <p className="text-sm text-muted-foreground">Works with or without login</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    Ask a question about the Bhagavad Gita, a chapter, or a life situation. Signed-in users keep their browser session; guests use a local guest id.
                  </p>
                  <div className="mt-5 space-y-2">
                    {[
                      "What is the meaning of Chapter 2, Verse 47?",
                      "How do I practice karma yoga at work?",
                      "Explain detachment in simple language.",
                    ].map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => setChatInput(prompt)}
                        className="w-full rounded-[22px] border border-black/5 bg-white/90 px-4 py-3 text-left text-sm text-foreground transition hover:border-amber-200"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                  <div className="mt-5 flex items-end gap-3">
                    <textarea
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          void sendChatMessage();
                        }
                      }}
                      rows={2}
                      placeholder="Ask about the Bhagavad Gita..."
                      className="min-h-[58px] flex-1 resize-none rounded-[22px] border border-black/8 bg-white px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => void sendChatMessage()}
                      disabled={sending || !chatInput.trim()}
                      className="inline-flex size-12 items-center justify-center rounded-full bg-[#a96616] text-white shadow-lg shadow-amber-900/20 disabled:opacity-50"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                  {chatError && <p className="mt-3 text-sm text-[#a6472a]">{chatError}</p>}
                </Card>

                <Card className="min-h-[380px] p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Conversation</p>
                  <div className="mt-4 max-h-[530px] space-y-3 overflow-y-auto pr-1 scroll-hide">
                    {messages.length === 0 ? (
                      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[24px] border border-dashed border-amber-200 bg-amber-50/55 px-8 text-center">
                        <div className="size-14 overflow-hidden rounded-full border border-amber-200">
                          <img src="/favicon-logo.png" alt="Gita AI" className="h-full w-full object-cover" />
                        </div>
                        <p className="mt-4 font-serif text-2xl text-foreground">Hare Krishna</p>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          Start with a question and the assistant will answer in a calm, devotional tone.
                        </p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                        >
                          <div
                            className={cn(
                              "max-w-[80%] rounded-[22px] px-4 py-3 text-sm leading-relaxed",
                              message.role === "user"
                                ? "rounded-br-md bg-[#a96616] text-white"
                                : "rounded-bl-md bg-amber-50 text-foreground"
                            )}
                          >
                            {message.text}
                          </div>
                        </div>
                      ))
                    )}
                    {sending && <p className="text-sm text-muted-foreground">Gita AI is typing...</p>}
                  </div>
                </Card>
              </div>
            </section>

            <section id="audio" className="scroll-mt-8">
              <SectionHeading
                eyebrow="Audio"
                title="Verse recitation"
                sub="Each verse can play its own audio track. Select a verse above, then listen here."
              />
              <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                <Card className="overflow-hidden">
                  <img src={PLACEHOLDER_IMG} alt="Audio preview" className="h-56 w-full object-cover" />
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Now playing</p>
                    <p className="mt-2 font-serif text-2xl text-foreground">
                      Bhagavad Gita {formatVerseRef(selectedVerseData.chapter, selectedVerseData.verse)}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {selectedVerseData.translation.en.simple}
                    </p>
                  </div>
                </Card>
                <Card className="p-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[22px] bg-amber-50 p-4">
                      <p className="text-xs uppercase tracking-[0.28em] text-amber-700">Chapter audio</p>
                      <p className="mt-2 text-sm leading-relaxed text-foreground">
                        Chapter {activeChapter} contains {getChapterVerses(activeChapter).length} verses, each available with an audio recitation track.
                      </p>
                    </div>
                    <div className="rounded-[22px] bg-amber-50 p-4">
                      <p className="text-xs uppercase tracking-[0.28em] text-amber-700">Listen safely</p>
                      <p className="mt-2 text-sm leading-relaxed text-foreground">
                        Audio uses the verse track URL mapped from the Bhagavad Gita content set.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-[22px] border border-black/5 bg-white/80 p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Quick actions</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveVerse(Math.max(1, activeVerse - 1))}
                        className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-foreground"
                      >
                        Previous verse
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveVerse(Math.min(selectedChapterData.verseCount, activeVerse + 1))}
                        className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-foreground"
                      >
                        Next verse
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            <section id="wisdom" className="scroll-mt-8">
              <SectionHeading eyebrow="Wisdom" title="A teaching for every day" sub="Short reflections drawn from the Gita's enduring themes." />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {wisdomCards.map((item) => (
                  <Card key={item.theme} className="p-5">
                    <div className="flex items-center gap-2 text-amber-700">
                      <Sparkles size={16} />
                      <p className="text-xs uppercase tracking-[0.28em]">{item.theme}</p>
                    </div>
                    <p className="mt-4 font-serif text-2xl leading-snug text-foreground">“{item.line}”</p>
                  </Card>
                ))}
              </div>
            </section>

            <section id="insights" className="scroll-mt-8 pb-8">
              <SectionHeading eyebrow="Insights" title="Slow reading, thoughtful context" sub="A few editorial sections to keep the site feeling complete and web-native." />
              <div className="grid gap-4 lg:grid-cols-2">
                {articles.map((article) => (
                  <Card key={article.title} className="overflow-hidden">
                    <div className="grid gap-0 md:grid-cols-[180px_minmax(0,1fr)]">
                      <img src={PLACEHOLDER_IMG} alt={article.title} className="h-44 w-full object-cover md:h-full" />
                      <div className="p-5">
                        <p className="text-xs uppercase tracking-[0.28em] text-amber-700">{article.tag}</p>
                        <h3 className="mt-2 font-serif text-2xl text-foreground">{article.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <Card className="p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Google sign-in</p>
              {signedInUser ? (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={signedInUser.photoURL || "/favicon-logo.png"}
                      alt={signedInUser.displayName}
                      className="size-14 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-serif text-2xl text-foreground">{signedInUser.displayName}</p>
                      <p className="text-sm text-muted-foreground">{signedInUser.email}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Your web session is stored locally so you stay signed in until you choose to leave.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Sign in with Google to keep a web account tied to your browser. AI chat still works without login if you add it later.
                  </p>
                  <div ref={googleButtonRef} />
                </div>
              )}
            </Card>

            <Card className="p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Verse of the day</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Chapter {formatVerseRef(selectedVerseData.chapter, selectedVerseData.verse)}</p>
              <p className="mt-3 font-serif text-2xl leading-snug text-foreground">
                “{chapterQuote.text}”
              </p>
            </Card>

            <Card className="overflow-hidden">
              <img src={PLACEHOLDER_IMG} alt="GitaSadhana" className="h-52 w-full object-cover" />
              <div className="p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">A small note</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  This website is now a plain React + Vite app, separate from the mobile app, and the TanStack runtime has been removed.
                </p>
              </div>
            </Card>

            <Card className="p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Saved verses</p>
              <div className="mt-4 space-y-3">
                {bookmarks.length ? (
                  bookmarks.slice(0, 6).map((ref) => {
                    const [chapter, verse] = ref.split(".").map(Number);
                    const verseData = getVerse(chapter, verse);
                    if (!verseData) return null;
                    return (
                      <button
                        key={ref}
                        type="button"
                        onClick={() => {
                          setActiveChapter(chapter);
                          setActiveVerse(verse);
                        }}
                        className="w-full rounded-[22px] border border-black/5 bg-white/90 p-4 text-left"
                      >
                        <p className="text-xs uppercase tracking-[0.28em] text-amber-700">Verse {ref}</p>
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground">
                          {verseData.translation.en.simple}
                        </p>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-sm leading-relaxed text-muted-foreground">No verses saved yet.</p>
                )}
              </div>
            </Card>

            <Card className="p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Search cue</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Use the verse search to jump by chapter, Sanskrit, transliteration, or English meaning. That keeps the website useful on desktop without feeling like a phone shell.
              </p>
            </Card>
          </aside>
        </div>
      </main>

      <footer className="border-t border-black/5 bg-[rgba(250,244,233,0.8)]">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
          <p>© {new Date().getFullYear()} GitaSadhana. With reverence and care.</p>
          <p className="font-serif text-base text-foreground">ॐ शान्तिः शान्तिः शान्तिः</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
