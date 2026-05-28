import { ReactNode, ButtonHTMLAttributes } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Home, BookOpen, Sparkles, Bookmark, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScreenWrapper({ children, className, pad = true }: { children: ReactNode; className?: string; pad?: boolean }) {
  return (
    <div className={cn("min-h-dvh bg-gradient-warm", className)}>
      <div className={cn("mx-auto max-w-md min-h-dvh flex flex-col", pad && "pt-safe")}>{children}</div>
    </div>
  );
}

export function Header({ title, back = true, right, subtitle }: { title?: string; back?: boolean; right?: ReactNode; subtitle?: string }) {
  const nav = useNavigate();
  return (
    <header className="flex items-center gap-3 px-5 pt-4 pb-3">
      {back && (
        <button
          onClick={() => nav(-1)}
          className="h-10 w-10 rounded-full bg-card/70 backdrop-blur shadow-card flex items-center justify-center text-foreground/70 hover:text-foreground transition"
          aria-label="Back"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      <div className="flex-1 min-w-0">
        {title && <h1 className="font-serif text-xl text-foreground leading-tight truncate">{title}</h1>}
        {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}

export function AppCard({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={cn("rounded-2xl bg-card shadow-card border border-border/40 p-4", onClick && "cursor-pointer active:scale-[0.99] transition-transform", className)}>
      {children}
    </div>
  );
}

export function PrimaryButton({ children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      {...props}
      className={cn(
        "w-full h-12 rounded-full bg-gradient-gold text-primary-foreground font-medium tracking-wide shadow-soft active:scale-[0.98] transition disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      {...props}
      className={cn(
        "w-full h-12 rounded-full bg-card border border-border text-foreground font-medium active:scale-[0.98] transition",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function IconButton({ children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      {...props}
      className={cn("h-10 w-10 rounded-full bg-card/70 backdrop-blur shadow-card flex items-center justify-center text-foreground/70 hover:text-foreground transition", className)}
    >
      {children}
    </button>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div className="h-full bg-gradient-gold transition-all" style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
    </div>
  );
}

export function ImageBanner({ src, alt, className, children }: { src: string; alt: string; className?: string; children?: ReactNode }) {
  return (
    <div className={cn("relative overflow-hidden rounded-3xl shadow-soft", className)}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
      {children && <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">{children}</div>}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 mt-6 mb-3">
      <h2 className="font-serif text-lg text-foreground">{children}</h2>
      {action}
    </div>
  );
}

const tabs = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/chapters", label: "Chapters", icon: BookOpen },
  { to: "/wisdom", label: "Wisdom", icon: Sparkles },
  { to: "/bookmarks", label: "Saved", icon: Bookmark },
  { to: "/profile", label: "Profile", icon: User },
];

export function BottomTabs() {
  const { pathname } = useLocation();
  return (
    <nav className="sticky bottom-0 mt-auto bg-card/85 backdrop-blur-xl border-t border-border/60 pb-safe">
      <div className="grid grid-cols-5 px-2 pt-2">
        {tabs.map((t) => {
          const active = pathname.startsWith(t.to);
          const Icon = t.icon;
          return (
            <Link key={t.to} to={t.to} className="flex flex-col items-center gap-1 py-1.5 text-[10px]">
              <span className={cn("h-9 w-9 rounded-full flex items-center justify-center transition", active ? "bg-gradient-gold text-primary-foreground shadow-soft" : "text-muted-foreground")}>
                <Icon size={18} strokeWidth={active ? 2.4 : 1.8} />
              </span>
              <span className={cn(active ? "text-foreground font-medium" : "text-muted-foreground")}>{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function ChapterCard({ id, title, subtitle, verses, progress, onClick }: { id: number; title: string; subtitle: string; verses: number; progress: number; onClick?: () => void }) {
  return (
    <AppCard onClick={onClick} className="flex items-center gap-4">
      <div className="h-14 w-14 rounded-2xl bg-gradient-dawn flex items-center justify-center font-serif text-lg text-foreground/80 shadow-card shrink-0">
        {id.toString().padStart(2, "0")}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-serif text-base text-foreground truncate">{title}</h3>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        <div className="mt-2 flex items-center gap-2">
          <ProgressBar value={progress} />
          <span className="text-[10px] text-muted-foreground shrink-0">{verses} verses</span>
        </div>
      </div>
    </AppCard>
  );
}

export function VerseCard({ number, sanskrit, translation, onClick }: { number: string | number; sanskrit: string; translation: string; onClick?: () => void }) {
  return (
    <AppCard onClick={onClick} className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-primary font-medium">Verse {number}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <p className="font-devanagari text-base text-foreground leading-relaxed whitespace-pre-line">{sanskrit}</p>
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{translation}</p>
    </AppCard>
  );
}

export function EmptyState({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-16">
      <div className="h-20 w-20 rounded-full bg-gradient-dawn flex items-center justify-center text-primary mb-5 shadow-card">{icon}</div>
      <h3 className="font-serif text-xl text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-xs">{body}</p>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-muted/70", className)} />;
}
