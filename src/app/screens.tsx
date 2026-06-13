import { useState, useEffect, useRef, ReactNode } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Flower2,
  Bell,
  Search,
  Play,
  Pause,
  Bookmark,
  BookmarkCheck,
  Heart,
  Share2,
  ChevronRight,
  Sparkles,
  BookOpen,
  Headphones,
  Clock,
  Download,
  Settings as SettingsIcon,
  Flame,
  Moon,
  Sun,
  Languages,
  ChevronLeft,
  SkipBack,
  SkipForward,
  Plus,
  Trash2,
  FileText,
  History as HistoryIcon,
  CheckCircle2,
  Circle,
  Volume2,
  LogOut,
  Info,
  Database,
  RefreshCw,
  Repeat,
  Trophy,
  Calendar,
  Megaphone,
  ArrowUp,
  ArrowDownToLine,
  X,
  AlertTriangle,
  Send,
  Wifi,
  WifiOff,
  RotateCcw,
  Type,
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";

import {
  ScreenWrapper,
  Header,
  AppCard,
  PrimaryButton,
  GhostButton,
  IconButton,
  ProgressBar,
  ImageBanner,
  SectionTitle,
  BottomTabs,
  ChapterCard,
  VerseCard,
  EmptyState,
  Skeleton,
} from "@/app/components/ui";

import { useUserProgress, UserNote, HistoryItem } from "@/hooks/useUserProgress";
import {
  useChapters,
  useVersesInChapter,
  useVerseDetail,
  useQuotes,
  Verse,
} from "@/hooks/useGitaData";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { signInWithGoogle, signInWithApple } from "@/lib/auth";
import { seedGitaDatabase, SeedingProgress } from "@/lib/seeding";
import { sendContactEmail, sendCorrectionEmail, sendWelcomeEmail } from "@/lib/api/email.functions";
import { useGitaAI } from "@/hooks/useGitaAI";
import { getReminderConfig, updateReminderSettings, formatTime12Hour, localizedReminders } from "@/lib/notifications";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import gitaProcessedData from "@/app/gita-processed.json";

export const DEMO_IMG = "https://static.zingdelights.com/4.png";

export function AnimatedImageBanner({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  const [currentIdx, setCurrentIdx] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev % 9) + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const scenes = Array.from({ length: 9 }, (_, i) => `/assets/images/scene_${i + 1}.png`);

  return (
    <div className={cn("relative overflow-hidden rounded-3xl shadow-soft", className)}>
      {/* Background scenes */}
      {scenes.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`Scene ${i + 1}`}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out",
            i + 1 === currentIdx ? "opacity-100" : "opacity-0"
          )}
        />
      ))}

      {/* Dark overlays for text contrast */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent pointer-events-none" />

      {/* Content overlay */}
      {children && (
        <div className="absolute inset-0 p-5 flex flex-col justify-end text-white z-10">
          {children}
        </div>
      )}
    </div>
  );
}

const supportedLanguages = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "sa", name: "Sanskrit", native: "संस्कृतम्" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "ne", name: "Nepali", native: "नेपाली" },
];

function GitaAiAvatar({
  className,
  iconSize,
}: {
  className: string;
  iconSize: number;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full border border-amber-200/70 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.95),rgba(251,191,36,0.95)_38%,rgba(234,88,12,0.98)_100%)] shadow-soft flex items-center justify-center",
        className,
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.45),transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(145deg,transparent_0%,rgba(255,255,255,0.08)_50%,transparent_100%)]" />
      <Sparkles size={Math.max(10, Math.round(iconSize * 0.32))} className="absolute right-[12%] top-[14%] text-white/90" />
      <Flower2
        size={iconSize}
        className="relative z-10 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
      />
    </div>
  );
}

/* ───────────────────────── 1. Welcome ───────────────────────── */
export function Welcome() {
  const { selectedLanguage } = useUserProgress();
  return (
    <ScreenWrapper pad={false} className="bg-[#FAF6EE] dark:bg-background">
      <div className="flex-1 flex flex-col justify-between select-none relative overflow-hidden bg-[#FAF6EE] dark:bg-background text-[#5c4a37] dark:text-foreground">
        {/* Full-bleed Top Hero Image with linear bottom fade-out */}
        <div className="w-full h-[52dvh] relative overflow-hidden shrink-0 animate-scale-in">
          <img
            src="/assets/welcome_journey.png"
            alt="Bhagavad Gita"
            className="w-full h-full object-cover"
          />
          {/* Flawless soft-edge content fade blending the bottom into the background */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FAF6EE] dark:from-background to-transparent pointer-events-none" />
        </div>

        {/* Content area: Centered typography & elegant gold ornaments */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center z-10 animate-fade-up delay-150 min-h-0">
          
          {/* Golden Lotus Ornament Separator — thin gold lines fading outward with a golden lotus */}
          <div className="flex items-center gap-3 w-full justify-center opacity-90 mt-1">
            <div className="h-[1px] w-14 bg-gradient-to-r from-transparent via-[#d4af37]/45 to-[#d4af37]" />
            <span className="text-[#c59b27] text-2xl font-serif leading-none select-none">🪷</span>
            <div className="h-[1px] w-14 bg-gradient-to-l from-transparent via-[#d4af37]/45 to-[#d4af37]" />
          </div>

          {/* Centered multi-lingual headers */}
          <div className="mt-3.5 space-y-0.5">
            <span className="font-serif text-[#8c7453] dark:text-muted-foreground text-xl font-light italic leading-none block">
              {t("welcomeLine1", selectedLanguage)}
            </span>
            <h1 className="font-serif text-[42px] font-medium tracking-wide text-[#4a3621] dark:text-foreground leading-tight block">
              {t("welcomeLine2", selectedLanguage)}
            </h1>
          </div>

          {/* Gold Diamond ornament with divider lines */}
          <div className="flex items-center gap-2 mt-3.5 opacity-80">
            <div className="h-[1px] w-8 bg-[#e8dec9] dark:bg-border/60" />
            <span className="text-[#c59b27] text-xs leading-none">❖</span>
            <div className="h-[1px] w-8 bg-[#e8dec9] dark:bg-border/60" />
          </div>

          {/* Description Subtitle */}
          <p className="mt-3 text-[#5c4a37] dark:text-foreground/90 font-serif leading-relaxed text-[15px] max-w-sm px-2 text-balance">
            {t("welcomeSub", selectedLanguage)}
          </p>

          {/* Prayer Hands divider line */}
          <div className="flex items-center gap-3 mt-5 opacity-90">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#d4af37]/40 to-[#d4af37]/80" />
            <span className="text-[#c59b27] text-xl leading-none">🙏</span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent via-[#d4af37]/40 to-[#d4af37]/80" />
          </div>
        </div>

        {/* CTA Terracotta Button */}
        <div className="px-6 mt-2 mb-4 shrink-0 animate-fade-up delay-250">
          <Link to="/onboarding/2">
            <button type="button" className="w-full h-12 rounded-full bg-[#C06D31] hover:bg-[#A65B25] active:scale-[0.985] transition-all duration-200 shadow-md text-white font-serif text-lg tracking-wide flex items-center justify-center gap-2 group">
              <span>{t("Continue", selectedLanguage)}</span>
              <span className="text-xl transition-transform duration-200 group-hover:translate-x-1">➔</span>
            </button>
          </Link>
        </div>

        {/* Page dot indicators at bottom */}
        <div className="flex justify-center gap-2 pb-safe shrink-0 animate-fade-up delay-350">
          <span className="size-2.5 rounded-full bg-[#8c7453] dark:bg-primary transition-all duration-300" />
          <span className="size-2.5 rounded-full bg-[#e8dec9] dark:bg-muted transition-all duration-300" />
        </div>
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 2 & 3. Onboarding slides ───────────── */
const slides = [
  {
    img: "/assets/listen_return.png",
    titleKey: "onboardingSlideTitle2",
    bodyKey: "onboardingSlideBody2",
  },
];

export function Onboarding() {
  const { selectedLanguage } = useUserProgress();
  const s = slides[0];

  const slideTitle = t(s.titleKey, selectedLanguage);
  const slideBody = s.bodyKey ? t(s.bodyKey, selectedLanguage) : "";

  return (
    <ScreenWrapper pad={false} className="bg-[#FAF6EE] dark:bg-background">
      <div className="flex-1 flex flex-col justify-between select-none relative overflow-hidden bg-[#FAF6EE] dark:bg-background text-[#5c4a37] dark:text-foreground">
        {/* Full-bleed Top Hero Image with linear bottom fade-out */}
        <div className="w-full h-[52dvh] relative overflow-hidden shrink-0 animate-scale-in">
          <img
            src={s.img}
            alt={slideTitle}
            className="w-full h-full object-cover"
          />
          {/* Flawless soft-edge content fade blending the bottom into the background */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FAF6EE] dark:from-background to-transparent pointer-events-none" />

          {/* Nav overlay - positioned elegantly over the top banner */}
          <div className="absolute top-0 inset-x-0 px-6 pt-safe pb-4 flex justify-between items-center z-20">
            <Link to="/" className="h-9 px-4 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/90 text-sm flex items-center justify-center font-serif tracking-wide active:opacity-75 transition-opacity shadow-sm">
              {t("back", selectedLanguage)}
            </Link>
            <Link to="/language" className="h-9 px-4 rounded-full bg-white/15 backdrop-blur-md border border-white/10 text-white/95 text-sm flex items-center justify-center font-medium active:opacity-75 transition-opacity shadow-sm">
              {t("skip", selectedLanguage)}
            </Link>
          </div>
        </div>

        {/* Content area: Centered typography & elegant ornaments */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center z-10 animate-fade-up delay-150 min-h-0">
          
          {/* Golden Lotus Ornament Separator */}
          <div className="flex items-center gap-3 w-full justify-center opacity-90 mt-1">
            <div className="h-[1px] w-14 bg-gradient-to-r from-transparent via-[#d4af37]/45 to-[#d4af37]" />
            <span className="text-[#c59b27] text-2xl font-serif leading-none select-none">🪷</span>
            <div className="h-[1px] w-14 bg-gradient-to-l from-transparent via-[#d4af37]/45 to-[#d4af37]" />
          </div>

          {/* Centered slide headings */}
          <h2 className="font-serif text-[32px] font-medium tracking-wide text-[#4a3621] dark:text-foreground leading-tight mt-4 block">
            {slideTitle}
          </h2>

          {/* Gold Diamond ornament */}
          <div className="flex items-center gap-2 mt-3.5 opacity-80">
            <div className="h-[1px] w-8 bg-[#e8dec9] dark:bg-border/60" />
            <span className="text-[#c59b27] text-xs leading-none">❖</span>
            <div className="h-[1px] w-8 bg-[#e8dec9] dark:bg-border/60" />
          </div>

          {/* Slide Description Body */}
          <p className="mt-3.5 text-[#5c4a37] dark:text-foreground/90 font-serif leading-relaxed text-[15px] max-w-sm px-4 text-balance">
            {slideBody}
          </p>

          {/* Gold separator */}
          <div className="flex items-center gap-3 mt-5 opacity-90">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#d4af37]/40 to-[#d4af37]/80" />
            <span className="text-[#c59b27] text-xl leading-none">🙏</span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent via-[#d4af37]/40 to-[#d4af37]/80" />
          </div>
        </div>

        {/* CTA Terracotta Button */}
        <div className="px-6 mt-2 mb-4 shrink-0 animate-fade-up delay-250">
          <Link to="/language">
            <button type="button" className="w-full h-12 rounded-full bg-[#C06D31] hover:bg-[#A65B25] active:scale-[0.985] transition-all duration-200 shadow-md text-white font-serif text-lg tracking-wide flex items-center justify-center gap-2 group">
              <span>{t("continueBtn", selectedLanguage)}</span>
              <span className="text-xl transition-transform duration-200 group-hover:translate-x-1">➔</span>
            </button>
          </Link>
        </div>

        {/* Page dot indicators at bottom: condensed to 2 dots (inactive, active) */}
        <div className="flex justify-center gap-2 pb-safe shrink-0 animate-fade-up delay-350">
          <span className="size-2.5 rounded-full bg-[#e8dec9] dark:bg-muted transition-all duration-300" />
          <span className="size-2.5 rounded-full bg-[#8c7453] dark:bg-primary transition-all duration-300" />
        </div>
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 4. Language Selection ───────────── */
export function LanguageSelect() {
  const { selectedLanguage, setLanguage } = useUserProgress();

  return (
    <ScreenWrapper>
      <Header
        title={t("chooseLanguageTitle", selectedLanguage)}
        subtitle={t("chooseLanguageSub", selectedLanguage)}
        back={true}
      />
      <div className="px-5 flex-1 overflow-y-auto space-y-2 pb-4 scroll-hide">
        {supportedLanguages.map((l) => {
          const active = selectedLanguage === l.code;
          return (
            <AppCard
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={cn(
                "flex items-center justify-between",
                active && "border-primary/50 ring-1 ring-primary/30",
              )}
            >
              <div>
                <p className="font-serif text-lg text-foreground">{l.native}</p>
                <p className="text-xs text-muted-foreground">{l.name}</p>
              </div>
              {active ? (
                <CheckCircle2 className="text-primary" size={22} />
              ) : (
                <Circle className="text-muted-foreground/40" size={22} />
              )}
            </AppCard>
          );
        })}
      </div>
      <div className="px-5 pb-6 pt-2">
        <Link to="/home">
          <PrimaryButton>{t("continueBtn", selectedLanguage)}</PrimaryButton>
        </Link>
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 5. Home ───────────── */
export function HomeScreen() {
  const nav = useNavigate();
  const { profile, selectedLanguage, notifications, completedVerses } = useUserProgress();
  const { data: chaptersData } = useChapters();
  const { data: quotes } = useQuotes(selectedLanguage);

  const allChapters = chaptersData || [];

  const getChapterProgress = (chNum: number, totalVerses: number) => {
    if (!completedVerses) return 0;
    const completed = completedVerses.filter((vId) => vId.startsWith(`${chNum}.`));
    return totalVerses > 0 ? completed.length / totalVerses : 0;
  };

  const [dailyQuote, setDailyQuote] = useState<{ text: string } | null>(null);
  const [dailyVerse, setDailyVerse] = useState<any>(null);

  useEffect(() => {
    if (!quotes || quotes.length === 0) return;
    const now = new Date();
    const intervalKey = `${now.toDateString()}-${now.getHours()}-${now.getMinutes()}`;
    let cached = localStorage.getItem("gita_daily_wisdom");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.date === intervalKey) {
          const exists = quotes.find((q) => q.id === parsed.quote.id);
          if (exists) {
            setDailyQuote(exists);
            return;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    let pool: string[] = [];
    try {
      pool = JSON.parse(localStorage.getItem("gita_daily_wisdom_pool") || "[]");
    } catch {
      pool = [];
    }
    const allKeys = quotes.map((q) => q.id);
    let unshownKeys = allKeys.filter((k) => !pool.includes(k));
    if (unshownKeys.length === 0) {
      pool = [];
      unshownKeys = allKeys;
    }
    const randomKey = unshownKeys[Math.floor(Math.random() * unshownKeys.length)];
    const chosenQuote = quotes.find((q) => q.id === randomKey);
    if (chosenQuote) {
      const newPool = [...pool, randomKey];
      localStorage.setItem("gita_daily_wisdom_pool", JSON.stringify(newPool));
      const dailyObj = { date: intervalKey, quote: chosenQuote };
      localStorage.setItem("gita_daily_wisdom", JSON.stringify(dailyObj));
      setDailyQuote(chosenQuote);
    }
  }, [quotes]);

  useEffect(() => {
    const allProcessed = Object.values((gitaProcessedData as any).verses || {}) as any[];
    if (allProcessed.length === 0) return;

    const now = new Date();
    const intervalKey = `${now.toDateString()}-${now.getHours()}-${now.getMinutes()}`;
    let cached = localStorage.getItem("gita_verse_of_the_day");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.date === intervalKey) {
          setDailyVerse(parsed.verse);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }

    let pool: string[] = [];
    try {
      pool = JSON.parse(localStorage.getItem("gita_verse_of_the_day_pool") || "[]");
    } catch {
      pool = [];
    }

    const allKeys = allProcessed.map((v) => `${v.chapter}.${v.verse}`);
    let unshownKeys = allKeys.filter((k) => !pool.includes(k));

    if (unshownKeys.length === 0) {
      pool = [];
      unshownKeys = allKeys;
    }

    const randomKey = unshownKeys[Math.floor(Math.random() * unshownKeys.length)];
    const chosenVerse = allProcessed.find((v) => `${v.chapter}.${v.verse}` === randomKey);

    if (chosenVerse) {
      const newPool = [...pool, randomKey];
      localStorage.setItem("gita_verse_of_the_day_pool", JSON.stringify(newPool));
      const dailyObj = { date: intervalKey, verse: chosenVerse };
      localStorage.setItem("gita_verse_of_the_day", JSON.stringify(dailyObj));
      setDailyVerse(chosenVerse);
    }
  }, []);

  const hasUnread = notifications.some(n => !n.read);
  const bannerRef = useRef<HTMLDivElement>(null);
  const [bannerVisible, setBannerVisible] = useState(true);

  useEffect(() => {
    const el = bannerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setBannerVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <ScreenWrapper>
      <div className="px-5 pt-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{t("hariOm", selectedLanguage)}, {profile.name}</p>
          <h1 className={`font-serif text-2xl text-foreground transition-opacity duration-300 ${bannerVisible ? "opacity-100" : "opacity-0 pointer-events-none select-none"}`}>
            {t("todaysVerse", selectedLanguage)}
          </h1>
        </div>
        <div className="flex gap-2">
          <IconButton onClick={() => nav("/gita-ai")} className="relative">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              <path d="M12 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              <path d="M8 14c0-2.21 1.79-4 4-4s4 1.79 4 4" />
              <path d="M12 18v-2" />
            </svg>
          </IconButton>
          <IconButton onClick={() => nav("/notifications")} className="relative">
            <Bell size={18} />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 size-2.5 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
            )}
          </IconButton>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-44 scroll-hide">
        <div className="px-5 mt-5">
          <div
            ref={bannerRef}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && nav(
              `/verse/${
                dailyVerse ? `${dailyVerse.chapter}.${dailyVerse.verse}` : "2.47"
              }`
            )}
            onClick={() =>
              nav(
                `/verse/${
                  dailyVerse ? `${dailyVerse.chapter}.${dailyVerse.verse}` : "2.47"
                }`
              )
            }
            className="cursor-pointer"
          >
            <AnimatedImageBanner className="aspect-[5/6]">
              <span className="text-[10px] uppercase tracking-widest opacity-80">
                {t("verseOfTheDay", selectedLanguage)}
              </span>
              <p className="mt-2 font-serif text-xl leading-snug text-balance">
                "
                {dailyVerse?.translation[selectedLanguage]?.simple ||
                  dailyVerse?.translation["en"]?.simple ||
                  "You have the right to action, never to its fruits."}
                "
              </p>
              <p className="mt-3 text-xs opacity-80">
                Bhagavad Gita {dailyVerse ? `${dailyVerse.chapter}.${dailyVerse.verse}` : "2.47"}
              </p>
            </AnimatedImageBanner>
          </div>
        </div>

        <SectionTitle
          action={
            <Link to="/chapters" className="text-xs text-primary font-medium">
              {t("allBtn", selectedLanguage)}
            </Link>
          }
        >
          {t("chapters", selectedLanguage)}
        </SectionTitle>
        <div className="flex gap-4 overflow-x-auto px-5 pb-3 scroll-hide snap-x snap-mandatory">
          {allChapters.map((c) => {
            const progress = getChapterProgress(c.chapter_number, c.verseCount);
            const size = 72;
            const r = (size - 4) / 2;
            const circ = 2 * Math.PI * r;
            const strokeDashoffset = circ - (progress * circ);

            return (
              <button type="button"
                key={c.chapter_number}
                onClick={() => nav(`/chapter/${c.chapter_number}`)}
                className="snap-start shrink-0 flex flex-col items-center text-center w-20 active:scale-[0.97] transition-transform select-none"
              >
                {/* Circular image and progress container */}
                <div className="relative shrink-0" style={{ width: size, height: size }}>
                  {/* Circular Image inside */}
                  <div className="absolute inset-[3px] rounded-full overflow-hidden">
                    <img
                      src={`/assets/images/chapter_${c.chapter_number}.png`}
                      alt={c.title[selectedLanguage] || c.title["en"]}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* SVG Circular Progress Border */}
                  <svg
                    width={size}
                    height={size}
                    className="absolute inset-0 rotate-[-90deg] pointer-events-none"
                  >
                    {/* Track */}
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={r}
                      fill="none"
                      stroke="var(--color-border)"
                      strokeWidth={1.5}
                      className="opacity-40"
                    />
                    {/* Fill */}
                    {progress > 0 && (
                      <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={r}
                        fill="none"
                        stroke="var(--color-gold)"
                        strokeWidth={2.5}
                        strokeDasharray={circ}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-300"
                        style={{ filter: "drop-shadow(0 0 1.5px var(--color-gold-soft))" }}
                      />
                    )}
                  </svg>
                </div>

                {/* Chapter Title text below */}
                <p className="font-serif text-xs font-semibold mt-2.5 text-[#4A3728] dark:text-foreground/90 line-clamp-2 max-w-[80px] leading-snug">
                  {c.title[selectedLanguage] || c.title["en"]}
                </p>
              </button>
            );
          })}
        </div>

        <SectionTitle
          action={
            <Link to="/journey" className="text-xs text-primary font-medium">
              {t("viewBtn", selectedLanguage)}
            </Link>
          }
        >
          {t("yourJourney", selectedLanguage)}
        </SectionTitle>
        <div className="px-5">
          <AppCard className="flex items-center gap-4" onClick={() => nav("/journey")}>
            <div className="size-14 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground shadow-soft shrink-0">
              <Flame size={22} />
            </div>
            <div className="flex-1">
              <p className="font-serif text-lg text-foreground">{profile.streak} {t("dayStreak", selectedLanguage)}</p>
              <p className="text-xs text-muted-foreground">
                {profile.versesRead} {t("verses", selectedLanguage).toLowerCase()} · {profile.minutes} {t("minutes", selectedLanguage).toLowerCase()}
              </p>
            </div>
            <ChevronRight className="text-muted-foreground" />
          </AppCard>
        </div>

        <SectionTitle
          action={
            <Link to="/wisdom" className="text-xs text-primary font-medium">
              {t("exploreBtn", selectedLanguage)}
            </Link>
          }
        >
          {t("wisdomForToday", selectedLanguage)}
        </SectionTitle>
        <div className="px-5">
          <AppCard className="bg-gradient-dawn border-0" onClick={() => nav("/wisdom")}>
            <span className="font-devanagari text-xl text-primary font-bold mb-1.5 block select-none">ॐ</span>
            <p className="font-serif text-base text-foreground leading-relaxed">
              "{dailyQuote?.text || "The soul is eternal."}"
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{t("gitaQuote", selectedLanguage)}</p>
          </AppCard>
        </div>
        <div className="h-4" />
      </div>

      <MiniPlayer />
      <BottomTabs />
    </ScreenWrapper>
  );
}

/* ───────────── 6. Chapters List ───────────── */
export function ChaptersList() {
  const nav = useNavigate();
  const { selectedLanguage } = useUserProgress();
  const { data: chapters, isLoading } = useChapters();
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredChapters = chapters?.filter((c) => {
    const titleStr = (c.title[selectedLanguage] || c.title["en"] || "").toLowerCase();
    const summaryStr = (c.summary[selectedLanguage] || c.summary["en"] || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return titleStr.includes(query) || summaryStr.includes(query);
  });

  return (
    <ScreenWrapper className="bg-[#FAF7EE] dark:bg-background">
      {/* 1. Header Hero with blended backdrop */}
      <div className="relative pt-6 px-5 flex flex-col items-center overflow-hidden">
        {/* Krishna & Arjuna chariot background image blend */}
        <img 
          src="/assets/images/lord_krishna.png" 
          alt="Lord Krishna and Arjuna"
          className="absolute top-0 right-0 h-44 w-auto object-cover opacity-[0.14] dark:opacity-[0.08] pointer-events-none mix-blend-multiply dark:mix-blend-luminosity" 
        />
        

        {/* Top Gold Ornament */}
        <div className="flex items-center gap-2.5 opacity-60">
          <span className="h-[0.8px] w-8 bg-[#C69A3F]" />
          <span className="font-devanagari text-xs text-[#C69A3F] font-bold">ॐ</span>
          <span className="h-[0.8px] w-8 bg-[#C69A3F]" />
        </div>

        {/* Serif Chapters Title */}
        <h1 className="font-serif text-3.5xl text-[#4A3728] dark:text-foreground font-bold tracking-wide mt-1">
          {t("chapters", selectedLanguage)}
        </h1>

        {/* Subtitle description */}
        <p className="text-xs font-serif text-[#8A7D65] dark:text-muted-foreground mt-1 italic text-center text-balance max-w-[80%] leading-relaxed">
          {t("exploreChaptersDesc", selectedLanguage)}
        </p>

        {/* Bottom Gold Ornament */}
        <div className="flex items-center gap-2.5 opacity-60 mt-1.5">
          <span className="h-[0.8px] w-8 bg-[#C69A3F]" />
          <span className="font-devanagari text-xs text-[#C69A3F] font-bold">ॐ</span>
          <span className="h-[0.8px] w-8 bg-[#C69A3F]" />
        </div>
      </div>

      {/* 2. Search and Filter Bar */}
      <div className="px-5 mt-5 z-10 relative">
        <div className="flex items-center gap-2 rounded-full bg-white dark:bg-card border border-[#EFE9DB] dark:border-border/60 px-4 h-11 shadow-[0_2px_6px_rgba(188,169,140,0.06)] dark:shadow-none">
          <Search size={18} className="text-[#A69B85] dark:text-muted-foreground" />
          <input
            aria-label="Search chapters"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchChaptersPlaceholder", selectedLanguage)}
            className="flex-1 bg-transparent outline-none text-sm text-[#4A3728] dark:text-foreground placeholder:text-[#A69B85] dark:placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* 3. Premium Chapter List */}
      <div className="px-5 flex-1 overflow-y-auto space-y-3.5 pb-44 mt-5 scroll-hide">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-24 w-full" />
          ))
        ) : filteredChapters && filteredChapters.length > 0 ? (
          filteredChapters.map((c) => (
            <div
              key={c.chapter_number}
              onClick={() => nav(`/chapter/${c.chapter_number}`)}
              className="bg-white/95 dark:bg-card/95 border border-[#F4EFE3] dark:border-border/40 hover:border-[#EADFCA] dark:hover:border-primary/40 shadow-[0_2px_8px_rgba(188,169,140,0.06)] dark:shadow-none hover:shadow-[0_4px_12px_rgba(188,169,140,0.12)] dark:hover:shadow-soft rounded-2.5xl p-3 flex items-center gap-3.5 cursor-pointer active:scale-[0.99] transition-all duration-200"
            >
              {/* Rounded 4:3 chapter illustration */}
              <img
                src={`/assets/images/chapter_${c.chapter_number}.png`}
                alt={c.title[selectedLanguage] || c.title["en"]}
                className="h-20 w-24 rounded-xl object-cover shadow-soft shrink-0"
              />

              {/* Gold circle chapter number */}
              <div className="size-8 rounded-full bg-[#FAF5EA] dark:bg-muted border border-[#EFE9DB] dark:border-border/60 flex items-center justify-center font-serif text-sm font-semibold text-[#B69550] dark:text-primary shrink-0">
                {c.chapter_number}
              </div>

              {/* Titles & Verse Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-base text-[#4A3728] dark:text-foreground font-bold truncate">
                  {c.title[selectedLanguage] || c.title["en"]}
                </h3>
                <p className="text-[11px] text-[#8A7D65] dark:text-muted-foreground mt-0.5 truncate leading-relaxed">
                  {c.summary[selectedLanguage] || c.summary["en"]}
                </p>
                <p className="text-[11px] text-[#C69A3F] dark:text-primary font-serif font-semibold mt-2">
                  {c.verseCount} {t("verses", selectedLanguage)}
                </p>
              </div>

              {/* Gold Right Chevron indicator */}
              <ChevronRight size={18} className="text-[#C5B396] dark:text-muted-foreground shrink-0" />
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-[#8A7D65] dark:text-muted-foreground font-serif text-sm">
            {t("noMatchingChapters", selectedLanguage)}
          </div>
        )}
      </div>
      <MiniPlayer />
      <BottomTabs />
    </ScreenWrapper>
  );
}

/* ───────────── 7. Chapter Detail ───────────── */
export function ChapterDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const {
    selectedLanguage,
    downloading,
    downloadChapter,
    deleteChapterDownload,
    isChapterDownloaded,
  } = useUserProgress();
  const { data: chapters } = useChapters();
  const { data: verses, isLoading } = useVersesInChapter(Number(id));

  const chapter = chapters?.find((c) => c.chapter_number === Number(id)) || {
    chapter_number: Number(id),
    title: { en: t("loadingTitle", selectedLanguage) },
    summary: { en: "" },
    fullSummary: { en: "" },
    verseCount: 0,
  };

  const title = (chapter.title as Record<string, string>)[selectedLanguage] || (chapter.title as Record<string, string>)["en"];
  const summary = (chapter.summary as Record<string, string>)[selectedLanguage] || (chapter.summary as Record<string, string>)["en"];
  const fullSummary = (chapter.fullSummary as Record<string, string>)[selectedLanguage] || (chapter.fullSummary as Record<string, string>)["en"];

  return (
    <ScreenWrapper>
      <Header
        right={
          <IconButton onClick={() => toast.success(t("sharedSuccessfullyToast", selectedLanguage))}>
            <Share2 size={18} />
          </IconButton>
        }
        back={true}
        backTo="/chapters"
      />
      <div className="flex-1 overflow-y-auto pb-44 scroll-hide">
        <div className="px-5">
          <ImageBanner
            src={`/assets/images/chapter_${chapter.chapter_number}.png`}
            alt={title}
            fit="contain"
          >
            <span className="text-[10px] uppercase tracking-widest opacity-80">
              {t("chapterLabel", selectedLanguage)} {chapter.chapter_number}
            </span>
            <p className="font-serif text-2xl mt-1">{title}</p>
            <p className="text-xs opacity-80">{summary}</p>
          </ImageBanner>
        </div>
        <div className="px-5 mt-5 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{fullSummary}</p>
          <div className="grid grid-cols-3 gap-3">
            <AppCard className="text-center">
              <p className="font-serif text-2xl text-foreground">{chapter.verseCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{t("verses", selectedLanguage)}</p>
            </AppCard>
            <AppCard className="text-center">
              <p className="font-serif text-2xl text-foreground">
                {chapter.chapter_number === 1 ? "60%" : chapter.chapter_number === 2 ? "40%" : "0%"}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{t("readLabel", selectedLanguage)}</p>
            </AppCard>
            <AppCard className="text-center">
              <p className="font-serif text-2xl text-foreground">
                ~{Math.round(chapter.verseCount * 0.6)}m
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{t("lengthLabel", selectedLanguage)}</p>
            </AppCard>
          </div>
          <div className="space-y-3">
            <PrimaryButton onClick={() => nav(`/chapter/${chapter.chapter_number}/verses`)}>
              {t("beginChapterBtn", selectedLanguage)}
            </PrimaryButton>

            {isChapterDownloaded(chapter.chapter_number) ? (
              <GhostButton
                onClick={() => {
                  toast(`${t("deleteChapterConfirm", selectedLanguage)} ${chapter.chapter_number}?`, {
                    action: { label: t("delete", selectedLanguage), onClick: () => deleteChapterDownload(chapter.chapter_number) },
                    cancel: { label: t("cancel", selectedLanguage), onClick: () => {} },
                  });
                }}
                className="text-primary hover:text-primary/95 border-primary/30"
              >
                <CheckCircle2 size={16} className="fill-current text-primary mr-2 inline" />
                {t("chapterOfflineBtn", selectedLanguage)}
              </GhostButton>
            ) : downloading[`chapter:${chapter.chapter_number}`] !== undefined ? (
              <GhostButton
                disabled
                className="text-primary animate-pulse border-primary/20 bg-gradient-dawn"
              >
                {t("downloadingChapterBtn", selectedLanguage)} ({downloading[`chapter:${chapter.chapter_number}`]}%)
              </GhostButton>
            ) : (
              <GhostButton
                onClick={() => downloadChapter(chapter.chapter_number)}
                className="text-foreground border-border/80"
              >
                <Download size={16} className="mr-2 inline text-primary" />
                {t("downloadChapterBtn", selectedLanguage)}
              </GhostButton>
            )}
          </div>
        </div>
      </div>
      <MiniPlayer />
      <BottomTabs />
    </ScreenWrapper>
  );
}

/* ───────────── 7b. Chapter Verses Checklist ───────────── */
export function ChapterVerses() {
  const { id } = useParams();
  const nav = useNavigate();
  const {
    selectedLanguage,
    completedVerses,
    toggleCompleted,
    isCompleted,
  } = useUserProgress();
  const { data: chapters } = useChapters();
  const { data: verses, isLoading } = useVersesInChapter(Number(id));
  const [searchQuery, setSearchQuery] = useState("");

  const chapter = chapters?.find((c) => c.chapter_number === Number(id)) || {
    chapter_number: Number(id),
    title: { en: t("loadingTitle", selectedLanguage) },
    verseCount: 0,
  };

  const title = (chapter.title as Record<string, string>)[selectedLanguage] || (chapter.title as Record<string, string>)["en"];

  // Filter verses in chapter
  const filteredVerses = verses?.filter((v) => {
    const translationText = v.translation[selectedLanguage]?.simple || v.translation["en"]?.simple || "";
    const sanskritText = v.sanskrit || "";
    const query = searchQuery.toLowerCase();
    return (
      `verse ${v.verse}`.includes(query) ||
      `${v.verse}`.includes(query) ||
      translationText.toLowerCase().includes(query) ||
      sanskritText.toLowerCase().includes(query)
    );
  });

  // Calculate completed progress in this chapter
  const chapterVerses = verses || [];
  const completedInChapter = chapterVerses.filter((v) => isCompleted(`${chapter.chapter_number}.${v.verse}`));
  const completedCount = completedInChapter.length;
  const totalCount = chapter.verseCount || chapterVerses.length || 1;
  const progressRatio = completedCount / totalCount;

  return (
    <ScreenWrapper className="bg-[#FAF7EE] dark:bg-background">
      {/* Exquisite Top Reference Ornament */}
      <div className="w-full flex justify-center pt-2 select-none">
        <div className="flex items-center gap-1.5 opacity-60">
          <span className="h-px w-6 bg-gradient-to-r from-transparent to-primary/45" />
          <span className="font-devanagari text-xs text-primary font-semibold leading-none">ॐ</span>
          <span className="h-px w-6 bg-gradient-to-l from-transparent to-primary/45" />
        </div>
      </div>

      <div className="flex items-center justify-between px-5 pt-2 pb-2 relative">
        <button type="button"
          onClick={() => nav(`/chapter/${chapter.chapter_number}`)}
          className="size-10 rounded-full bg-white/70 dark:bg-card/70 backdrop-blur shadow-[0_2px_8px_rgba(188,169,140,0.15)] dark:shadow-none flex items-center justify-center text-[#4A3728]/70 dark:text-foreground/70 hover:text-[#4A3728] dark:hover:text-foreground transition shrink-0"
          aria-label="Back"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center flex-1 mx-2 min-w-0">
          <h1 className="font-serif text-xl text-foreground font-bold leading-tight truncate">{title}</h1>
          <p className="text-[10px] text-muted-foreground mt-0.5 font-medium tracking-wide">
            {t("chapterLabel", selectedLanguage)} {chapter.chapter_number} · {completedCount} / {totalCount} {t("readLabel", selectedLanguage).toLowerCase()}
          </p>
        </div>
        <div className="w-10 shrink-0" />
      </div>

      {/* Progress Section */}
      <div className="px-5 mt-2">
        <AppCard className="bg-white dark:bg-card border border-[#EFE9DB] dark:border-border/60 shadow-[0_2px_6px_rgba(188,169,140,0.06)] dark:shadow-none p-3">
          <div className="flex justify-between items-center text-xs text-[#8A7D65] dark:text-muted-foreground font-serif mb-1.5">
            <span>{t("yourJourney", selectedLanguage)}</span>
            <span className="font-semibold text-primary">{Math.round(progressRatio * 100)}% {t("readLabel", selectedLanguage).toLowerCase()}</span>
          </div>
          <ProgressBar value={progressRatio} />
        </AppCard>
      </div>

      {/* Search Input */}
      <div className="px-5 mt-4">
        <div className="flex items-center gap-2 rounded-full bg-white dark:bg-card border border-[#EFE9DB] dark:border-border/60 px-4 h-10.5 shadow-[0_2px_6px_rgba(188,169,140,0.06)] dark:shadow-none">
          <Search size={16} className="text-[#A69B85] dark:text-muted-foreground" />
          <input
              aria-label="Search verses"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder", selectedLanguage)}
            className="flex-1 bg-transparent outline-none text-xs text-[#4A3728] dark:text-foreground placeholder:text-[#A69B85] dark:placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Verses Checklist List */}
      <div className="px-5 flex-1 overflow-y-auto space-y-3 pb-24 mt-4 scroll-hide">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-16 w-full" />
          ))
        ) : filteredVerses && filteredVerses.length > 0 ? (
          filteredVerses.map((v) => {
            const verseId = `${chapter.chapter_number}.${v.verse}`;
            const completed = isCompleted(verseId);
            const translationText = v.translation[selectedLanguage]?.simple || v.translation["en"]?.simple || "";
            return (
              <div
                key={verseId}
                className={cn(
                  "bg-white/95 dark:bg-card/95 border shadow-[0_2px_8px_rgba(188,169,140,0.06)] dark:shadow-none rounded-2xl p-3 flex items-center gap-3 transition-all duration-150 cursor-pointer hover:border-[#EADFCA] dark:hover:border-primary/40",
                  completed ? "border-primary/20 bg-emerald-50/5 dark:bg-emerald-950/5" : "border-[#F4EFE3] dark:border-border/40"
                )}
                onClick={() => nav(`/verse/${verseId}`)}
              >
                {/* Custom Checkbox Toggle Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCompleted(verseId);
                    if (!completed) {
                      toast.success(`${t("verseMarkedCompleted", selectedLanguage)} (${verseId})`);
                    } else {
                      toast.info(`${t("verseUnmarked", selectedLanguage)} (${verseId})`);
                    }
                  }}
                  className="size-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90"
                  aria-label="Toggle Complete"
                >
                  {completed ? (
                    <CheckCircle2 size={22} className="text-primary fill-primary/10 animate-scale-in" />
                  ) : (
                    <Circle size={22} className="text-[#C5B396]/60 dark:text-muted-foreground/60 hover:text-primary dark:hover:text-primary transition-colors" />
                  )}
                </button>

                {/* Verse Info & Snippet */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif text-sm font-bold text-[#4A3728] dark:text-foreground">
                      {t("verseLabel", selectedLanguage)} {v.verse}
                    </span>
                    {completed && (
                      <span className="text-[9px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full leading-none">
                        {t("readLabel", selectedLanguage)}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5 leading-normal">
                    {translationText}
                  </p>
                </div>

                {/* Arrow indicator */}
                <ChevronRight size={16} className="text-[#C5B396]/60 dark:text-muted-foreground/60 shrink-0" />
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-[#8A7D65] dark:text-muted-foreground font-serif text-sm">
            {t("nothingYet", selectedLanguage)}
          </div>
        )}
      </div>

      <MiniPlayer hasTabs={false} />
    </ScreenWrapper>
  );
}

function DownloadRing({ progress, size = 32 }: { progress: number; size?: number }) {
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={2} className="text-primary/20" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={2} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="text-primary transition-all duration-200" />
    </svg>
  );
}

function DownloadDone({ size = 18 }: { size?: number }) {
  return (
    <span className="relative inline-flex items-center justify-center">
      <Download size={size} className="text-primary" />
      <span className="absolute -bottom-1 -right-1 bg-primary rounded-full flex items-center justify-center" style={{ width: size * 0.55, height: size * 0.55 }}>
        <svg width={size * 0.35} height={size * 0.35} viewBox="0 0 10 10" fill="none">
          <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </span>
  );
}

/* ───────────── 8. Verse Reading ───────────── */
function FloriateDivider({ color = "#B7943A", width = 200 }: { color?: string; width?: number }) {
  return (
    <svg width={width} height={18} viewBox={`0 0 ${width} 18`} className="mx-auto my-2 block">
      <line x1={0} y1={9} x2={width / 2 - 14} y2={9} stroke={color} strokeWidth={0.8} opacity={0.6} />
      <line x1={width / 2 + 14} y1={9} x2={width} y2={9} stroke={color} strokeWidth={0.8} opacity={0.6} />
      <path
        d={`M${width / 2 - 12},9 C${width / 2 - 7},4 ${width / 2 - 2},2 ${width / 2},2 C${width / 2 + 2},2 ${width / 2 + 7},4 ${width / 2 + 12},9 C${width / 2 + 7},14 ${width / 2 + 2},16 ${width / 2},16 C${width / 2 - 2},16 ${width / 2 - 7},14 ${width / 2 - 12},9 Z`}
        fill={color}
        opacity={0.5}
      />
      <circle cx={width / 2} cy={9} r={2.5} fill={color} />
      <circle cx={width / 2 - 16} cy={9} r={1.5} fill={color} opacity={0.5} />
      <circle cx={width / 2 + 16} cy={9} r={1.5} fill={color} opacity={0.5} />
    </svg>
  );
}


export function VerseReading() {
  const { id } = useParams();
  const nav = useNavigate();
  const loc = useLocation();
  const {
    selectedLanguage,
    isBookmarked,
    addBookmark,
    removeBookmark,
    addHistory,
    isFavorite,
    toggleFavorite,
    downloading,
    downloadVerse,
    deleteVerseDownload,
    isVerseDownloaded,
    completedVerses,
    toggleCompleted,
    isCompleted,
    autoPlayOnOpen,
  } = useUserProgress();
  const {
    isPlaying,
    isLooping,
    currentTime,
    duration,
    currentVerse,
    play,
    pause,
    resume,
    seek,
    setRate,
    toggleLooping,
  } = useAudioPlayer();

  const [chapterId, verseNumber] = (id ?? "2.47").split(/[\.\-_]/).map(Number);
  const { data: verse, isLoading } = useVerseDetail(chapterId, verseNumber);

  const [activeSpeedIdx, setActiveSpeedIdx] = useState(1);
  const speeds = [0.8, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0];

  const verseId = `${chapterId}.${verseNumber}`;
  const saved = isBookmarked(verseId);
  const favorited = isFavorite(verseId);

  // Trigger reading history save on verse load
  useEffect(() => {
    if (verse) {
      addHistory(chapterId, verseNumber);
      if (!isCompleted(verseId)) {
        toggleCompleted(verseId);
      }
    }
  }, [verseId, verse]);

  // Auto-play when navigated from next/prev, or when setting is enabled
  useEffect(() => {
    if (verse && (loc.state?.autoPlay || autoPlayOnOpen)) {
      play(verse, selectedLanguage);
    }
  }, [verse]);

  const handleBookmarkToggle = () => {
    if (saved) {
      removeBookmark(verseId);
      toast.success(t("bookmarkRemovedToast", selectedLanguage));
    } else {
      addBookmark(verseId);
      toast.success(t("bookmarkSavedToast", selectedLanguage));
    }
  };

  const handleFavoriteToggle = () => {
    toggleFavorite(verseId);
    if (favorited) {
      toast.success(t("removedFromFavoritesToast", selectedLanguage));
    } else {
      toast.success(t("addedToFavoritesToast", selectedLanguage));
    }
  };

  const getChapterVerseCount = (chNum: number) => {
    const counts: Record<number, number> = {
      1: 47, 2: 72, 3: 43, 4: 42, 5: 29, 6: 47, 7: 30, 8: 28, 9: 34,
      10: 42, 11: 55, 12: 20, 13: 35, 14: 27, 15: 20, 16: 24, 17: 28, 18: 78
    };
    return counts[chNum] || 40;
  };

  const handleNextVerse = () => {
    const maxVerses = getChapterVerseCount(chapterId);
    if (verseNumber < maxVerses) {
      if (isCurrentActive && isPlaying) {
        pause();
        nav(`/verse/${chapterId}.${verseNumber + 1}`, { state: { autoPlay: true } });
      } else {
        nav(`/verse/${chapterId}.${verseNumber + 1}`);
      }
    } else {
      toast.info(t("endOfChapterToast", selectedLanguage));
    }
  };

  const handlePrevVerse = () => {
    if (verseNumber > 1) {
      if (isCurrentActive && isPlaying) {
        pause();
        nav(`/verse/${chapterId}.${verseNumber - 1}`, { state: { autoPlay: true } });
      } else {
        nav(`/verse/${chapterId}.${verseNumber - 1}`);
      }
    } else {
      toast.info(t("startOfChapterToast", selectedLanguage));
    }
  };

  const handlePlayToggle = () => {
    if (!verse) return;
    const isThisVersePlaying = currentVerse && currentVerse.id === verse.id;
    if (isThisVersePlaying) {
      if (isPlaying) {
        pause();
      } else {
        resume();
      }
    } else {
      play(verse, selectedLanguage);
    }
  };

  const handleSpeedToggle = () => {
    const nextIdx = (activeSpeedIdx + 1) % speeds.length;
    setActiveSpeedIdx(nextIdx);
    setRate(speeds[nextIdx]);
  };

  const handleShare = async () => {
    const translationText =
      verse?.translation[selectedLanguage]?.simple || verse?.translation["en"]?.simple || "";
    const msg = `Hare Krishna! \nCheck out this wisdom from Bhagavad Gita (Verse ${chapterId}.${verseNumber}):\n\n"${translationText}"\n\nRead more in Gita Sadhana App.`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Bhagavad Gita Verse ${chapterId}.${verseNumber}`,
          text: msg,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(msg);
        toast.success(t("linkCopiedToast", selectedLanguage));
      }
    } catch (e) {
      console.log("Share failed:", e);
    }
  };

  if (isLoading) {
    return (
      <ScreenWrapper>
        <Header title={`Verse ${chapterId}.${verseNumber}`} subtitle="Bhagavad Gita" back={true} backTo={`/chapter/${chapterId}/verses`} />
        <div className="px-5 space-y-4 pt-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </ScreenWrapper>
    );
  }

  const isCurrentActive = currentVerse && currentVerse.chapter === chapterId && currentVerse.verse === verseNumber;

  const translationText =
    verse?.translation[selectedLanguage]?.simple || verse?.translation["en"]?.simple || "";
  const deepReflection =
    verse?.translation[selectedLanguage]?.deep || verse?.translation["en"]?.deep || "";
  const essenceText =
    verse?.translation[selectedLanguage]?.essence || verse?.translation["en"]?.essence || "";

  const maxVerses = getChapterVerseCount(chapterId);
  const progressPercent = isCurrentActive && duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <ScreenWrapper>
      <Header
        title={`Verse ${chapterId}.${verseNumber}`}
        subtitle="Bhagavad Gita"
        back={true}
        backTo={`/chapter/${chapterId}/verses`}
        right={
          <div className="flex gap-2">
            {isVerseDownloaded(verseId) ? (
              <IconButton
                onClick={() => {
                  toast(`${t("deleteVerseConfirm", selectedLanguage)} ${verseId}?`, {
                    action: { label: t("delete", selectedLanguage), onClick: () => deleteVerseDownload(verseId) },
                    cancel: { label: t("cancel", selectedLanguage), onClick: () => {} },
                  });
                }}
                className="text-primary hover:text-primary-dark"
              >
                <DownloadDone size={18} />
              </IconButton>
            ) : downloading[`verse:${verseId}`] !== undefined ? (
              <IconButton disabled>
                <DownloadRing progress={downloading[`verse:${verseId}`]} size={24} />
              </IconButton>
            ) : (
              <IconButton onClick={() => downloadVerse(verseId)}>
                <Download size={18} />
              </IconButton>
            )}
            <IconButton
              onClick={() => {
                toggleCompleted(verseId);
                if (!isCompleted(verseId)) {
                  toast.success(t("verseMarkedCompleted", selectedLanguage));
                } else {
                  toast.info(t("verseUnmarked", selectedLanguage));
                }
              }}
              title="Toggle Finished/Completed Status"
            >
              <CheckCircle2
                size={18}
                className={cn(
                  isCompleted(verseId) ? "text-primary fill-primary/10" : "text-muted-foreground"
                )}
              />
            </IconButton>
            <IconButton onClick={handleBookmarkToggle}>
              {saved ? (
                <Bookmark size={18} className="text-primary fill-primary animate-bounce-once" />
              ) : (
                <Bookmark size={18} />
              )}
            </IconButton>
            <IconButton onClick={handleShare}>
              <Share2 size={18} />
            </IconButton>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-6 scroll-hide pt-4">
        
        {/* 1. Sanskrit Card */}
        <AppCard className="bg-gradient-dawn border border-primary/10 shadow-soft py-6 px-5 flex flex-col items-center justify-center text-center">
          <p className="font-devanagari text-2xl leading-loose text-foreground/95 select-all whitespace-pre-line">
            {verse?.sanskrit ? verse.sanskrit.replace(/\n\s*\n/g, "\n").trim() : ""}
          </p>
        </AppCard>

        {/* 2. Transliteration Section */}
        {verse?.transliteration && (
          <div className="space-y-1.5 text-center bg-card/35 rounded-2xl p-4 border border-border/10">
            <p className="text-[10px] uppercase tracking-widest text-primary font-semibold font-sans">
              {t("transliteration", selectedLanguage)}
            </p>
            <p className="font-serif italic text-base leading-relaxed text-foreground/80 whitespace-pre-line select-all">
              {verse.transliteration.replace(/\n\s*\n/g, "\n").trim()}
            </p>
          </div>
        )}

        {/* 3. Translation Section */}
        <div className="space-y-2 bg-card/35 rounded-2xl p-5 border border-border/10 border-l-4 border-l-primary/60">
          <div className="flex justify-between items-center">
            <p className="text-[10px] uppercase tracking-widest text-primary font-semibold font-sans">
              {t("translation", selectedLanguage)}
            </p>
            {selectedLanguage === "en" && (
              <button type="button"
                onClick={() => nav(`/verse/${chapterId}.${verseNumber}/words`)}
                className="text-[10px] uppercase tracking-widest text-primary font-bold hover:underline active:scale-95 transition-transform cursor-pointer"
              >
                {t("wordMeaningsBtn", selectedLanguage)}
              </button>
            )}
          </div>
          <p className="text-base leading-relaxed text-foreground select-all font-sans">
            {translationText}
          </p>
        </div>

        {/* 4. Reflection / Commentary Section */}
        {(deepReflection || essenceText) && (
          <div className="space-y-3 bg-card/50 border border-primary/10 shadow-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-devanagari text-base text-primary font-bold mr-0.5 select-none animate-pulse">ॐ</span>
              <p className="text-[10px] uppercase tracking-widest text-primary font-semibold font-sans">
                {t("reflectionAndEssence", selectedLanguage)}
              </p>
            </div>
            {deepReflection && (
              <p className="font-serif text-lg leading-relaxed text-foreground/90 whitespace-pre-line select-all">
                {deepReflection}
              </p>
            )}
            {deepReflection && essenceText && <div className="h-px bg-border/40 my-2" />}
            {essenceText && (
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line select-all">
                {essenceText}
              </p>
            )}
          </div>
        )}



      </div>

      {/* ── Sticky Glassmorphic Audio player ── */}
      <div
        className="sticky bottom-0 mx-0 rounded-t-3xl border-t border-x border-border/60 backdrop-blur-xl px-5 pt-4 pb-safe flex flex-col gap-2.5 z-20 shadow-soft bg-card/92"
      >
        {/* Progress Timeline Range Slider */}
        <div className="w-full flex flex-col gap-1">
          <input
              aria-label="Audio progress"
            type="range"
            min="0"
            max={isCurrentActive && duration > 0 ? duration : 100}
            value={isCurrentActive ? currentTime : 0}
            disabled={!isCurrentActive}
            onChange={(e) => isCurrentActive && seek(Number(e.target.value))}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer focus:outline-none transition-all"
            style={{
              background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${progressPercent}%, rgba(168, 144, 112, 0.15) ${progressPercent}%, rgba(168, 144, 112, 0.15) 100%)`,
              accentColor: "var(--color-primary)"
            }}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground/80 font-medium px-0.5 select-none">
            <span>{isCurrentActive ? formatTime(currentTime) : "0:00"}</span>
            <span>{isCurrentActive ? formatTime(duration) : "0:00"}</span>
          </div>
        </div>

        {/* Playback action buttons */}
        <div className="flex items-center justify-between gap-4 mt-0.5">
          {/* Looping / Repeat */}
          <button type="button"
            onClick={() => {
              toggleLooping();
              toast.info(t(isLooping ? "repeatDisabledToast" : "repeatEnabledToast", selectedLanguage));
            }}
            className="p-2 transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ color: isLooping ? "var(--color-primary)" : "var(--color-muted-foreground)" }}
          >
            <Repeat size={18} className={cn(isLooping && "animate-pulse")} />
          </button>

          {/* Media Buttons Group */}
          <div className="flex items-center gap-4">
            {/* Skip Back */}
            <button type="button"
              onClick={handlePrevVerse}
              disabled={verseNumber <= 1}
              className="p-2.5 rounded-full flex items-center justify-center border border-border/60 hover:bg-black/5 active:scale-90 transition bg-card disabled:opacity-40"
            >
              <SkipBack size={18} className="fill-current text-foreground" />
            </button>

            {/* Main Play/Pause */}
            <button type="button"
              onClick={handlePlayToggle}
              className="size-12 rounded-full flex items-center justify-center shadow-soft active:scale-95 transition-all text-primary-foreground hover:brightness-105 bg-gradient-gold"
            >
              {isCurrentActive && isPlaying ? (
                <Pause size={20} className="fill-current" />
              ) : (
                <Play size={20} className="fill-current ml-0.5" />
              )}
            </button>

            {/* Skip Forward */}
            <button type="button"
              onClick={handleNextVerse}
              disabled={verseNumber >= maxVerses}
              className="p-2.5 rounded-full flex items-center justify-center border border-border/60 hover:bg-black/5 active:scale-90 transition bg-card disabled:opacity-40"
            >
              <SkipForward size={18} className="fill-current text-foreground" />
            </button>
          </div>

          {/* Speed & Download Panel */}
          <div className="flex items-center gap-1.5">
            {/* Speed / Rate Toggle */}
            <button type="button"
              onClick={handleSpeedToggle}
              className="h-8 px-2.5 rounded-full border border-border/50 flex items-center justify-center text-[10px] font-bold uppercase transition active:scale-90 text-primary bg-gradient-dawn"
            >
              {isCurrentActive ? speeds[activeSpeedIdx] : 1.0}x
            </button>

            {/* Offline/Download Audio — icon only */}
            {isVerseDownloaded(verseId) ? (
              <button type="button"
                onClick={() => {
                  toast(`${t("deleteVerseConfirm", selectedLanguage)} ${verseId}?`, {
                    action: { label: t("delete", selectedLanguage), onClick: () => deleteVerseDownload(verseId) },
                    cancel: { label: t("cancel", selectedLanguage), onClick: () => {} },
                  });
                }}
                title={`${t("savedOfflineLabel", selectedLanguage)} — ${t("tapToDelete", selectedLanguage)}`}
                className="size-8 rounded-full border border-primary/40 flex items-center justify-center transition active:scale-90 bg-card/70"
              >
                <DownloadDone size={14} />
              </button>
            ) : downloading[`verse:${verseId}`] !== undefined ? (
              <button type="button" disabled title={`Downloading ${downloading[`verse:${verseId}`]}%`} className="size-8 flex items-center justify-center">
                <DownloadRing progress={downloading[`verse:${verseId}`]} size={32} />
              </button>
            ) : (
              <button type="button"
                onClick={() => downloadVerse(verseId)}
                title="Download verse audio for offline use"
                className="size-8 rounded-full border border-border/50 flex items-center justify-center transition active:scale-90 text-muted-foreground hover:text-foreground bg-card"
              >
                <Download size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </ScreenWrapper>
  );
}


/* ───────────── 9. Commentary ───────────── */
export function VerseCommentary() {
  const { id } = useParams();
  const { selectedLanguage } = useUserProgress();
  const [chapterId, verseNumber] = (id ?? "2.47").split(/[\.\-_]/).map(Number);
  const { data: verse } = useVerseDetail(chapterId, verseNumber);

  const deepReflection =
    verse?.translation[selectedLanguage]?.deep || verse?.translation["en"]?.deep || "";
  const essenceText =
    verse?.translation[selectedLanguage]?.essence || verse?.translation["en"]?.essence || "";

  return (
    <ScreenWrapper>
      <Header title={t("commentary", selectedLanguage)} subtitle={`Verse ${chapterId}.${verseNumber}`} back={true} />
      <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-5 scroll-hide">
        <AppCard className="bg-gradient-dawn border-0">
          <p className="font-devanagari text-lg text-foreground text-center leading-loose whitespace-pre-line">
            {verse?.sanskrit}
          </p>
        </AppCard>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-primary mb-2">{t("reflection", selectedLanguage)}</p>
          <p className="font-serif text-lg text-foreground leading-relaxed whitespace-pre-line">
            {deepReflection}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-primary mb-2">{t("deeperLook", selectedLanguage)}</p>
          <p className="text-foreground leading-relaxed text-sm whitespace-pre-line">
            {essenceText}
          </p>
        </div>
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 10. Word Meaning ───────────── */
export function VerseWords() {
  const { id } = useParams();
  const nav = useNavigate();
  const { selectedLanguage } = useUserProgress();
  const [chapterId, verseNumber] = (id ?? "2.47").split(/[\.\-_]/).map(Number);
  const { data: verse } = useVerseDetail(chapterId, verseNumber);

  // Parse raw word meanings e.g. "dhṛitarāśhtraḥ uvācha—Dhritarashtra said; dharma-kṣhetre—the land of dharma;"
  const parseWordMeanings = (meaningsStr: string) => {
    if (!meaningsStr) return [];
    return meaningsStr
      .split(";")
      .map((pair) => {
        const parts = pair.split(/[—–-]/); // Split on various dashes
        return {
          word: parts[0]?.trim() || "",
          meaning: parts[1]?.trim() || "",
        };
      })
      .filter((p) => p.word && p.meaning);
  };

  const words = parseWordMeanings(verse?.word_meanings || "");

  if (selectedLanguage !== "en") {
    return (
      <ScreenWrapper>
        <Header title={t("wordMeanings", selectedLanguage)} subtitle={`Verse ${chapterId}.${verseNumber}`} back={true} />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-16">
          <div className="size-20 rounded-full bg-gradient-dawn flex items-center justify-center text-primary mb-5 shadow-card">
            <Languages size={28} />
          </div>
          <h3 className="font-serif text-xl text-foreground">{t("languageNotSupported", selectedLanguage)}</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
            {t("wordBreakdownAvailableEnglish", selectedLanguage)}
          </p>
          <button type="button"
            onClick={() => nav("/language")}
            className="mt-6 px-6 h-10 rounded-full bg-gradient-gold text-primary-foreground text-xs font-bold shadow-soft active:scale-95 transition cursor-pointer"
          >
            {t("switchToEnglish", selectedLanguage)}
          </button>
        </div>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Header title={t("wordMeanings", selectedLanguage)} subtitle={`Verse ${chapterId}.${verseNumber}`} back={true} />
      <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-4 scroll-hide">
        <AppCard className="bg-gradient-dawn border-0">
          <p className="font-devanagari text-lg text-foreground text-center leading-loose whitespace-pre-line">
            {verse?.sanskrit}
          </p>
        </AppCard>
        <div className="space-y-2">
          {words.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {t("noWordBreakdown", selectedLanguage)}
            </div>
          ) : (
            words.map((w, i) => (
              <AppCard key={w.word ?? i} className="flex items-center justify-between gap-4 py-3">
                <p className="font-serif italic text-foreground text-left">{w.word}</p>
                <p className="text-sm text-muted-foreground text-right">{w.meaning}</p>
              </AppCard>
            ))
          )}
        </div>
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 11. Search ───────────── */
export function SearchScreen() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const { selectedLanguage } = useUserProgress();
  return (
    <ScreenWrapper>
      <Header title={t("searchTitle", selectedLanguage)} back={true} />
      <div className="px-5">
        <div className="flex items-center gap-2 rounded-full bg-card border border-border px-4 h-12 shadow-card">
          <Search size={18} className="text-muted-foreground" />
          <input
              aria-label="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && nav(`/search/results?q=${encodeURIComponent(q)}`)
            }
            placeholder={t("searchPlaceholder", selectedLanguage)}
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
      </div>
      <div className="px-5 mt-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">{t("suggestedLabel", selectedLanguage)}</p>
        <div className="flex flex-wrap gap-2">
          {["karma", "atman", "devotion", "fear", "meditation", "duty"].map((t) => (
            <button type="button"
              key={t}
              onClick={() => nav(`/search/results?q=${t}`)}
              className="px-4 h-9 rounded-full bg-card border border-border text-sm text-foreground active:bg-muted/30"
            >
              {t}
            </button>
          ))}
        </div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 mt-8">{t("recentLabel", selectedLanguage)}</p>
        <div className="space-y-2">
          {["letting go", "steady mind"].map((t) => (
            <AppCard
              key={t}
              onClick={() => nav(`/search/results?q=${t}`)}
              className="flex items-center justify-between py-3"
            >
              <span className="text-sm text-foreground">{t}</span>
              <Clock size={16} className="text-muted-foreground" />
            </AppCard>
          ))}
        </div>
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 12. Search Results ───────────── */
export function SearchResults() {
  const loc = useLocation();
  const nav = useNavigate();
  const { selectedLanguage } = useUserProgress();
  const q = new URLSearchParams(loc.search).get("q") ?? "";

  // Perform search in fallback database
  const queryWords = q.toLowerCase();
  const allProcessedVerses = Object.values((gitaProcessedData as any).verses || {}) as any[];

  const searchResults = allProcessedVerses
    .filter((v: any) => {
      const textToSearch =
        `${v.sanskrit} ${v.transliteration} ${v.translation[selectedLanguage]?.simple || ""} ${v.translation["en"]?.simple || ""}`.toLowerCase();
      return textToSearch.includes(queryWords);
    })
    .slice(0, 15) as Verse[]; // limit to 15 results

  return (
    <ScreenWrapper>
      <Header title={`"${q}"`} subtitle={`${searchResults.length} ${t("versesFound", selectedLanguage)}`} back={true} />
      <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-8 scroll-hide">
        {searchResults.length === 0 ? (
          <EmptyState
            icon={<Search size={28} />}
            title={t("nothingYet", selectedLanguage)}
            body={t("tryDifferentWord", selectedLanguage)}
          />
        ) : (
          searchResults.map((v) => (
            <VerseCard
              key={v.id}
              number={`${v.chapter}.${v.verse}`}
              sanskrit={v.sanskrit}
              translation={
                v.translation[selectedLanguage]?.simple || v.translation["en"]?.simple || ""
              }
              onClick={() => nav(`/verse/${v.chapter}.${v.verse}`)}
            />
          ))
        )}
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 13. Wisdom ───────────── */
export function WisdomScreen() {
  const nav = useNavigate();
  const { selectedLanguage, toggleFavorite, isFavorite } = useUserProgress();
  const { data: quotes } = useQuotes(selectedLanguage);

  const [dailyQuote, setDailyQuote] = useState<Quote | null>(null);

  useEffect(() => {
    if (!quotes || quotes.length === 0) return;

    const now = new Date();
    const intervalKey = `${now.toDateString()}-${now.getHours()}-${now.getMinutes()}`;

    let cached = localStorage.getItem("gita_daily_wisdom");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.date === intervalKey) {
          const exists = quotes.find((q) => q.id === parsed.quote.id);
          if (exists) {
            setDailyQuote(exists);
            return;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    let pool: string[] = [];
    try {
      pool = JSON.parse(localStorage.getItem("gita_daily_wisdom_pool") || "[]");
    } catch {
      pool = [];
    }

    const allKeys = quotes.map((q) => q.id);
    let unshownKeys = allKeys.filter((k) => !pool.includes(k));

    if (unshownKeys.length === 0) {
      pool = [];
      unshownKeys = allKeys;
    }

    const randomKey = unshownKeys[Math.floor(Math.random() * unshownKeys.length)];
    const chosenQuote = quotes.find((q) => q.id === randomKey);

    if (chosenQuote) {
      const newPool = [...pool, randomKey];
      localStorage.setItem("gita_daily_wisdom_pool", JSON.stringify(newPool));
      const dailyObj = { date: intervalKey, quote: chosenQuote };
      localStorage.setItem("gita_daily_wisdom", JSON.stringify(dailyObj));
      setDailyQuote(chosenQuote);
    }
  }, [quotes]);

  const displayedQuotes = quotes ? quotes.filter((q) => q.id !== dailyQuote?.id) : [];

  return (
    <ScreenWrapper>
      <Header title={t("wisdom", selectedLanguage)} back={false} />
      
      {/* Sticky/Fixed Daily Wisdom Banner */}
      <div className="px-5 pb-2 shrink-0">
        <AnimatedImageBanner className="aspect-[16/10]">
          <span className="text-[10px] uppercase tracking-widest opacity-80">{t("dailyWisdom", selectedLanguage)}</span>
          <p className="mt-1 font-serif text-xl leading-snug text-balance">
            "
            {dailyQuote?.text ||
              "When meditation is mastered, the mind is unwavering like the flame of a lamp in a windless place."}
            "
          </p>
          <p className="mt-2 text-xs opacity-80">{t("gitaQuote", selectedLanguage)}</p>
        </AnimatedImageBanner>
      </div>

      {/* Scrollable list of other quotes */}
      <div className="flex-1 overflow-y-auto px-5 pb-44 space-y-3 scroll-hide">
        {displayedQuotes.map((w, idx) => (
          <AppCard key={w.id ?? idx}>
            <div className="flex items-start gap-3">
              <span className="text-[10px] font-bold text-primary/60 mt-1 w-6 shrink-0 text-right">{idx + 1}</span>
              <p className="font-serif text-base text-foreground leading-relaxed flex-1">"{w.text}"</p>
            </div>
            <div className="mt-3 flex items-center justify-between pl-9">
              <p className="text-xs text-muted-foreground">{t("gitaQuote", selectedLanguage)}</p>
              <div className="flex gap-1">
                <IconButton onClick={() => { toggleFavorite(w.id); toast.success(isFavorite(w.id) ? t("removedFromFavoritesToast", selectedLanguage) : t("addedToFavoritesToast", selectedLanguage)); }}>
                  <Bookmark size={16} className={isFavorite(w.id) ? "fill-primary text-primary" : ""} />
                </IconButton>
                <IconButton onClick={() => toast.success(t("sharedSuccessfullyToast", selectedLanguage))}>
                  <Share2 size={16} />
                </IconButton>
              </div>
            </div>
          </AppCard>
        ))}
      </div>
      <BottomTabs />
    </ScreenWrapper>
  );
}

/* ───────────── 14. Wisdom Themes ───────────── */
const wisdomThemes = [
  { id: "t1", title: "On Duty", count: 24, color: "from-amber-200 to-orange-200 dark:from-amber-950/40 dark:to-orange-950/40 dark:border dark:border-primary/10", query: "duty" },
  {
    id: "t2",
    title: "On Detachment",
    count: 18,
    color: "from-rose-200 to-amber-200 dark:from-rose-950/40 dark:to-amber-950/40 dark:border dark:border-primary/10",
    query: "detachment",
  },
  {
    id: "t3",
    title: "On Devotion",
    count: 31,
    color: "from-yellow-200 to-rose-200 dark:from-yellow-950/40 dark:to-rose-950/40 dark:border dark:border-primary/10",
    query: "devotion",
  },
  {
    id: "t4",
    title: "On Meditation",
    count: 16,
    color: "from-orange-200 to-yellow-200 dark:from-orange-950/40 dark:to-yellow-950/40 dark:border dark:border-primary/10",
    query: "meditation",
  },
  {
    id: "t5",
    title: "On The Soul",
    count: 22,
    color: "from-amber-100 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/30 dark:border dark:border-primary/10",
    query: "soul",
  },
  {
    id: "t6",
    title: "On Liberation",
    count: 19,
    color: "from-yellow-100 to-amber-200 dark:from-yellow-950/30 dark:to-amber-950/40 dark:border dark:border-primary/10",
    query: "liberation",
  },
];

export function WisdomThemes() {
  const nav = useNavigate();
  const { selectedLanguage } = useUserProgress();
  return (
    <ScreenWrapper>
      <Header title={t("wisdomThemesTitle", selectedLanguage)} subtitle={t("wisdomThemesSubtitle", selectedLanguage)} back={true} />
      <div className="flex-1 overflow-y-auto px-5 grid grid-cols-2 gap-3 pb-8 scroll-hide">
        {wisdomThemes.map((themeItem) => (
          <button type="button"
            key={themeItem.id}
            onClick={() => nav(`/wisdom/theme/${themeItem.id}`)}
            className="text-left active:scale-[0.98] transition"
          >
            <AppCard
              className={cn(
                "aspect-square flex flex-col justify-between bg-gradient-to-br border-0 shadow-soft",
                themeItem.color,
              )}
            >
              <span className="font-devanagari text-xl text-foreground/70 font-bold select-none">ॐ</span>
              <div>
                <p className="font-serif text-lg text-foreground">{t(themeItem.id, selectedLanguage)}</p>
                <p className="text-xs text-foreground/70">{themeItem.count} {t("verses", selectedLanguage).toLowerCase()}</p>
              </div>
            </AppCard>
          </button>
        ))}
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 15. Wisdom Theme Detail ───────────── */
export function WisdomThemeDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { selectedLanguage } = useUserProgress();

  const theme = wisdomThemes.find((t) => t.id === id) || wisdomThemes[0];

  // Search verses matching the theme's query tag
  const allProcessedVerses = Object.values((gitaProcessedData as any).verses || {}) as any[];
  const themeVerses = allProcessedVerses
    .filter((v: any) => {
      const textToSearch =
        `${v.translation[selectedLanguage]?.simple || ""} ${v.translation["en"]?.simple || ""}`.toLowerCase();
      return textToSearch.includes(theme.query);
    })
    .slice(0, 5) as Verse[];

  return (
    <ScreenWrapper>
      <Header title={t(theme.id, selectedLanguage)} subtitle={`${theme.count} ${t("verses", selectedLanguage).toLowerCase()}`} back={true} />
      <div className="px-5 flex-1 overflow-y-auto space-y-3 pb-8 scroll-hide">
        <ImageBanner src={DEMO_IMG} alt={t(theme.id, selectedLanguage)} className="aspect-[5/2]">
          <p className="font-serif text-xl">{t(theme.id, selectedLanguage)}</p>
        </ImageBanner>
        {themeVerses.map((v) => (
          <VerseCard
            key={v.id}
            number={`${v.chapter}.${v.verse}`}
            sanskrit={v.sanskrit}
            translation={
              v.translation[selectedLanguage]?.simple || v.translation["en"]?.simple || ""
            }
            onClick={() => nav(`/verse/${v.chapter}.${v.verse}`)}
          />
        ))}
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 16. Bookmarks ───────────── */
export function Bookmarks() {
  const nav = useNavigate();
  const loc = useLocation();
  const [tab, setTab] = useState<"bookmarks" | "favorites">(
    new URLSearchParams(loc.search).get("tab") === "favorites" ? "favorites" : "bookmarks"
  );
  const { bookmarks, favorites, selectedLanguage, removeBookmark, toggleFavorite } = useUserProgress();

  const allProcessedVerses = (gitaProcessedData as any).verses || {};
  
  // Load actual bookmarked verses
  const bookmarkedVerses = (bookmarks || [])
    .map((id) => {
      const key = id.replace(/[\._]/g, "-");
      return allProcessedVerses[key];
    })
    .filter(Boolean) as Verse[];

  // Load actual favorited verses
  const favoriteVerses = (favorites || [])
    .map((id) => {
      const key = id.replace(/[\._]/g, "-");
      return allProcessedVerses[key];
    })
    .filter(Boolean) as Verse[];

  return (
    <ScreenWrapper>
      <Header
        title={t("savedWisdom", selectedLanguage)}
        back={false}
      />
      <div className="px-5">
        <div className="flex gap-1 p-1 rounded-full bg-muted">
          <button type="button"
            onClick={() => setTab("bookmarks")}
            className={cn(
              "flex-1 h-9 rounded-full text-sm font-medium transition",
              tab === "bookmarks" ? "bg-card shadow-card text-foreground" : "text-muted-foreground",
            )}
          >
            {t("verseSaves", selectedLanguage)} ({bookmarkedVerses.length})
          </button>
          <button type="button"
            onClick={() => setTab("favorites")}
            className={cn(
              "flex-1 h-9 rounded-full text-sm font-medium transition",
              tab === "favorites" ? "bg-card shadow-card text-foreground" : "text-muted-foreground",
            )}
          >
            {t("wisdomSaves", selectedLanguage)} ({favoriteVerses.length})
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 mt-4 space-y-3 pb-4 scroll-hide">
        {tab === "bookmarks" ? (
          bookmarkedVerses.length === 0 ? (
            <EmptyState
              icon={<Bookmark size={28} />}
              title={t("noSavedBookmarks", selectedLanguage)}
              body={t("noSavedBookmarksSub", selectedLanguage)}
            />
          ) : (
            bookmarkedVerses.map((v) => {
              const vId = `${v.chapter}.${v.verse}`;
              return (
                <AppCard key={vId} onClick={() => nav(`/verse/${vId}`)}>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-widest text-primary font-semibold">{t("verseLabel", selectedLanguage)} {vId}</p>
                    <button type="button"
                      onClick={(e) => { e.stopPropagation(); removeBookmark(vId); }}
                      className="p-1 rounded-full text-muted-foreground hover:text-destructive transition active:scale-90"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="font-serif text-base mt-1.5 line-clamp-2 text-foreground leading-relaxed">
                    {v.translation[selectedLanguage]?.simple || v.translation["en"]?.simple || ""}
                  </p>
                </AppCard>
              );
            })
          )
        ) : (
          favoriteVerses.length === 0 ? (
            <EmptyState
              icon={<Heart size={28} className="text-destructive" />}
              title={t("noFavorites", selectedLanguage)}
              body={t("noFavoritesSub", selectedLanguage)}
            />
          ) : (
            favoriteVerses.map((v) => {
              const vId = `${v.chapter}.${v.verse}`;
              return (
                <AppCard key={vId} onClick={() => nav(`/verse/${vId}`)}>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-widest text-primary font-semibold">{t("verseLabel", selectedLanguage)} {vId}</p>
                    <button type="button"
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(vId); }}
                      className="p-1 rounded-full text-muted-foreground hover:text-destructive transition active:scale-90"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="font-serif text-base mt-1.5 line-clamp-2 text-foreground leading-relaxed">
                    {v.translation[selectedLanguage]?.simple || v.translation["en"]?.simple || ""}
                  </p>
                </AppCard>
              );
            })
          )
        )}
      </div>
      <BottomTabs />
    </ScreenWrapper>
  );
}

/* ───────────── 17. Favorites Collections ───────────── */
export function Favorites() {
  const nav = useNavigate();
  const { favorites, selectedLanguage } = useUserProgress();
  const allProcessedVerses = (gitaProcessedData as any).verses || {};

  const favoriteVerses = (favorites || [])
    .map((id) => {
      const key = id.replace(/[\._]/g, "-");
      return allProcessedVerses[key];
    })
    .filter(Boolean) as Verse[];

  return (
    <ScreenWrapper>
      <Header
        title={t("favorites", selectedLanguage)}
        subtitle={`${favoriteVerses.length} ${t("verses", selectedLanguage).toLowerCase()}`}
        back={true}
      />
      <div className="px-5 flex-1 overflow-y-auto space-y-3 pb-8 scroll-hide">
        {favoriteVerses.length === 0 ? (
          <EmptyState
            icon={<Heart size={28} className="text-destructive animate-pulse" />}
            title={t("noFavorites", selectedLanguage)}
            body={t("noFavoritesSub", selectedLanguage)}
          />
        ) : (
          favoriteVerses.map((v) => {
            const vId = `${v.chapter}.${v.verse}`;
            return (
              <VerseCard
                key={vId}
                number={vId}
                sanskrit={v.sanskrit}
                translation={
                  v.translation[selectedLanguage]?.simple || v.translation["en"]?.simple || ""
                }
                onClick={() => nav(`/verse/${vId}`)}
              />
            );
          })
        )}
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 18. Notes ───────────── */
export function Notes() {
  const { notes, addNote, deleteNote, selectedLanguage } = useUserProgress();
  const [draft, setDraft] = useState("");

  const handleSave = () => {
    if (!draft.trim()) return;
    addNote("General", "Reflection", draft);
    setDraft("");
    toast.success(t("reflectionSavedToast", selectedLanguage));
  };

  return (
    <ScreenWrapper>
      <Header title={t("notesAndReflections", selectedLanguage)} back={true} />
      <div className="px-5">
        <AppCard>
          <textarea
              aria-label="Note content"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("writeReflectionPlaceholder", selectedLanguage)}
            rows={3}
            className="w-full bg-transparent outline-none text-sm resize-none placeholder:text-muted-foreground"
          />
          <div className="flex justify-end mt-2">
            <button type="button"
              onClick={handleSave}
              className="px-4 h-9 rounded-full bg-gradient-gold text-primary-foreground text-sm font-medium active:scale-[0.97] transition"
            >
              {t("saveBtn", selectedLanguage)}
            </button>
          </div>
        </AppCard>
      </div>
      <div className="flex-1 overflow-y-auto px-5 mt-4 space-y-3 pb-8 scroll-hide">
        {notes.length === 0 ? (
          <EmptyState
            icon={<FileText size={28} />}
            title={t("noReflections", selectedLanguage)}
            body={t("noReflectionsSub", selectedLanguage)}
          />
        ) : (
          notes.map((n) => (
            <AppCard key={n.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-serif text-base text-foreground">{n.title}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    {n.date} · {t("verseLabel", selectedLanguage)} {n.verseId}
                  </p>
                </div>
                <button type="button"
                  onClick={() => {
                    deleteNote(n.id);
                    toast.success(t("deletedNoteToast", selectedLanguage));
                  }}
                  className="text-muted-foreground active:scale-[0.9]"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-sm text-foreground mt-2 leading-relaxed whitespace-pre-line">
                {n.body}
              </p>
            </AppCard>
          ))
        )}
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 19. Reading History ───────────── */
function formatHistoryDate(dateStr: string): string {
  if (!dateStr) return "";
  if (dateStr === "Today" || dateStr === "Yesterday") return dateStr;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const today = new Date();
    if (d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
      return "Today";
    }
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.getDate() === yesterday.getDate() && d.getMonth() === yesterday.getMonth() && d.getFullYear() === yesterday.getFullYear()) {
      return "Yesterday";
    }
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export function HistoryScreen() {
  const nav = useNavigate();
  const { history, selectedLanguage } = useUserProgress();

  return (
    <ScreenWrapper>
      <Header title={t("readingHistory", selectedLanguage)} back={true} />
      <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-8 scroll-hide text-left">
        {history.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            {t("historyEmpty", selectedLanguage)}
          </div>
        ) : (
          history.map((h) => (
            <AppCard
              key={h.id}
              onClick={() => nav(`/verse/${h.chapter}.${h.verse}`)}
              className="flex items-center gap-3"
            >
              <div className="size-10 rounded-full bg-gradient-dawn flex items-center justify-center text-primary text-xs font-medium shrink-0">
                {h.chapter}.{h.verse}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm text-foreground truncate">
                  {t("chapterLabel", selectedLanguage)} {h.chapter}, {t("verseLabel", selectedLanguage).toLowerCase()} {h.verse}
                </p>
                <p className="text-xs text-muted-foreground">{formatHistoryDate(h.date)}</p>
              </div>
              <HistoryIcon size={16} className="text-muted-foreground" />
            </AppCard>
          ))
        )}
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 20. Audio Player ───────────── */
export function Player() {
  const nav = useNavigate();
  const { isFavorite, toggleFavorite, selectedLanguage } = useUserProgress();
  const {
    isPlaying,
    currentTime,
    duration,
    currentVerse,
    playbackRate,
    pause,
    resume,
    seek,
    setRate,
    currentLanguage,
  } = useAudioPlayer();

  const [activeSpeedIdx, setActiveSpeedIdx] = useState(1);
  const speeds = [0.8, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0];

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSpeedToggle = () => {
    const nextIdx = (activeSpeedIdx + 1) % speeds.length;
    setActiveSpeedIdx(nextIdx);
    setRate(speeds[nextIdx]);
  };

  if (!currentVerse) {
    return (
      <ScreenWrapper className="bg-gradient-dawn">
        <div className="flex items-center justify-between px-5 pt-4">
          <IconButton onClick={() => nav(-1)}>
            <ChevronLeft size={18} />
          </IconButton>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("nowPlayingLabel", selectedLanguage)}</p>
          <div className="w-10" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <Headphones size={48} className="text-primary mb-4" />
          <p className="text-lg font-serif">{t("noAudioLoadedTitle", selectedLanguage)}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {t("noAudioLoadedSub", selectedLanguage)}
          </p>
        </div>
      </ScreenWrapper>
    );
  }

  const verseId = `${currentVerse.chapter}.${currentVerse.verse}`;
  const translationText =
    currentVerse.translation[currentLanguage]?.simple ||
    currentVerse.translation["en"]?.simple ||
    "";
  const favorited = isFavorite(verseId);

  const handleFavoriteToggle = () => {
    toggleFavorite(verseId);
    if (favorited) {
      toast.success(t("removedFromFavoritesToast", selectedLanguage));
    } else {
      toast.success(t("addedToFavoritesToast", selectedLanguage));
    }
  };

  return (
    <ScreenWrapper className="bg-gradient-dawn">
      <div className="flex items-center justify-between px-5 pt-4">
        <IconButton onClick={() => nav(-1)}>
          <ChevronLeft size={18} />
        </IconButton>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("nowPlaying", selectedLanguage)}</p>
        <IconButton onClick={() => toast.success(t("sharedSuccessfullyToast", selectedLanguage))}>
          <Share2 size={18} />
        </IconButton>
      </div>
      <div className="flex-1 flex flex-col items-center px-8 pt-8 pb-safe">
        <div className="w-full max-w-xs aspect-square rounded-3xl overflow-hidden shadow-soft">
          <img src={DEMO_IMG} alt={t("nowPlayingLabel", selectedLanguage)} className="w-full h-full object-cover" />
        </div>
        <div className="mt-8 text-center max-w-sm">
          <p className="font-serif text-2xl text-foreground">
            {t("chapterLabel", selectedLanguage)} {currentVerse.chapter}, {t("verseLabel", selectedLanguage)} {currentVerse.verse}
          </p>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {t("recitationAndCommentary", selectedLanguage)}
          </p>
          <p className="text-sm text-foreground/80 mt-3 italic line-clamp-2">"{translationText}"</p>
        </div>

        {/* Slider bar */}
        <div className="w-full mt-8">
          <input
              aria-label="Audio progress"
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seek(parseFloat(e.target.value))}
            className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-gold"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mt-10">
          <IconButton onClick={() => seek(Math.max(0, currentTime - 10))}>
            <SkipBack size={20} />
          </IconButton>
          <button type="button"
            onClick={isPlaying ? pause : resume}
            className="size-16 rounded-full bg-gradient-gold text-primary-foreground flex items-center justify-center shadow-soft active:scale-[0.96] transition"
          >
            {isPlaying ? <Pause size={26} /> : <Play size={26} className="ml-1" />}
          </button>
          <IconButton onClick={() => seek(Math.min(duration, currentTime + 10))}>
            <SkipForward size={20} />
          </IconButton>
        </div>

        <div className="flex justify-between w-full mt-8 text-muted-foreground pt-4">
          <button type="button"
            onClick={handleSpeedToggle}
            className="h-10 px-3 rounded-full bg-card/70 backdrop-blur shadow-card flex items-center justify-center text-xs font-semibold text-foreground/70 hover:text-foreground"
          >
            {speeds[activeSpeedIdx]}x
          </button>
          <IconButton onClick={handleFavoriteToggle}>
            {favorited ? (
              <Heart size={18} className="text-destructive fill-destructive" />
            ) : (
              <Heart size={18} />
            )}
          </IconButton>
          <IconButton onClick={() => nav(`/verse/${verseId}`)}>
            <BookOpen size={18} />
          </IconButton>
        </div>
      </div>
    </ScreenWrapper>
  );
}

/* Mini player overlay state — always visible; defaults to verse 1.1 for new users */
export function MiniPlayer({ hasTabs = true }: { hasTabs?: boolean }) {
  const nav = useNavigate();
  const { isPlaying, currentVerse, pause, resume, play, currentLanguage } = useAudioPlayer();
  const { downloadVerse, isVerseDownloaded, downloading, selectedLanguage } = useUserProgress();

  // Always fetch verse 1.1 as the default "next up" when nothing is loaded
  const { data: defaultVerse } = useVerseDetail(1, 1);

  // Determine which verse to display — current if playing, else verse 1.1
  const displayVerse = currentVerse ?? defaultVerse ?? null;
  if (!displayVerse) return null;

  const verseId = `${displayVerse.chapter}.${displayVerse.verse}`;
  const isLoaded = !!currentVerse;

  const handlePlay = () => {
    if (isLoaded) {
      isPlaying ? pause() : resume();
    } else if (defaultVerse) {
      // Start verse 1.1 fresh
      play(defaultVerse, selectedLanguage);
    }
  };

  const translationText =
    displayVerse.translation[selectedLanguage]?.simple ||
    displayVerse.translation[currentLanguage]?.simple ||
    displayVerse.translation["en"]?.simple ||
    "Sanskrit Recitation";

  return (
    <div
      className={cn(
        "absolute left-0 right-0 z-40 mx-3 rounded-2xl bg-card/96 backdrop-blur-xl border border-border shadow-soft px-3 py-2.5 flex items-center gap-3 transition-transform",
        hasTabs ? "bottom-[calc(92px+env(safe-area-inset-bottom))]" : "bottom-[calc(16px+env(safe-area-inset-bottom))]"
      )}
    >
      <img
        src={DEMO_IMG}
        alt=""
        className="size-10 rounded-xl object-cover shrink-0 cursor-pointer"
        onClick={() => nav(`/verse/${displayVerse.chapter}.${displayVerse.verse}`)}
      />
      <div
        className="flex-1 min-w-0 cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={() => nav(`/verse/${displayVerse.chapter}.${displayVerse.verse}`)}
        onKeyDown={(e) => e.key === "Enter" && nav(`/verse/${displayVerse.chapter}.${displayVerse.verse}`)}
      >
        <p className="text-sm font-medium text-foreground truncate">
          {t("chapterLabel", selectedLanguage)} {displayVerse.chapter} · {t("verseLabel", selectedLanguage)} {displayVerse.verse}
          {!isLoaded && <span className="text-[10px] text-primary font-semibold ml-1.5">{t("upNext", selectedLanguage)}</span>}
        </p>
        <p className="text-[10px] text-muted-foreground truncate">{translationText}</p>
      </div>

      {/* Download icon — only when a verse is actually loaded/playing */}
      {isLoaded && (
        isVerseDownloaded(verseId) ? (
          <button type="button"
            title={t("savedOfflineLabel", selectedLanguage)}
            className="size-8 rounded-full border border-primary/30 flex items-center justify-center shrink-0 bg-card/70 active:scale-90 transition"
          >
            <DownloadDone size={14} />
          </button>
        ) : downloading[`verse:${verseId}`] !== undefined ? (
          <button type="button" disabled title={`Downloading ${downloading[`verse:${verseId}`]}%`} className="size-8 flex items-center justify-center shrink-0">
            <DownloadRing progress={downloading[`verse:${verseId}`]} size={32} />
          </button>
        ) : (
          <button type="button"
            onClick={(e) => { e.stopPropagation(); downloadVerse(verseId); }}
            title={t("downloadForOffline", selectedLanguage)}
            className="size-8 rounded-full border border-border/50 flex items-center justify-center shrink-0 text-muted-foreground hover:text-foreground bg-card active:scale-90 transition"
          >
            <Download size={14} />
          </button>
        )
      )}

      {/* Play/Pause */}
      <button type="button"
        onClick={handlePlay}
        className="size-9 rounded-full bg-gradient-gold text-primary-foreground flex items-center justify-center shrink-0 active:scale-[0.93] transition shadow-card"
      >
        {isLoaded && isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>
    </div>
  );
}

/* ───────────── 22. Daily Journey / Streak ───────────── */
const getLocalDateString = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export function Journey() {
  const { profile, readDates, selectedLanguage } = useUserProgress();
  const reminderConfig = getReminderConfig();
  const [durationFilter, setDurationFilter] = useState<"week" | "month" | "custom" | "all">("week");

  // Stateful offsets and selections
  const [offset7Days, setOffset7Days] = useState(0);
  const [selectedMonthDate, setSelectedMonthDate] = useState(() => new Date());
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return getLocalDateString(d);
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    return getLocalDateString(new Date());
  });

  // Helper to format date range for Week
  const getWeekDateRange = () => {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 6 - offset7Days);
    const end = new Date();
    end.setDate(today.getDate() - offset7Days);
    
    const startMonth = start.toLocaleDateString(undefined, { month: "short" });
    const endMonth = end.toLocaleDateString(undefined, { month: "short" });
    
    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()} - ${end.getDate()}`;
    }
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}`;
  };

  // Helper to format current Month & Year
  const getCurrentMonthLabel = () => {
    return selectedMonthDate.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
  };

  // Helper to format All Time range (Since creation)
  const getAllTimeLabel = () => {
    const start = profile.createdAt ? new Date(profile.createdAt) : new Date();
    return `Since ${start.toLocaleDateString(undefined, { month: "short", year: "2-digit" })}`;
  };

  // Calculate 7 days of the week chronologically based on offset
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i) - offset7Days);
    const dateStr = getLocalDateString(d);
    const isRead = readDates.includes(dateStr);
    return {
      dateStr,
      isRead,
      dayNum: d.getDate(),
      dayName: d.toLocaleDateString(undefined, { weekday: "short" }).substring(0, 3),
    };
  });

  // Calculate current month grid cells
  const getMonthGrid = (date = new Date()) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const monthName = date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    
    const cells = [];
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ dateStr: `empty-${i}`, dayNum: null, isRead: false, isFuture: false });
    }
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(year, month, day);
      const dateStr = getLocalDateString(d);
      const isRead = readDates.includes(dateStr);
      const isFuture = d > new Date();
      cells.push({ dateStr, dayNum: day, isRead, isFuture });
    }
    return { monthName, cells };
  };

  // Calculate custom range grid cells
  const getCustomRangeDays = () => {
    if (!customStartDate || !customEndDate) return [];
    const start = new Date(customStartDate);
    const end = new Date(customEndDate);
    if (start > end) return [];
    
    const days = [];
    const current = new Date(start);
    let iterations = 0;
    while (current <= end && iterations < 90) {
      iterations++;
      const dateStr = getLocalDateString(current);
      const isRead = readDates.includes(dateStr);
      days.push({
        dateStr,
        isRead,
        dayNum: current.getDate(),
        dayName: current.toLocaleDateString(undefined, { weekday: "short" }).substring(0, 3),
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  // Calculate list of months since creation date (all-time history)
  const getAllMonthsList = () => {
    const start = profile.createdAt ? new Date(profile.createdAt) : new Date();
    start.setDate(1);
    const end = new Date();
    end.setDate(1);
    
    const months = [];
    const current = new Date(end);
    let iterations = 0;
    while (current >= start && iterations < 36) {
      iterations++;
      months.push(new Date(current));
      current.setMonth(current.getMonth() - 1);
    }
    if (months.length === 0) {
      months.push(new Date());
    }
    return months;
  };

  return (
    <ScreenWrapper>
      <Header title={t("yourJourney", selectedLanguage)} back={true} />
      <div className="flex-1 overflow-y-auto px-5 space-y-4 pb-8 scroll-hide pt-4">
        {/* Streak & Stats Header */}
        <AppCard className="bg-gradient-gold text-primary-foreground border-0 text-center py-6 shadow-soft">
          <Flame size={28} className="mx-auto animate-pulse" />
          <p className="font-serif text-4xl mt-2">{profile.streak}</p>
          <p className="text-xs uppercase tracking-widest opacity-90">{t("streak", selectedLanguage)}</p>
        </AppCard>

        {/* Stats Summary Grid */}
        <div className="grid grid-cols-3 gap-3">
          <AppCard className="text-center">
            <p className="font-serif text-2xl text-primary font-bold">{profile.versesRead}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("verses", selectedLanguage)}</p>
          </AppCard>
          <AppCard className="text-center">
            <p className="font-serif text-2xl text-primary font-bold">{profile.minutes}m</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("readTime", selectedLanguage)}</p>
          </AppCard>
          <AppCard className="text-center">
            <p className="font-serif text-2xl text-primary font-bold">{profile.bookmarks}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("saved", selectedLanguage)}</p>
          </AppCard>
        </div>

        {/* Duration Filter Pill Control */}
        <div className="flex bg-muted/40 p-1.5 rounded-2xl border border-border/40 gap-1.5 shrink-0">
          {[
            { value: "week", label: "Week", subLabel: getWeekDateRange() },
            { value: "month", label: "Month", subLabel: getCurrentMonthLabel() },
            { value: "custom", label: "Custom", subLabel: "Select Dates" },
          ].map((tab) => (
            <button type="button"
              key={tab.value}
              onClick={() => setDurationFilter(tab.value as any)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 cursor-pointer active:scale-95",
                durationFilter === tab.value
                  ? "bg-gradient-gold text-primary-foreground shadow-sm font-bold animate-fade-in"
                  : "text-muted-foreground hover:text-foreground bg-transparent"
              )}
            >
              <span className="text-[11px] font-bold tracking-wide whitespace-nowrap">{tab.label}</span>
              <span className={cn(
                "text-[8px] mt-0.5 font-medium opacity-80 whitespace-nowrap",
                durationFilter === tab.value ? "text-primary-foreground" : "text-muted-foreground/80"
              )}>
                {tab.subLabel}
              </span>
            </button>
          ))}
        </div>

        {/* Week View */}
        {durationFilter === "week" && (
          <AppCard className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
              <div className="flex items-center gap-2">
                <button type="button"
                  onClick={() => setOffset7Days(prev => prev + 7)}
                  className="size-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 active:scale-90 transition shrink-0"
                >
                  <ChevronLeft size={14} className="text-foreground" />
                </button>
                <p className="font-serif text-sm text-foreground font-medium text-center px-1">
                  {getWeekDateRange()}
                </p>
                <button type="button"
                  onClick={() => setOffset7Days(prev => Math.max(0, prev - 7))}
                  disabled={offset7Days === 0}
                  className="size-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 active:scale-90 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <ChevronRight size={14} className="text-foreground" />
                </button>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold bg-primary/10 px-2.5 py-1 rounded-full">
                {weekDays.filter(d => d.isRead).length} / 7 Days Active
              </span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((d) => (
                <div
                  key={d.dateStr}
                  className="flex flex-col items-center gap-1.5 p-1 rounded-xl bg-card border border-border/40"
                >
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">{d.dayName}</span>
                  <div
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center text-xs transition duration-300",
                      d.isRead
                        ? "bg-gradient-gold text-primary-foreground font-bold shadow-md shadow-amber-500/10 scale-105"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {d.dayNum}
                  </div>
                </div>
              ))}
            </div>
          </AppCard>
        )}

        {/* Month View */}
        {durationFilter === "month" && (() => {
          const { monthName, cells } = getMonthGrid(selectedMonthDate);
          const weekdays = ["S", "M", "T", "W", "T", "F", "S"];
          const readCount = cells.filter(c => c.dayNum && c.isRead).length;
          return (
            <AppCard className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                <div className="flex items-center gap-2">
                  <button type="button" 
                    onClick={() => {
                      const prev = new Date(selectedMonthDate);
                      prev.setMonth(prev.getMonth() - 1);
                      setSelectedMonthDate(prev);
                    }}
                    className="size-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 active:scale-90 transition shrink-0"
                  >
                    <ChevronLeft size={14} className="text-foreground" />
                  </button>
                  <p className="font-serif text-sm text-foreground font-medium min-w-[84px] text-center">
                    {monthName}
                  </p>
                  <button type="button" 
                    onClick={() => {
                      const next = new Date(selectedMonthDate);
                      next.setMonth(next.getMonth() + 1);
                      setSelectedMonthDate(next);
                    }}
                    className="size-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 active:scale-90 transition shrink-0"
                  >
                    <ChevronRight size={14} className="text-foreground" />
                  </button>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-primary font-bold bg-primary/10 px-2.5 py-1 rounded-full">
                  {readCount} {readCount === 1 ? "Session" : "Sessions"}
                </span>
              </div>
              <div className="grid grid-cols-7 gap-y-2.5 gap-x-2 text-center">
                {weekdays.map((w, idx) => (
                  <span key={w} className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    {w}
                  </span>
                ))}
                {cells.map((cell) => {
                  if (!cell.dayNum) {
                    return <div key={cell.dateStr} className="aspect-square" />;
                  }
                  return (
                    <div
                      key={cell.dateStr}
                      className={cn(
                        "aspect-square rounded-full flex items-center justify-center text-xs transition duration-300 font-medium",
                        cell.isRead
                          ? "bg-gradient-gold text-primary-foreground font-bold shadow-md shadow-amber-500/10 scale-105"
                          : cell.isFuture
                          ? "bg-transparent text-muted-foreground/30 cursor-not-allowed"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {cell.dayNum}
                    </div>
                  );
                })}
              </div>
            </AppCard>
          );
        })()}

        {/* Custom Range Date Selector View */}
        {durationFilter === "custom" && (() => {
          const customRangeDays = getCustomRangeDays();
          const customActiveCount = customRangeDays.filter(d => d.isRead).length;
          return (
            <AppCard className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                <p className="font-serif text-base text-foreground font-medium">Custom Range</p>
                <span className="text-[10px] uppercase tracking-widest text-primary font-bold bg-primary/10 px-2.5 py-1 rounded-full">
                  {customActiveCount} Days Active
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date-from" className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">From</label>
                  <input
                    id="date-from"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full h-10 rounded-xl border border-border/60 bg-muted/30 px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="date-to" className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">To</label>
                  <input
                    id="date-to"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full h-10 rounded-xl border border-border/60 bg-muted/30 px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {customRangeDays.length > 0 ? (
                <div className="grid grid-cols-7 gap-2 max-h-[220px] overflow-y-auto pr-1 pt-1 scroll-hide">
                  {customRangeDays.map((d) => (
                    <div
                      key={d.dateStr}
                      className="flex flex-col items-center gap-1 p-1 rounded-xl bg-card border border-border/20 shadow-sm"
                    >
                      <span className="text-[8px] uppercase tracking-wider text-muted-foreground font-medium">{d.dayName}</span>
                      <div
                        className={cn(
                          "size-7 rounded-full flex items-center justify-center text-[10px] transition duration-200",
                          d.isRead
                            ? "bg-gradient-gold text-primary-foreground font-bold shadow-md shadow-amber-500/10 scale-105"
                            : "bg-muted text-muted-foreground/60"
                        )}
                      >
                        {d.dayNum}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Select a valid date range to view your study calendar
                </p>
              )}
            </AppCard>
          );
        })()}


        {/* Daily Reminder Settings Link Card */}
        <AppCard>
          <div className="flex items-center gap-3">
            <Bell className="text-primary" size={18} />
            <div className="flex-1">
              <p className="font-serif text-base">{t("dailyReminder", selectedLanguage)}</p>
              <p className="text-xs text-muted-foreground">
                {reminderConfig.enabled 
                  ? `${t("everyMorningAt", selectedLanguage)} ${formatTime12Hour(reminderConfig.time)}` 
                  : t("disabled", selectedLanguage)}
              </p>
            </div>
          </div>
        </AppCard>
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 23. Reminders ───────────── */
export function Reminders() {
  const { selectedLanguage } = useUserProgress();
  const [config] = useState(() => getReminderConfig());
  const [enabled, setEnabled] = useState(config.enabled);
  const [picked, setPicked] = useState(config.time);
  const times = ["05:00", "06:00", "07:00", "08:00", "09:00", "21:00"];

  const handleSave = async () => {
    await updateReminderSettings(enabled, picked);
  };

  return (
    <ScreenWrapper>
      <Header title={t("dailyReminder", selectedLanguage)} back={true} />
      <div className="px-5 flex-1 overflow-y-auto space-y-4 pb-8 scroll-hide">
        <AppCard className="flex items-center justify-between">
          <div>
            <p className="font-serif text-base">{t("gentleReminder", selectedLanguage)}</p>
            <p className="text-xs text-muted-foreground">{t("dailyNudge", selectedLanguage)}</p>
          </div>
          <button type="button"
            onClick={() => {
              setEnabled((e) => !e);
            }}
            className={cn(
              "w-12 h-7 rounded-full transition relative",
              enabled ? "bg-gradient-gold" : "bg-muted",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-6 rounded-full bg-card shadow transition-all",
                enabled ? "left-5" : "left-0.5",
              )}
            />
          </button>
        </AppCard>
        {enabled && (
          <>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 mt-2">{t("timeLabel", selectedLanguage)}</p>
              <div className="grid grid-cols-3 gap-2">
                {times.map((t) => (
                  <button type="button"
                    key={t}
                    onClick={() => setPicked(t)}
                    className={cn(
                      "h-12 rounded-full border text-xs font-semibold transition active:scale-[0.98]",
                      picked === t
                        ? "bg-gradient-gold text-primary-foreground border-transparent shadow-soft"
                        : "bg-card border-border/50 text-foreground hover:text-primary",
                    )}
                  >
                    {formatTime12Hour(t)}
                  </button>
                ))}
              </div>
            </div>
            <AppCard className="bg-gradient-dawn border border-primary/10">
              <p className="font-serif text-sm text-foreground mb-1">{t("dailyCommitmentTitle", selectedLanguage)}</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {t("dailyCommitmentSub", selectedLanguage)}
              </p>
              <div className="flex justify-between mt-3 px-1">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <div
                    key={i}
                    className="size-8 rounded-full bg-gradient-gold text-primary-foreground flex items-center justify-center text-xs font-bold shadow-soft"
                  >
                    {d}
                  </div>
                ))}
              </div>
            </AppCard>
          </>
        )}
        <PrimaryButton onClick={handleSave}>
          {t("saveReminderBtn", selectedLanguage)}
        </PrimaryButton>
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 23b. Notifications ───────────── */
interface AppNotification {
  id: string;
  category: "reminders" | "updates" | "quotes" | "achievements";
  title: string;
  body: string;
  time: string;
  dateGroup: "Today" | "This Week" | "Earlier";
  read: boolean;
  linkText?: string;
  linkTo?: string;
  iconType: "bell" | "lotus" | "trophy" | "calendar" | "chapter" | "share" | "megaphone";
}

export function Notifications() {
  const nav = useNavigate();
  const {
    selectedLanguage,
    notifications,
    clearNotifications,
    deleteNotification,
    markNotificationAsRead
  } = useUserProgress();

  const handleNotificationClick = (n: AppNotification) => {
    markNotificationAsRead(n.id);
    if (n.linkTo) {
      nav(n.linkTo);
    }
  };

  const getNotificationText = (n: AppNotification) => {
    const lang = selectedLanguage || "en";
    const dict = localizedReminders[lang] || localizedReminders["en"];

    if (
      n.title === "DailyReminderTitle" ||
      n.title === "DailyReminder" ||
      n.title.toLowerCase().includes("daily")
    ) {
      return {
        title: dict.dailyTitle,
        body: dict.dailyBody,
        linkText: t("readNow", lang) || "Read Now"
      };
    }

    if (
      n.title === "ContinueReadingTitle" ||
      n.title === "ContinueReading" ||
      n.title.toLowerCase().includes("continue")
    ) {
      const verseId = n.linkTo ? n.linkTo.split("/verse/")[1] || "1.1" : "1.1";
      return {
        title: dict.continueTitle,
        body: dict.continueBody.replace("{verse}", verseId),
        linkText: t("continueReading", lang) || "Continue Reading"
      };
    }

    if (
      n.title === "StreakReminderTitle" ||
      n.title === "StreakReminder" ||
      n.title.toLowerCase().includes("streak")
    ) {
      return {
        title: dict.streakTitle,
        body: dict.streakBody,
        linkText: t("keepGoing", lang) || "Keep Going"
      };
    }

    return {
      title: t(n.title.replace(/[^a-zA-Z0-9]/g, ""), lang) || n.title,
      body: t(n.body.replace(/[^a-zA-Z0-9]/g, ""), lang) || n.body,
      linkText: n.linkText ? t(n.linkText.replace(/[^a-zA-Z0-9]/g, ""), lang) || n.linkText : undefined
    };
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "bell":
        return (
          <div className="size-10 rounded-full bg-amber-50 dark:bg-amber-950/45 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-sm border border-amber-100/50 dark:border-transparent">
            <Bell size={18} />
          </div>
        );
      case "lotus":
        return (
          <div className="size-10 rounded-full bg-rose-50 dark:bg-rose-950/35 text-rose-500 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-sm border border-rose-100/50 dark:border-transparent">
            <Flower2 size={18} />
          </div>
        );
      case "trophy":
        return (
          <div className="size-10 rounded-full bg-amber-50 dark:bg-amber-950/35 text-primary flex items-center justify-center shrink-0 shadow-sm border border-amber-100/50 dark:border-transparent">
            <Trophy size={18} />
          </div>
        );
      case "calendar":
        return (
          <div className="size-10 rounded-full bg-indigo-50 dark:bg-indigo-950/35 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-sm border border-indigo-100/50 dark:border-transparent">
            <Calendar size={18} />
          </div>
        );
      case "chapter":
        return (
          <div className="size-10 rounded-full bg-emerald-50 dark:bg-emerald-950/35 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm border border-emerald-100/50 dark:border-transparent">
            <ArrowUp size={18} />
          </div>
        );
      case "share":
        return (
          <div className="size-10 rounded-full bg-sky-50 dark:bg-sky-950/35 text-sky-500 dark:text-sky-400 flex items-center justify-center shrink-0 shadow-sm border border-sky-100/50 dark:border-transparent">
            <Share2 size={18} />
          </div>
        );
      case "megaphone":
        return (
          <div className="size-10 rounded-full bg-orange-50 dark:bg-orange-950/35 text-orange-500 dark:text-orange-400 flex items-center justify-center shrink-0 shadow-sm border border-orange-100/50 dark:border-transparent">
            <Megaphone size={18} />
          </div>
        );
      default:
        return (
          <div className="size-10 rounded-full bg-muted flex items-center justify-center shrink-0 shadow-sm">
            <Info size={18} />
          </div>
        );
    }
  };

  const groups: ("Today" | "This Week" | "Earlier")[] = ["Today", "This Week", "Earlier"];

  return (
    <ScreenWrapper>
      {/* Exquisite Top Reference Header */}
      <div className="w-full flex justify-center pt-2 select-none">
        <div className="flex items-center gap-1.5 opacity-60">
          <span className="h-px w-6 bg-gradient-to-r from-transparent to-primary/45" />
          <span className="font-devanagari text-xs text-primary font-semibold leading-none">ॐ</span>
          <span className="h-px w-6 bg-gradient-to-l from-transparent to-primary/45" />
        </div>
      </div>

      <div className="flex items-center justify-between px-5 pt-2 pb-2 relative">
        <button type="button"
          onClick={() => nav(-1)}
          className="size-10 rounded-full bg-card/75 backdrop-blur shadow-card flex items-center justify-center text-foreground/75 hover:text-foreground active:scale-95 transition shrink-0"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center flex-1 mx-2">
          <h1 className="font-serif text-2xl text-foreground leading-tight">{t("notifications", selectedLanguage)}</h1>
          <p className="text-[10px] text-muted-foreground mt-0.5 font-medium tracking-wide">{t("stayUpdatedJourney", selectedLanguage)}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {notifications.length > 0 && (
            <button type="button"
              onClick={clearNotifications}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 hover:bg-red-500/20 active:scale-95 transition flex items-center gap-1 border border-red-500/20 shadow-sm shrink-0"
              title="Clear All"
            >
              {t("clearAll", selectedLanguage) || "Clear All"}
            </button>
          )}
          <button type="button"
            onClick={() => nav("/reminders")}
            className="size-10 rounded-full bg-card/75 backdrop-blur shadow-card flex items-center justify-center text-foreground/75 hover:text-foreground active:scale-95 transition shrink-0"
          >
            <SettingsIcon size={18} />
          </button>
        </div>
      </div>

      <div className="px-5 flex-1 overflow-y-auto space-y-4 pb-8 scroll-hide pt-4">
        {notifications.length === 0 ? (
          <EmptyState
            icon={<Bell size={28} />}
            title={t("allCaughtUp", selectedLanguage)}
            body={t("noNotifications", selectedLanguage)}
          />
        ) : (
          groups.map(group => {
            const groupNotifications = notifications.filter(n => n.dateGroup === group);
            if (groupNotifications.length === 0) return null;

            return (
              <div key={group} className="space-y-2.5">
                <p className="font-serif text-base text-foreground/80 mt-2 mb-1 px-0.5">{t(group.replace(/[^a-zA-Z0-9]/g, ""), selectedLanguage) || group}</p>
                <div className="space-y-3">
                  {groupNotifications.map(n => {
                    const displayTexts = getNotificationText(n);
                    return (
                      <AppCard
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={cn(
                          "flex items-start gap-3.5 p-3.5 transition-all border border-border/30 hover:border-primary/10 active:scale-[0.99] relative",
                          !n.read ? "bg-card/95 border-l-3 border-l-primary/70" : "bg-card/50",
                        )}
                      >
                        {getNotificationIcon(n.iconType)}
                        <div className="flex-1 min-w-0 pr-6">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-sans text-sm font-semibold text-foreground truncate pr-2">
                              {displayTexts.title}
                            </p>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[9px] text-muted-foreground font-medium">
                                {n.time}
                              </span>
                              {!n.read && (
                                <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground/90 mt-0.5 leading-relaxed">
                            {displayTexts.body}
                          </p>

                          {displayTexts.linkText && (
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-primary font-bold hover:underline select-none">
                              {n.iconType === "bell" || n.iconType === "lotus" || n.iconType === "chapter" ? (
                                <BookOpen size={11} />
                              ) : n.iconType === "trophy" ? (
                                <Sparkles size={11} />
                              ) : n.iconType === "calendar" ? (
                                <Calendar size={11} />
                              ) : n.iconType === "share" ? (
                                <Share2 size={11} />
                              ) : (
                                <ChevronRight size={11} />
                              )}
                              {displayTexts.linkText}
                            </div>
                          )}
                        </div>
                        {/* Individual Close/Clear Button */}
                        <button type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(n.id);
                          }}
                          className="absolute top-3.5 right-3.5 text-muted-foreground/45 hover:text-red-500 transition p-1.5 rounded-full hover:bg-red-500/10 active:scale-90"
                          title="Delete"
                        >
                          <X size={13} />
                        </button>
                      </AppCard>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        {/* Bottom Preferences Managed Card */}
        <button type="button"
          onClick={() => nav("/reminders")}
          className="w-full mt-4 active:scale-[0.99] transition-transform text-left block"
        >
          <AppCard className="bg-gradient-dawn border border-primary/20 flex items-center justify-between p-3.5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-gradient-gold text-primary-foreground flex items-center justify-center shrink-0 shadow-soft">
                <SettingsIcon size={18} />
              </div>
              <div>
                <p className="font-serif text-sm text-foreground">{t("manageNotificationPreferences", selectedLanguage)}</p>
                <p className="text-[10px] text-muted-foreground">{t("chooseWhatToHear", selectedLanguage)}</p>
              </div>
            </div>
            <ChevronRight className="text-muted-foreground" size={16} />
          </AppCard>
        </button>
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 24. Downloads ───────────── */
export function Downloads() {
  const nav = useNavigate();
  const {
    downloadedVerses,
    downloadedChapters,
    isGitaDownloaded,
    downloading,
    downloadVerse,
    deleteVerseDownload,
    downloadChapter,
    deleteChapterDownload,
    downloadWholeGita,
    deleteWholeGita,
    isVerseDownloaded,
    isChapterDownloaded,
    selectedLanguage,
  } = useUserProgress();

  const { data: chapters, isLoading: chaptersLoading } = useChapters();
  const [activeTab, setActiveTab] = useState<"library" | "download">("library");

  const totalSpace = (downloadedVerses.length * 0.25).toFixed(1);

  // Filter out verses whose parent chapter is already fully downloaded
  const individualDownloadedVerses = downloadedVerses.filter((vId) => {
    const [ch] = vId.split(".").map(Number);
    return !downloadedChapters.includes(ch);
  });

  return (
    <ScreenWrapper>
      <Header title={t("offlineLibrary", selectedLanguage)} subtitle={t("offlineLibrarySub", selectedLanguage)} back={true} />

      <div className="px-5 pb-3">
        {/* Statistics Panel */}
        <AppCard className="bg-gradient-dawn border border-primary/10 flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <RefreshCw size={18} className="animate-spin-slow text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("localStorageTitle", selectedLanguage)}</p>
              <p className="font-serif text-lg text-foreground">{totalSpace} MB {t("usedSpace", selectedLanguage)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{downloadedVerses.length} / 701 {t("verses", selectedLanguage).toLowerCase()}</p>
            <p className="text-[10px] text-primary uppercase font-bold tracking-widest mt-0.5">
              {isGitaDownloaded ? t("fullGitaOffline", selectedLanguage) : `${downloadedChapters.length} ${t("chapters", selectedLanguage).toLowerCase()}`}
            </p>
          </div>
        </AppCard>

        {/* Tab Selection */}
        <div className="flex bg-muted/65 p-1 rounded-full mt-4 border border-border/40">
          <button type="button"
            onClick={() => setActiveTab("library")}
            className={cn(
              "flex-1 py-2 text-xs font-semibold rounded-full transition active:scale-95",
              activeTab === "library" ? "bg-card shadow-card text-foreground" : "text-muted-foreground",
            )}
          >
            {t("myLibrary", selectedLanguage)} ({downloadedChapters.length + individualDownloadedVerses.length})
          </button>
          <button type="button"
            onClick={() => setActiveTab("download")}
            className={cn(
              "flex-1 py-2 text-xs font-semibold rounded-full transition active:scale-95",
              activeTab === "download" ? "bg-card shadow-card text-foreground" : "text-muted-foreground",
            )}
          >
            {t("browseAndDownload", selectedLanguage)}
          </button>
        </div>
      </div>

      <div className="px-5 flex-1 overflow-y-auto space-y-3 pb-8 scroll-hide">
        {activeTab === "library" ? (
          /* ───── LIBRARY TAB ───── */
          downloadedChapters.length === 0 && individualDownloadedVerses.length === 0 ? (
            <EmptyState
              icon={<Headphones size={28} />}
              title={t("yourLibraryIsEmpty", selectedLanguage)}
              body={t("libraryIsEmptySub", selectedLanguage)}
            />
          ) : (
            <div className="space-y-3">
              {/* Full Gita Card if offline */}
              {isGitaDownloaded && (
                <AppCard className="bg-gradient-gold border-0 text-primary-foreground flex items-center justify-between p-4 shadow-soft">
                  <div className="flex items-center gap-3">
                    <span className="font-devanagari text-2xl font-bold select-none text-primary-foreground/90">ॐ</span>
                    <div>
                      <p className="font-serif text-lg">{t("completeBhagavadGita", selectedLanguage)}</p>
                      <p className="text-xs opacity-90">{t("all18ChaptersOffline", selectedLanguage)}</p>
                    </div>
                  </div>
                  <IconButton
                    onClick={() => {
                      toast(t("clearAllDownloadsConfirm", selectedLanguage) || "Delete all downloads?", {
                        action: { label: "Delete", onClick: () => deleteWholeGita() },
                        cancel: { label: "Cancel", onClick: () => {} },
                      });
                    }}
                    className="bg-white/20 border-0 text-white hover:bg-white/30"
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </AppCard>
              )}

              {/* Downloaded Chapters list */}
              {!isGitaDownloaded &&
                downloadedChapters.map((chNum) => {
                  const ch = chapters?.find((c) => c.chapter_number === chNum);
                  const titleStr = ch
                    ? ch.title[selectedLanguage] || ch.title["en"]
                    : `${t("chapterLabel", selectedLanguage)} ${chNum}`;
                  return (
                    <AppCard key={`lib-ch-${chNum}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-gradient-dawn flex items-center justify-center text-primary">
                          <Headphones size={16} />
                        </div>
                        <div>
                          <p className="font-serif text-base">{titleStr}</p>
                          <p className="text-xs text-muted-foreground">{t("completeChapterRecitation", selectedLanguage)}</p>
                        </div>
                      </div>
                      <IconButton
                        onClick={() => {
                          toast(`${t("deleteChapterConfirm", selectedLanguage) || "Delete Chapter"} ${chNum}?`, {
                            action: { label: "Delete", onClick: () => deleteChapterDownload(chNum) },
                            cancel: { label: "Cancel", onClick: () => {} },
                          });
                        }}
                        className="text-destructive hover:bg-destructive/5 border-transparent bg-transparent shadow-none"
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </AppCard>
                  );
                })}

              {/* Downloaded Individual Verses list */}
              {individualDownloadedVerses.map((vId) => {
                return (
                  <AppCard key={`lib-ver-${vId}`} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground">
                        <Headphones size={16} />
                      </div>
                      <div>
                        <p className="font-serif text-base">{t("verseLabel", selectedLanguage)} {vId}</p>
                        <p className="text-xs text-muted-foreground">{t("individualVerseRecitation", selectedLanguage)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <IconButton
                        onClick={() => nav(`/verse/${vId}`)}
                        className="text-primary hover:bg-primary/5 border-transparent bg-transparent shadow-none"
                      >
                        <BookOpen size={16} />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          toast(`${t("deleteVerseConfirm", selectedLanguage) || "Delete Verse"} ${vId}?`, {
                            action: { label: "Delete", onClick: () => deleteVerseDownload(vId) },
                            cancel: { label: "Cancel", onClick: () => {} },
                          });
                        }}
                        className="text-destructive hover:bg-destructive/5 border-transparent bg-transparent shadow-none"
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </div>
                  </AppCard>
                );
              })}
            </div>
          )
        ) : (
          /* ───── BROWSE & DOWNLOAD TAB ───── */
          <div className="space-y-4 pt-1">
            {/* Global Gita Download Card */}
            <AppCard className="bg-gradient-gold border-0 text-primary-foreground p-5 shadow-soft">
              <span className="font-devanagari text-3xl font-bold mb-1.5 block select-none text-primary-foreground/90">
                ॐ
              </span>
              <h3 className="font-serif text-xl">{t("fullGitaAudioTitle", selectedLanguage)}</h3>
              <p className="text-xs opacity-90 mt-1 leading-relaxed">
                {t("fullGitaAudioDesc", selectedLanguage)}
              </p>

              <div className="mt-4">
                {isGitaDownloaded ? (
                   <div className="flex items-center gap-2 text-xs font-semibold bg-white/20 px-3 py-2 rounded-full w-fit">
                    <CheckCircle2 size={14} className="fill-current text-white" />
                    {t("offlineReady", selectedLanguage)}
                  </div>
                ) : downloading["gita"] !== undefined ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{t("downloadingEntireGita", selectedLanguage)}</span>
                      <span>{downloading["gita"]}%</span>
                    </div>
                    <ProgressBar value={downloading["gita"] / 100} />
                  </div>
                ) : (
                  <button type="button"
                    onClick={downloadWholeGita}
                    className="px-5 h-10 rounded-full bg-white text-primary text-xs font-bold shadow-soft flex items-center gap-1.5 active:scale-95 transition hover:bg-white/95 cursor-pointer"
                  >
                    <Download size={14} />
                    {t("downloadCompleteGita", selectedLanguage)}
                  </button>
                )}
              </div>
            </AppCard>

            {/* Chapters list */}
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2.5 px-0.5">
                {t("chaptersRecitations", selectedLanguage)}
              </p>
              <div className="space-y-3">
                {chaptersLoading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-16 w-full" />
                  ))
                ) : (
                  chapters?.map((ch) => {
                    const isChDownloaded = isChapterDownloaded(ch.chapter_number);
                    const isChDownloading = downloading[`chapter:${ch.chapter_number}`] !== undefined;
                    const chTitle = ch.title[selectedLanguage] || ch.title["en"];

                    return (
                      <AppCard
                        key={`dl-ch-${ch.chapter_number}`}
                        className="flex items-center justify-between p-3.5"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-base truncate">
                            {t("chapterLabel", selectedLanguage)} {ch.chapter_number} — {chTitle}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ch.verseCount} {t("verses", selectedLanguage).toLowerCase()} · ~{(ch.verseCount * 0.25).toFixed(1)} MB
                          </p>

                          {isChDownloading && (
                            <div className="mt-2 w-4/5">
                              <ProgressBar value={downloading[`chapter:${ch.chapter_number}`] / 100} />
                            </div>
                          )}
                        </div>

                        <div>
                          {isChDownloaded ? (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-primary uppercase font-bold tracking-widest mr-1">
                                {t("offline", selectedLanguage)}
                              </span>
                              <IconButton
                                onClick={() => {
                                  toast(`${t("deleteChapterConfirm", selectedLanguage) || "Delete Chapter"} ${ch.chapter_number}?`, {
                                    action: { label: "Delete", onClick: () => deleteChapterDownload(ch.chapter_number) },
                                    cancel: { label: "Cancel", onClick: () => {} },
                                  });
                                }}
                                className="text-destructive bg-transparent shadow-none hover:bg-destructive/5"
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            </div>
                          ) : isChDownloading ? (
                            <span className="text-xs font-bold text-primary mr-3 select-none">
                              {downloading[`chapter:${ch.chapter_number}`]}%
                            </span>
                          ) : (
                            <IconButton
                              onClick={() => downloadChapter(ch.chapter_number)}
                              className="text-primary bg-primary/5 hover:bg-primary/10 border-transparent shadow-none"
                            >
                              <Download size={16} />
                            </IconButton>
                          )}
                        </div>
                      </AppCard>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 25. Settings ───────────── */

/* ───────────── 25. Settings ───────────── */
export function Settings() {
  return <Profile />;
}

/* ───────────── 26. Profile ───────────── */
export function Profile() {
  const nav = useNavigate();
  const {
    user,
    profile,
    bookmarks,
    triggerSync,
    signOutUser,
    deleteAccountAndData,
    selectedLanguage,
    downloadedVerses,
    autoPlayOnOpen,
    setAutoPlayOnOpen,
    fontSize,
    setFontSize,
  } = useUserProgress();

  const { forceSyncBeforeLogout } = useGitaAI(user?.uid ?? null);

  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [newsletterPref, setNewsletterPref] = useState("daily");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);
  const prevUserRef = useRef<typeof user>(undefined);

  // Auto-open account settings on every login/signup
  useEffect(() => {
    if (prevUserRef.current === undefined) {
      prevUserRef.current = user;
      return;
    }
    if (!prevUserRef.current && user) {
      setShowSettingsModal(true);
    }
    prevUserRef.current = user;
  }, [user]);

  // Cache profile photo as base64 data URL for 24h — avoids repeated Google image fetches
  const [cachedPhotoURL, setCachedPhotoURL] = useState<string | null>(() => {
    try {
      const cached = localStorage.getItem("gita_photo_cache");
      if (!cached) return null;
      const { dataUrl, ts } = JSON.parse(cached);
      if (Date.now() - ts < 24 * 60 * 60 * 1000) return dataUrl;
      return null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!user?.photoURL) return;
    // Already have a valid cached data URL — skip fetch
    if (cachedPhotoURL?.startsWith("data:")) return;
    fetch(user.photoURL)
      .then((r) => r.blob())
      .then(
        (blob) =>
          new Promise<string>((res) => {
            const reader = new FileReader();
            reader.onloadend = () => res(reader.result as string);
            reader.readAsDataURL(blob);
          })
      )
      .then((dataUrl) => {
        setCachedPhotoURL(dataUrl);
        localStorage.setItem("gita_photo_cache", JSON.stringify({ dataUrl, ts: Date.now() }));
      })
      .catch(() => setCachedPhotoURL(user.photoURL));
  }, [user?.photoURL, cachedPhotoURL]);
  
  // Seeding state
  const [seedingProgress, setSeedingProgress] = useState<SeedingProgress>({
    status: "idle",
    message: "",
    percent: 0,
  });

  const reminderConfig = getReminderConfig();



  const handleSeedDatabase = async () => {
    if (seedingProgress.status === "running") return;

    toast("This will refresh the backend Gita cache with standard aggregated text. Proceed?", {
      action: {
        label: "Proceed",
        onClick: async () => {
          await seedGitaDatabase((p) => {
            setSeedingProgress(p);
            if (p.status === "success") {
              toast.success(p.message);
            } else if (p.status === "error") {
              toast.error(p.message);
            }
          });
        },
      },
      cancel: { label: "Cancel", onClick: () => {} },
    });
  };

  const handleSignOut = () => {
    setShowSignOutModal(true);
  };

  const confirmSignOut = async () => {
    setIsSigningOut(true);
    try {
      await forceSyncBeforeLogout();
      await signOutUser();
      setShowSignOutModal(false);
      toast.success(t("signedOutSuccessToast", selectedLanguage) || "Signed out successfully");
      nav("/");
    } catch {
      setIsSigningOut(false);
      toast.error(t("signedOutFailToast", selectedLanguage) || "Failed to sign out");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      if (result.isNewUser && result.user.email) {
        sendWelcomeEmail(result.user.email, result.user.displayName || "Seeker").catch(() => {});
      }
      toast.success(t("googleSignInSuccessToast", selectedLanguage));
    } catch (e: any) {
      const message = e?.message || e;
      if (!Capacitor.isNativePlatform()) {
        toast.error("Google sign-in is available in the native app only.");
        return;
      }
      console.error("Google sign-in failed:", e);
      toast.error(`${t("signInFailToast", selectedLanguage)}: ${message}`);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const result = await signInWithApple();
      if (result.isNewUser && result.user.email) {
        sendWelcomeEmail(result.user.email, result.user.displayName || "Seeker").catch(() => {});
      }
      toast.success(t("appleSignInSuccessToast", selectedLanguage));
    } catch (e: any) {
      const message = e?.message || e;
      if (!Capacitor.isNativePlatform()) {
        toast.error("Apple sign-in is available in the native app only.");
        return;
      }
      console.error("Apple sign-in failed:", e);
      toast.error(`${t("appleSignInFailToast", selectedLanguage)}: ${message}`);
    }
  };

  const activeLanguageObj = supportedLanguages.find((l) => l.code === selectedLanguage);

  return (
    <ScreenWrapper>
      <Header
        title={t("dashboardAndSettings", selectedLanguage)}
        back={false}
      />
      <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-6 scroll-hide pt-4">
          {/* Dynamic User Profile card */}
           {user ? (
             <AppCard className="flex items-center gap-4 border border-primary/10">
               {cachedPhotoURL || user.photoURL ? (
                 <img
                   src={cachedPhotoURL || user.photoURL || undefined}
                   alt={profile.name}
                   className="size-16 rounded-full object-cover shadow-card shrink-0"
                 />
               ) : (
                 <div className="size-16 rounded-full bg-gradient-dawn flex items-center justify-center text-primary font-bold text-xl shadow-card shrink-0">
                   {profile.name.charAt(0).toUpperCase()}
                 </div>
               )}
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-xl text-foreground truncate">{profile.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                </div>
                <button type="button"
                  onClick={() => setShowSettingsModal(true)}
                  className="size-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition active:scale-90 shrink-0"
                >
                  <SettingsIcon size={16} />
                </button>
             </AppCard>
         ) : (
          <AppCard className="bg-gradient-dawn border border-primary/10 p-5 shadow-soft">
            <h2 className="font-serif text-lg text-foreground mb-1">{t("backupProgressTitle", selectedLanguage)}</h2>
            <p className="text-xs text-muted-foreground mb-4">
              {t("backupProgressSub", selectedLanguage)}
            </p>
            <div className="space-y-2">
              <button type="button"
                onClick={handleGoogleSignIn}
                className="w-full h-11 rounded-full bg-card border border-border text-foreground font-semibold flex items-center justify-center gap-2 text-sm shadow-card active:scale-[0.98] transition cursor-pointer"
              >
                <svg className="size-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {t("continueWithGoogle", selectedLanguage)}
              </button>
              {(Capacitor.getPlatform() === "ios" || !Capacitor.isNativePlatform()) && (
                <button type="button"
                  onClick={handleAppleSignIn}
                  className="w-full h-11 rounded-full bg-foreground text-background font-semibold flex items-center justify-center gap-2 text-sm shadow-soft active:scale-[0.98] transition cursor-pointer"
                >
                  <svg className="size-4 shrink-0 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.62.71-1.16 1.85-1.01 2.96 1.1.09 2.24-.57 2.96-1.41" />
                  </svg>
                  {t("continueWithApple", selectedLanguage)}
                </button>
              )}
            </div>
          </AppCard>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-3">
          <AppCard className="text-center bg-card/40">
            <p className="font-serif text-2xl text-primary font-bold">{profile.streak}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("streak", selectedLanguage)}</p>
          </AppCard>
          <AppCard className="text-center bg-card/40">
            <p className="font-serif text-2xl text-primary font-bold">{profile.versesRead}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("versesReadSub", selectedLanguage)}</p>
          </AppCard>
          <AppCard className="text-center bg-card/40">
            <p className="font-serif text-2xl text-primary font-bold">{profile.minutes}m</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("minutes", selectedLanguage)}</p>
          </AppCard>
        </div>

        {/* Reading Settings */}
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 px-1">
            {t("readingSettings", selectedLanguage)}
          </p>
          <div className="rounded-2xl bg-card border border-border/60 shadow-card divide-y divide-border/60 overflow-hidden">
            <button type="button"
              onClick={() => nav("/language")}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-muted/10 transition cursor-pointer"
            >
              <Languages size={18} className="text-primary" />
              <span className="flex-1 text-sm text-foreground">{t("language", selectedLanguage)}</span>
              <span className="text-xs text-muted-foreground">{activeLanguageObj?.name || t("selectLanguageShort", selectedLanguage)}</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
            <button type="button"
              onClick={() => setAutoPlayOnOpen(!autoPlayOnOpen)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-muted/10 transition cursor-pointer"
            >
              <Volume2 size={18} className="text-primary" />
              <span className="flex-1 text-sm text-foreground">{t("autoPlayAudioLabel", selectedLanguage)}</span>
              <span className={`text-xs ${autoPlayOnOpen ? "text-primary" : "text-muted-foreground"}`}>
                {autoPlayOnOpen ? t("onLabel", selectedLanguage) : t("offLabel", selectedLanguage)}
              </span>
              <div className={`w-9 h-5 rounded-full transition-colors relative ${autoPlayOnOpen ? "bg-primary" : "bg-muted"}`}>
                <div className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform ${autoPlayOnOpen ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
            </button>

            <div className="w-full flex items-center gap-3 px-4 py-3.5">
              <Type size={18} className="text-primary shrink-0" />
              <span className="flex-1 text-sm text-foreground">{t("fontSizeLabel", selectedLanguage)}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                  className="size-7 rounded-full bg-muted flex items-center justify-center text-foreground active:scale-90 transition disabled:opacity-40"
                  disabled={fontSize <= 12}
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm text-foreground w-7 text-center tabular-nums">{fontSize}</span>
                <button
                  type="button"
                  onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                  className="size-7 rounded-full bg-muted flex items-center justify-center text-foreground active:scale-90 transition disabled:opacity-40"
                  disabled={fontSize >= 24}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <button type="button"
              onClick={() => nav("/reminders")}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-muted/10 transition cursor-pointer"
            >
              <Bell size={18} className="text-primary" />
              <span className="flex-1 text-sm text-foreground">{t("dailyReminder", selectedLanguage)}</span>
              <span className="text-xs text-muted-foreground">
                {reminderConfig.enabled ? formatTime12Hour(reminderConfig.time) : t("disabledStatus", selectedLanguage)}
              </span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Practice Tools */}
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 px-1">
            {t("practiceTools", selectedLanguage)}
          </p>
          <div className="rounded-2xl bg-card border border-border/60 shadow-card divide-y divide-border/60 overflow-hidden">
            <button type="button"
              onClick={() => nav("/notes")}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-muted/10 transition cursor-pointer"
            >
              <FileText size={18} className="text-primary" />
              <span className="flex-1 text-sm text-foreground">{t("notesAndReflections", selectedLanguage)}</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
            <button type="button"
              onClick={() => nav("/history")}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-muted/10 transition cursor-pointer"
            >
              <HistoryIcon size={18} className="text-primary" />
              <span className="flex-1 text-sm text-foreground">{t("readingHistory", selectedLanguage)}</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
            <button type="button"
              onClick={() => nav("/downloads")}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-muted/10 transition cursor-pointer"
            >
              <Download size={18} className="text-primary" />
              <span className="flex-1 text-sm text-foreground">{t("downloads", selectedLanguage)}</span>
              <span className="text-xs text-muted-foreground">{downloadedVerses.length} {t("tracks", selectedLanguage)}</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
            <button type="button"
              onClick={() => nav("/journey")}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-muted/10 transition cursor-pointer"
            >
              <Flame size={18} className="text-primary" />
              <span className="flex-1 text-sm text-foreground">{t("dailyJourney", selectedLanguage)}</span>
              <span className="text-xs text-muted-foreground">{profile.streak} days</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>



         {/* Help & Support */}
         <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 px-1">{t("helpSupportTitle", selectedLanguage)}</p>
           <div className="rounded-2xl bg-card border border-border/60 shadow-card divide-y divide-border/60 overflow-hidden">
             <button type="button" onClick={() => {
               const shareText = `I'm reading the Bhagavad Gita on Gita Sadhana! Join me on this spiritual journey.`;
               if (navigator.share) {
                 navigator.share({
                   title: "Gita Sadhana",
                   text: shareText,
                   url: "https://gitasadhana.com",
                 });
               } else {
                 navigator.clipboard.writeText(shareText);
                  toast.success(t("copiedToClipboardToast", selectedLanguage));
               }
             }} className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-muted/10 transition cursor-pointer">
               <Share2 size={18} className="text-primary" />
                <span className="flex-1 text-sm text-foreground">{t("shareWisdom", selectedLanguage)}</span>
               <ChevronRight size={16} className="text-muted-foreground" />
             </button>
             <button type="button" onClick={() => nav("/help/contact")} className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-muted/10 transition cursor-pointer">
               <Info size={18} className="text-primary" />
                <span className="flex-1 text-sm text-foreground">{t("contactUsTitle", selectedLanguage)}</span>
               <ChevronRight size={16} className="text-muted-foreground" />
             </button>
            <button type="button" onClick={() => nav("/help/privacy")} className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-muted/10 transition cursor-pointer">
              <FileText size={18} className="text-primary" />
               <span className="flex-1 text-sm text-foreground">{t("privacyPolicyTitle", selectedLanguage)}</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
            <button type="button" onClick={() => nav("/help/terms")} className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-muted/10 transition cursor-pointer">
              <FileText size={18} className="text-primary" />
               <span className="flex-1 text-sm text-foreground">{t("termsTitle", selectedLanguage)}</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
            <button type="button" onClick={() => nav("/help/correction")} className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-muted/10 transition cursor-pointer">
              <Megaphone size={18} className="text-primary" />
               <span className="flex-1 text-sm text-foreground">{t("verseLanguageCorrectionTitle", selectedLanguage)}</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>

      </div>

      {/* Sign Out Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation" onClick={() => !isSigningOut && setShowSignOutModal(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full max-w-sm bg-card rounded-3xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
              <span className="font-serif text-base text-foreground">{t("signOutTitle", selectedLanguage)}</span>
              <button type="button" onClick={() => !isSigningOut && setShowSignOutModal(false)} className="size-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                {t("signOutConfirmMessage", selectedLanguage) || "Are you sure you want to sign out? You can always sign back in to access your bookmarks, notes, and progress."}
              </p>
              <div className="flex gap-3">
                <button type="button"
                  onClick={() => !isSigningOut && setShowSignOutModal(false)}
                  disabled={isSigningOut}
                  className="flex-1 h-11 rounded-full bg-muted text-foreground font-semibold flex items-center justify-center transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {t("cancel", selectedLanguage)}
                </button>
                <button type="button"
                  onClick={confirmSignOut}
                  disabled={isSigningOut}
                  className="flex-1 h-11 rounded-full bg-destructive text-white font-semibold flex items-center justify-center transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSigningOut ? t("signingOut", selectedLanguage) : t("signOutTitle", selectedLanguage)}
                </button>
              </div>
            </div>
          </div>
        </div>
       )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation" onClick={() => !isDeletingAccount && setShowSettingsModal(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-gradient-to-b from-card via-card to-card/95 rounded-3xl shadow-2xl max-h-[85vh] overflow-y-auto border border-primary/10" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-primary/5 sticky top-0 bg-gradient-to-b from-card to-card/90 backdrop-blur-sm z-10">
              <div>
                <span className="font-serif text-lg text-foreground block">{t("accountSettingsTitle", selectedLanguage)}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{t("accountSettingsSub", selectedLanguage)}</p>
              </div>
              <button type="button" onClick={() => !isDeletingAccount && setShowSettingsModal(false)} className="size-9 rounded-full bg-muted/60 flex items-center justify-center hover:bg-muted transition text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-8 space-y-8">
              {/* Newsletter Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Bell size={18} className="text-primary" />
                  <label className="text-sm font-semibold text-foreground">{t("emailNotifications", selectedLanguage)}</label>
                </div>
                <div className="space-y-2">
                  {[
                    { value: "daily", label: t("dailyDigest", selectedLanguage), desc: t("dailyDigestDesc", selectedLanguage) },
                    { value: "weekly", label: t("weeklyDigest", selectedLanguage), desc: t("weeklyDigestDesc", selectedLanguage) },
                    { value: "monthly", label: t("monthlyDigest", selectedLanguage), desc: t("monthlyDigestDesc", selectedLanguage) },
                    { value: "none", label: t("noEmails", selectedLanguage), desc: t("noEmailsDesc", selectedLanguage) },
                  ].map((option) => (
                    <button type="button"
                      key={option.value}
                      onClick={() => setNewsletterPref(option.value)}
                      className={`w-full flex items-start gap-3 px-4 py-3.5 rounded-2xl border-2 transition duration-200 ${
                        newsletterPref === option.value
                          ? "border-primary bg-primary/8 shadow-md shadow-primary/10"
                          : "border-border/40 bg-muted/30 hover:border-primary/30 hover:bg-muted/50"
                      }`}
                    >
                      <div className={`size-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition ${
                        newsletterPref === option.value
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/40 bg-transparent"
                      }`}>
                        {newsletterPref === option.value && <div className="size-2 bg-card rounded-full" />}
                      </div>
                      <div className="text-left flex-1">
                        <p className={`text-sm font-medium ${newsletterPref === option.value ? "text-foreground" : "text-foreground/80"}`}>
                          {option.label}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">{option.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

              {/* Sign Out */}
              <button type="button"
                onClick={() => { setShowSettingsModal(false); handleSignOut(); }}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-full bg-card border border-border text-destructive font-medium active:scale-[0.98] transition hover:bg-destructive/5 cursor-pointer"
              >
                <LogOut size={16} /> {t("signOut", selectedLanguage)}
              </button>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

              {/* Danger Zone — collapsible */}
              <div className="space-y-3">
                <button type="button"
                  onClick={() => setShowDangerZone(prev => !prev)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-muted/40 border border-border/40 hover:bg-muted/60 transition active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2">
                    <Trash2 size={16} className="text-destructive/70" />
                    <span className="text-sm font-medium text-foreground/70">{t("dangerZone", selectedLanguage)}</span>
                  </div>
                  <ChevronRight size={16} className={`text-muted-foreground transition-transform duration-200 ${showDangerZone ? "rotate-90" : ""}`} />
                </button>

                {showDangerZone && (
                  <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4 space-y-3 animate-fade-up">
                    <p className="text-xs text-destructive/80">{t("dangerZoneWarning", selectedLanguage)}</p>
                    <button type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full h-11 rounded-full bg-destructive text-white font-semibold text-sm border border-destructive/50 transition active:scale-[0.98] hover:shadow-lg hover:shadow-destructive/20"
                    >
                      {t("deleteAccount", selectedLanguage)}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer note */}
            <div className="px-6 py-4 border-t border-primary/5 bg-muted/30 text-center">
                <p className="text-xs text-muted-foreground">{t("changesSavedNote", selectedLanguage)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="presentation" onClick={() => !isDeletingAccount && setShowDeleteModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
          <div className="relative w-full max-w-sm bg-card rounded-3xl shadow-2xl border border-destructive/20 scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
              <span className="font-serif text-base text-destructive font-semibold flex items-center gap-2">
                <AlertTriangle size={18} className="text-destructive animate-bounce" />
                {t("dangerZone", selectedLanguage)}
              </span>
              <button type="button" onClick={() => !isDeletingAccount && setShowDeleteModal(false)} className="size-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-6 space-y-4">
              <p className="text-sm text-foreground/90 font-medium">
                {t("dangerZoneWarning", selectedLanguage) || "This action cannot be undone. All your data will be permanently deleted."}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This will delete your registered profile, all your notes/reflections, reading history, custom bookmarks, completed verses list, and favorites from our secure servers and this device.
              </p>
              <div className="flex gap-3 pt-2">
                <button type="button"
                  onClick={() => !isDeletingAccount && setShowDeleteModal(false)}
                  disabled={isDeletingAccount}
                  className="flex-1 h-11 rounded-full bg-muted text-foreground font-semibold flex items-center justify-center transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                >
                  {t("cancel", selectedLanguage) || "Cancel"}
                </button>
                <button type="button"
                  onClick={async () => {
                    setIsDeletingAccount(true);
                    try {
                      await deleteAccountAndData();
                      setShowDeleteModal(false);
                      setShowSettingsModal(false);
                      toast.success("Your account and all study progress have been permanently deleted.");
                      nav("/");
                    } catch (e: any) {
                      console.error("Account deletion failed:", e);
                      toast.error("Failed to delete account. Please try again.");
                    } finally {
                      setIsDeletingAccount(false);
                    }
                  }}
                  disabled={isDeletingAccount}
                  className="flex-1 h-11 rounded-full bg-destructive text-white font-semibold flex items-center justify-center transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed hover:bg-destructive/95 text-sm shadow-md shadow-destructive/20"
                >
                  {isDeletingAccount ? t("deletingAccount", selectedLanguage) : t("delete", selectedLanguage) || "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomTabs />
    </ScreenWrapper>
  );
}

/* ───────────── Help: Contact ───────────── */
export function HelpContact() {
  const nav = useNavigate();
  const { user, selectedLanguage } = useUserProgress();
  const [message, setMessage] = useState("");
  const [emailInput, setEmailInput] = useState(user?.email || "");
  const [sending, setSending] = useState(false);

  const userEmail = user?.email || "";

  return (
    <ScreenWrapper>
      <Header title={t("contactUsTitle", selectedLanguage)} back={true} backTo="/profile" />
      <div className="px-5 space-y-6 pt-4 pb-8">
        <div className="rounded-2xl bg-card border border-border/60 shadow-card p-4 flex items-center gap-3">
          <Info size={20} className="text-primary shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">{t("emailUsDirectly", selectedLanguage)}</p>
            <a href="mailto:hello@gitasadhana.com" className="text-sm text-primary font-medium">hello@gitasadhana.com</a>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5 block">{t("yourEmail", selectedLanguage)}</label>
            <input
              type="email"
              aria-label="Your email address"
              value={emailInput}
              readOnly={!!user}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="your@email.com"
              className="w-full h-11 rounded-xl border border-border/60 bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5 block">{t("messageLabel", selectedLanguage)}</label>
            <textarea
              aria-label="Your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("contactMessagePlaceholder", selectedLanguage)}
              rows={5}
              className="w-full rounded-xl border border-border/60 bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>
          <button type="button"
            disabled={sending}
            onClick={async () => {
              if (!emailInput.trim() || !message.trim()) {
                toast.error(t("allFieldsRequired", selectedLanguage) || "Email and message are required.");
                return;
              }
              setSending(true);
              try {
                await sendContactEmail(emailInput.trim(), message.trim());
                toast.success(t("messageSentToast", selectedLanguage));
                setMessage("");
              } catch (e: any) {
                toast.error(e.message || "Failed to send. Try again.");
              } finally {
                setSending(false);
              }
            }}
            className="w-full h-12 rounded-full bg-primary text-white font-medium active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sending ? "Sending..." : t("submitBtn", selectedLanguage)}
          </button>
        </div>
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── Help: Privacy Policy ───────────── */
export function HelpPrivacy() {
  const { selectedLanguage } = useUserProgress();
  return (
    <ScreenWrapper>
      <Header title={t("privacyPolicyTitle", selectedLanguage)} back={true} backTo="/profile" />
      <div className="px-5 pb-10 pt-4 space-y-6 overflow-y-auto flex-1 scroll-hide">
        <p className="text-xs text-muted-foreground">{t("privacyLastUpdated", selectedLanguage)}</p>

        {[
          {
            title: "Information We Collect",
            body: "Gita Sadhana collects minimal personal information to provide you with a meaningful spiritual experience. When you create an account, we collect your name and email address. We also collect anonymized usage data such as which verses you read, your reading streak, and bookmarks — solely to personalize your journey.",
          },
          {
            title: "How We Use Your Information",
            body: "Your data is used exclusively to power your in-app experience: syncing your bookmarks, notes, reading history, and streak across devices. We do not sell, rent, or share your personal information with third parties for marketing purposes.",
          },
          {
            title: "Audio & Offline Content",
            body: "When you download verses for offline listening, audio files are cached locally on your device. These files are sourced from our secure cloud storage and are used only for personal, non-commercial spiritual practice.",
          },
          {
            title: "Third-Party Services",
            body: "We use our own Node.js backend and MongoDB for authentication and data sync, and Cloudflare R2 for audio storage. These services operate under their own privacy policies. We encourage you to review them. We do not use advertising SDKs or trackers.",
          },
          {
            title: "Data Retention & Deletion",
            body: "Your data is retained as long as your account is active. You may delete your account at any time by contacting us at hello@gitasadhana.com. Upon deletion, all your personal data is removed from our systems within 30 days.",
          },
          {
            title: "Children's Privacy",
            body: "Gita Sadhana is suitable for all ages. We do not knowingly collect data from children under 13 without parental consent. If you believe a child has provided us with personal information, please contact us immediately.",
          },
          {
            title: "Contact",
            body: "For privacy-related inquiries, please reach us at hello@gitasadhana.com. We are committed to resolving any concerns promptly and transparently.",
          },
        ].map((section) => (
          <div key={section.title} className="space-y-1.5">
            <h3 className="font-serif text-base text-foreground">{section.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{section.body}</p>
          </div>
        ))}
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── Help: Terms of Service ───────────── */
export function HelpTerms() {
  const { selectedLanguage } = useUserProgress();
  return (
    <ScreenWrapper>
      <Header title={t("termsTitle", selectedLanguage)} back={true} backTo="/profile" />
      <div className="px-5 pb-10 pt-4 space-y-6 overflow-y-auto flex-1 scroll-hide">
        <p className="text-xs text-muted-foreground">{t("termsLastUpdated", selectedLanguage)}</p>

        {[
          {
            title: "Acceptance of Terms",
            body: "By using Gita Sadhana, you agree to these Terms of Service. If you do not agree, please discontinue use of the application. These terms apply to all users, including guests and registered members.",
          },
          {
            title: "Purpose of the App",
            body: "Gita Sadhana is a spiritual study companion designed to help individuals explore the Bhagavad Gita. The app provides translations, commentary, audio recitations, and personal study tools. It is intended for personal, non-commercial use only.",
          },
          {
            title: "User Accounts",
            body: "You may use the app as a guest or sign in with Google or Apple. By creating an account, you agree to provide accurate information and keep your credentials secure. You are responsible for all activity under your account.",
          },
          {
            title: "Content & Intellectual Property",
            body: "All content within Gita Sadhana — including translations, commentary, audio, and imagery — is either original or used with appropriate rights. You may not reproduce, distribute, or commercialize any content without prior written consent from Gita Sadhana.",
          },
          {
            title: "Offline Downloads",
            body: "Audio tracks downloaded for offline use are licensed solely for personal, non-commercial spiritual practice. You may not extract, redistribute, or use these recordings outside of the Gita Sadhana app.",
          },
          {
            title: "Prohibited Conduct",
            body: "You agree not to misuse the app, attempt to reverse-engineer any part of it, submit false correction reports, or engage in any activity that disrupts the service for others. Violations may result in account suspension.",
          },
          {
            title: "Disclaimer",
            body: "Gita Sadhana is provided as-is. While we strive for accuracy in all translations and commentary, we make no guarantees of completeness or correctness. For authoritative scriptural guidance, please consult a qualified teacher.",
          },
          {
            title: "Changes to Terms",
            body: "We may update these terms from time to time. Continued use of the app after changes constitutes your acceptance of the revised terms. We will notify users of significant changes via in-app notice.",
          },
          {
            title: "Contact",
            body: "Questions about these terms? Reach us at hello@gitasadhana.com.",
          },
        ].map((section) => (
          <div key={section.title} className="space-y-1.5">
            <h3 className="font-serif text-base text-foreground">{section.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{section.body}</p>
          </div>
        ))}
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── Help: Verse/Language Correction ───────────── */
function PickerSheet({ label, placeholder, value, options, onSelect, disabled = false }: {
  label: string;
  placeholder: string;
  value: string;
  options: { value: string; label: string }[];
  onSelect: (v: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <div>
      <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5 block">{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          "w-full h-11 rounded-xl border border-border/60 bg-card px-4 text-sm flex items-center justify-between transition",
          disabled ? "opacity-40 cursor-not-allowed" : "active:bg-muted/10",
          selected ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <ChevronRight size={16} className="text-muted-foreground rotate-90" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full bg-card rounded-t-3xl shadow-2xl max-h-[60vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
              <span className="font-serif text-base text-foreground">{label}</span>
              <button type="button" onClick={() => setOpen(false)} className="size-8 rounded-full bg-muted flex items-center justify-center">
                <ChevronLeft size={16} className="rotate-[-90deg]" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 py-2">
              {options.map((o) => (
                <button type="button"
                  key={o.value}
                  onClick={() => { onSelect(o.value); setOpen(false); }}
                  className={cn(
                    "w-full px-5 py-3 text-left text-sm flex items-center justify-between transition active:bg-muted/10",
                    o.value === value ? "text-primary font-semibold" : "text-foreground"
                  )}
                >
                  {o.label}
                  {o.value === value && <span className="size-2 rounded-full bg-primary" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function HelpCorrection() {
  const { selectedLanguage, user } = useUserProgress();
  const [lang, setLang] = useState("");
  const [chapter, setChapter] = useState("");
  const [verse, setVerse] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const CHAPTER_VERSE_COUNTS: Record<number, number> = {
    1: 47, 2: 72, 3: 43, 4: 42, 5: 29, 6: 47, 7: 30, 8: 28, 9: 34,
    10: 42, 11: 55, 12: 20, 13: 35, 14: 27, 15: 20, 16: 24, 17: 28, 18: 78,
  };

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "hi", label: "Hindi" },
    { value: "kn", label: "Kannada" },
    { value: "te", label: "Telugu" },
    { value: "ta", label: "Tamil" },
    { value: "ml", label: "Malayalam" },
    { value: "mr", label: "Marathi" },
    { value: "gu", label: "Gujarati" },
    { value: "bn", label: "Bengali" },
    { value: "pa", label: "Punjabi" },
  ];

  const chapterOptions = Array.from({ length: 18 }, (_, i) => ({
    value: String(i + 1),
    label: `Chapter ${i + 1}`,
  }));

  const verseCount = chapter ? CHAPTER_VERSE_COUNTS[Number(chapter)] || 0 : 0;
  const verseOptions = Array.from({ length: verseCount }, (_, i) => ({
    value: String(i + 1),
    label: `Verse ${i + 1}`,
  }));

  const handleSubmit = async () => {
    if (!lang || !chapter || !verse || !message.trim()) {
      toast.error(t("allFieldsRequired", selectedLanguage) || "All fields are required.");
      return;
    }
    setSending(true);
    try {
      await sendCorrectionEmail(lang, chapter, verse, message.trim(), user?.email || undefined);
      toast.success(t("correctionSubmittedToast", selectedLanguage) || "Correction submitted. Thank you!");
      setLang(""); setChapter(""); setVerse(""); setMessage("");
    } catch (e: any) {
      toast.error(e.message || "Failed to submit. Try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <ScreenWrapper>
      <Header title={t("verseLanguageCorrectionTitle", selectedLanguage)} back={true} backTo="/profile" />
      <div className="px-5 space-y-4 pt-4 pb-8">
        <p className="text-sm text-muted-foreground">{t("correctionHelpText", selectedLanguage)}</p>

        <PickerSheet label={t("languageLabel", selectedLanguage)} placeholder={t("languageLabel", selectedLanguage)} value={lang} options={languageOptions} onSelect={setLang} />

        <PickerSheet label={t("chapterLabel", selectedLanguage)} placeholder={t("chapterLabel", selectedLanguage)} value={chapter} options={chapterOptions} onSelect={(v) => { setChapter(v); setVerse(""); }} />

        <PickerSheet label={t("verseLabel", selectedLanguage)} placeholder={t("verseLabel", selectedLanguage)} value={verse} options={verseOptions} onSelect={setVerse} disabled={!chapter} />

        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5 block">{t("describeIssueLabel", selectedLanguage)}</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
              placeholder={t("correctionHelpText", selectedLanguage)}
            rows={5}
            className="w-full rounded-xl border border-border/60 bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        <button type="button"
          onClick={handleSubmit}
          disabled={sending}
          className="w-full h-12 rounded-full bg-primary text-white font-medium active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {sending ? "Submitting..." : t("submitCorrectionBtn", selectedLanguage)}
        </button>
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── Gita AI ───────────── */
export function GitaAI() {
  const { user, selectedLanguage } = useUserProgress();
  const { messages, language, setLanguage, sending, limitReached, error, clearError, sendMessage, clearChat } =
    useGitaAI(user?.uid ?? null);
  const [input, setInput] = useState("");
  const [showLangPicker, setShowLangPicker] = useState(!localStorage.getItem("gita_ai_language"));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nav = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending || limitReached) return;
    setInput("");
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (showLangPicker) {
    return (
      <ScreenWrapper>
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <button type="button" onClick={() => nav(-1)} className="size-10 rounded-full bg-card/70 flex items-center justify-center text-foreground/70 hover:text-foreground transition">
            <ChevronLeft size={20} />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center pb-safe">
          <GitaAiAvatar className="size-20 mb-6" iconSize={40} />
          <h1 className="font-serif text-2xl text-foreground mb-2">Gita AI</h1>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            A calm, devotional guide to the wisdom of the Bhagavad Gita.<br/>
            Which language would you like to converse in?
          </p>
          <div className="w-full space-y-2 max-h-[50vh] overflow-y-auto scroll-hide">
            {supportedLanguages.map((l) => (
              <button type="button"
                key={l.code}
                onClick={() => { setLanguage(l.code); setShowLangPicker(false); }}
                className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-card border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition active:scale-[0.98]"
              >
                <span className="font-medium text-foreground text-sm">{l.name}</span>
                <span className="text-muted-foreground text-sm">{l.native}</span>
              </button>
            ))}
          </div>
        </div>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3 border-b border-border/40">
        <button type="button" onClick={() => nav(-1)} className="size-10 rounded-full bg-card/70 flex items-center justify-center text-foreground/70 hover:text-foreground transition shrink-0">
          <ChevronLeft size={20} />
        </button>
        <GitaAiAvatar className="size-9 shrink-0" iconSize={18} />
        <div className="flex-1 min-w-0">
          <p className="font-serif text-base text-foreground leading-tight">Gita AI</p>
          <p className="text-[11px] text-muted-foreground">
            {supportedLanguages.find((l) => l.code === language)?.name ?? "English"}
          </p>
        </div>
        <button type="button" onClick={clearChat} className="size-9 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition" aria-label="Clear chat">
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scroll-hide px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12 select-none">
            <GitaAiAvatar className="size-16 mb-4" iconSize={32} />
            <h2 className="font-serif text-lg text-foreground mb-2">Hare Krishna 🙏</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ask me anything about the Bhagavad Gita, Lord Krishna, or how to use this app.
            </p>
            <div className="mt-6 space-y-2 w-full">
              {[
                "What is the main teaching of the Bhagavad Gita?",
                "Explain the concept of Nishkama Karma",
                "Who is Lord Krishna?",
              ].map((prompt) => (
                <button type="button"
                  key={prompt}
                  onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
                  className="w-full text-left px-4 py-2.5 rounded-xl bg-card border border-border/60 text-sm text-foreground/80 hover:border-primary/40 hover:bg-primary/5 transition active:scale-[0.98]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "model" && (
              <GitaAiAvatar className="size-7 shrink-0 mt-0.5" iconSize={14} />
            )}
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-card border border-border/60 text-foreground rounded-bl-sm"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex gap-2.5 justify-start">
            <GitaAiAvatar className="size-7 shrink-0 mt-0.5" iconSize={14} />
            <div className="bg-card border border-border/60 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
              <span className="size-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0ms]" />
              <span className="size-2 rounded-full bg-primary/60 animate-bounce [animation-delay:150ms]" />
              <span className="size-2 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {limitReached && (
          <div className="mx-2 px-5 py-4 rounded-2xl bg-primary/8 border border-primary/20 text-center">
            <p className="font-serif text-base text-foreground mb-1">Daily limit reached 🙏</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You've received today's guidance from Gita AI. Please return tomorrow for more conversations and wisdom.
            </p>
          </div>
        )}

        {error && error !== "offline" && (
          <div className="mx-2 px-4 py-3 rounded-2xl bg-destructive/8 border border-destructive/20 flex items-center gap-3">
            <p className="text-sm text-destructive flex-1">{error}</p>
            <button type="button" onClick={clearError} className="text-destructive/60 hover:text-destructive transition"><X size={16} /></button>
          </div>
        )}

        {error === "offline" && (
          <div className="mx-2 px-5 py-4 rounded-2xl bg-muted/60 border border-border/60 text-center">
            <WifiOff size={20} className="text-muted-foreground mx-auto mb-2" />
            <p className="font-serif text-sm text-foreground mb-1">No connection</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              An internet connection is needed to speak with Gita AI. Your messages are safely stored locally.
            </p>
            <button type="button" onClick={clearError} className="mt-3 text-xs text-primary font-medium">Dismiss</button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/40 bg-card/80 backdrop-blur-xl px-4 py-3 pb-safe">
        <div className="flex items-end gap-3 max-w-md mx-auto">
          <textarea
              aria-label="Message to Gita AI"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the Bhagavad Gita..."
            rows={1}
            disabled={limitReached}
            className="flex-1 resize-none bg-muted/60 border border-border/60 rounded-2xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-32 scroll-hide disabled:opacity-50"
            style={{ overflowY: input.split("\n").length > 3 ? "auto" : "hidden" }}
          />
          <button type="button"
            onClick={handleSend}
            disabled={!input.trim() || sending || limitReached}
            className="size-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-soft active:scale-90 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </ScreenWrapper>
  );
}

/* Loading placeholder (skeleton state demo) */
export function LoadingDemo() {
  const { selectedLanguage } = useUserProgress();
  return (
    <ScreenWrapper>
      <Header title={t("loadingTitle", selectedLanguage)} />
      <div className="px-5 space-y-3">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </ScreenWrapper>
  );
}
