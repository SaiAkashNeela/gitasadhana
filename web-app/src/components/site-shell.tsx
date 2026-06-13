import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Apple, ChevronRight, Languages, LogOut, Pause, Play, Sparkles } from "lucide-react";
import type { AuthSession } from "../lib/backend";
import type { AppRoute } from "../lib/hash-route";
import { languageOptions, type LanguageCode } from "../lib/gita-data";
import { t } from "../lib/mobile-i18n";
import { cn } from "../lib/utils";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[30px] border border-black/5 bg-[rgba(255,251,244,0.92)] shadow-[0_16px_50px_-34px_rgba(86,58,24,0.45)] backdrop-blur-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
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
        {sub && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">{sub}</p>
        )}
      </div>
      {action}
    </div>
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

export function AudioBar({
  src,
  title,
  language,
}: {
  src: string;
  title: string;
  language: LanguageCode;
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
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
            {t("audioRecitation", language)}
          </p>
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

export function TopNav({
  route,
  signedInUser,
  googleButtonRef,
  language,
  appStoreUrl,
  playStoreUrl,
  onLanguageChange,
  onSignOut,
  onNavigate,
}: {
  route: AppRoute;
  signedInUser: AuthSession["user"] | null;
  googleButtonRef: RefObject<HTMLDivElement | null>;
  language: LanguageCode;
  appStoreUrl?: string;
  playStoreUrl?: string;
  onLanguageChange: (language: LanguageCode) => void;
  onSignOut: () => void;
  onNavigate: (route: AppRoute) => void;
}) {
  const navItem = (view: AppRoute["view"], label: string) => {
    const active = route.view === view;
    return (
      <button
        type="button"
        onClick={() => onNavigate({ view } as AppRoute)}
        className={cn(
          "rounded-full px-3 py-2 transition",
          active
            ? "bg-white text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {label}
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[rgba(250,244,233,0.8)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 md:px-6">
        <button
          type="button"
          onClick={() => onNavigate({ view: "home" })}
          className="flex items-center gap-3"
        >
          <div className="size-11 overflow-hidden rounded-2xl border border-amber-200/60 shadow-lg shadow-amber-900/10">
            <img src="/favicon-logo.png" alt="GitaSadhana" className="h-full w-full object-cover" />
          </div>
          <div className="text-left">
            <p className="font-serif text-xl text-foreground">GitaSadhana</p>
            <p className="text-xs text-muted-foreground">{t("webHomeTagline", language)}</p>
          </div>
        </button>
        <nav className="hidden items-center gap-2 text-sm md:flex">
          {navItem("home", t("home", language))}
          {navItem("chapters", t("chapters", language))}
          {navItem("study", t("wisdom", language))}
          {navItem("ai", t("gitaAi", language))}
        </nav>
        <div className="flex items-center gap-3">
          <StoreBadges appStoreUrl={appStoreUrl} playStoreUrl={playStoreUrl} compact />
          <label className="flex items-center gap-2 rounded-full border border-black/8 bg-white/80 px-3 py-2 text-sm text-muted-foreground">
            <Languages size={16} className="text-amber-700" />
            <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              {t("language", language)}
            </span>
            <select
              value={language}
              onChange={(event) => onLanguageChange(event.target.value as LanguageCode)}
              className="w-[132px] bg-transparent text-sm text-foreground outline-none"
            >
              {languageOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
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
                <span className="hidden sm:inline">{t("signOut", language)}</span>
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

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href ? (
              <a href={item.href} className="transition hover:text-foreground">
                {item.label}
              </a>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
            {index < items.length - 1 && <span aria-hidden="true">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function StoreBadges({
  appStoreUrl,
  playStoreUrl,
  compact = false,
}: {
  appStoreUrl?: string;
  playStoreUrl?: string;
  compact?: boolean;
}) {
  const badgeClassName = compact
    ? "inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-3 py-2 text-[11px] font-medium text-foreground transition hover:bg-white/90"
    : "inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-white";

  const playBadge = (
    <a
      href={playStoreUrl || undefined}
      target={playStoreUrl ? "_blank" : undefined}
      rel={playStoreUrl ? "noreferrer" : undefined}
      aria-disabled={!playStoreUrl}
      className={cn(
        badgeClassName,
        !playStoreUrl && "pointer-events-none cursor-not-allowed opacity-50",
      )}
    >
      <Play size={compact ? 13 : 15} />
      <span>Google Play</span>
    </a>
  );

  const appBadge = (
    <a
      href={appStoreUrl || undefined}
      target={appStoreUrl ? "_blank" : undefined}
      rel={appStoreUrl ? "noreferrer" : undefined}
      aria-disabled={!appStoreUrl}
      className={cn(
        badgeClassName,
        !appStoreUrl && "pointer-events-none cursor-not-allowed opacity-50",
      )}
    >
      <Apple size={compact ? 13 : 15} />
      <span>App Store</span>
    </a>
  );

  return (
    <div className="hidden items-center gap-2 lg:flex">
      {playBadge}
      {appBadge}
    </div>
  );
}

export function SectionShellLink({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/80 px-5 py-3 text-sm font-medium text-foreground transition hover:bg-white"
    >
      {icon}
      {label}
    </button>
  );
}

export function FeatureTiles({
  tiles,
}: {
  tiles: Array<{ value: string; label: string; icon: ReactNode }>;
}) {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-3">
      {tiles.map((tile) => (
        <Card key={tile.label} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-serif text-3xl text-foreground">{tile.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{tile.label}</p>
            </div>
            {tile.icon}
          </div>
        </Card>
      ))}
    </div>
  );
}

export function VerseListItem({
  title,
  text,
  active,
  onClick,
}: {
  title: string;
  text: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-[24px] border p-4 text-left transition",
        active
          ? "border-amber-300 bg-amber-50 shadow-lg shadow-amber-900/10"
          : "border-black/5 bg-white/90 hover:border-amber-200",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-700">{title}</p>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground">{text}</p>
        </div>
        <ChevronRight size={16} className="text-muted-foreground" />
      </div>
    </button>
  );
}

export function PulseCaption({ language }: { language: LanguageCode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs uppercase tracking-[0.32em] text-amber-800">
      <Sparkles size={14} />
    </div>
  );
}

export function PageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-8">{children}</main>
    </div>
  );
}

export function ImageCard({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return <img src={src} alt={alt} className={cn("h-full w-full object-cover", className)} />;
}
