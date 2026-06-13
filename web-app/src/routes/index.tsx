import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BookOpen, Sparkles, Sunrise, Languages, Bookmark, MessageCircle,
  Menu, X, Moon, Sun, Send, Heart, Quote, Mail, Play, Share2, Clock, Headphones,
  Twitter, Instagram, Youtube, Facebook, ChevronRight, Flame, BookText,
} from "lucide-react";
import {
  PLACEHOLDER_IMG, chapters, verses, wisdomCards,
  testimonials, paths, articles, features,
} from "@/lib/gita-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GitaSadhana — Ancient Wisdom for Modern Life" },
      { name: "description", content: "Study the Bhagavad Gita with guided chapters, verses, daily reflections, and an AI spiritual guide." },
      { property: "og:title", content: "GitaSadhana — Ancient Wisdom for Modern Life" },
      { property: "og:description", content: "A premium platform to study, reflect on, and live the teachings of the Bhagavad Gita." },
      { property: "og:image", content: PLACEHOLDER_IMG },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

const featureIcons = [BookOpen, Bookmark, Sparkles, Sunrise, Languages, MessageCircle];

function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`ornament-divider ${className}`}>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold" />
      <span aria-hidden className="text-lg">۞</span>
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold" />
    </div>
  );
}

function Nav({ dark, setDark }: { dark: boolean; setDark: (d: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [
    { href: "#chapters", label: "Chapters" },
    { href: "#verses", label: "Verses" },
    { href: "#ai-guide", label: "AI Guide" },
    { href: "#paths", label: "Learning" },
    { href: "#blog", label: "Insights" },
  ];
  const onHero = !scrolled;
  return (
    <header className={`sticky top-0 z-50 transition-all ${scrolled ? "bg-background/85 backdrop-blur-md border-b border-border" : "bg-transparent"}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <a href="#" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full gita-gradient text-primary-foreground shadow-sm">
            <Flame className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <span className={`font-display text-xl font-semibold tracking-tight transition-colors ${onHero ? "text-white drop-shadow" : "text-foreground"}`}>GitaSadhana</span>
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className={`text-sm font-medium transition-colors ${onHero ? "text-white/85 hover:text-white" : "text-muted-foreground hover:text-foreground"}`}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDark(!dark)}
            aria-label="Toggle theme"
            className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${onHero ? "text-white/85 hover:bg-white/10 hover:text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <a href="#chapters" className="hidden rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 md:inline-block">
            Start Reading
          </a>
          <button onClick={() => setOpen(!open)} className={`grid h-9 w-9 place-items-center rounded-full md:hidden ${onHero ? "text-white" : "text-foreground"}`} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border bg-background/95 backdrop-blur md:hidden">
          <div className="flex flex-col px-5 py-4">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-2.5 text-sm font-medium text-foreground">
                {l.label}
              </a>
            ))}
            <a href="#chapters" onClick={() => setOpen(false)} className="mt-2 rounded-full bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground">
              Start Reading
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative">
      {/* Full-bleed cinematic hero */}
      <div className="relative -mt-[73px] min-h-[100svh] w-full overflow-hidden">
        <img
          src={PLACEHOLDER_IMG}
          alt="Krishna and Arjuna on the battlefield of Kurukshetra"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Multi-stop overlay for legibility */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-background" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.35)_75%)]" />

        <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-5 pt-24 pb-28 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            18 Chapters · 700+ Verses · Timeless Wisdom
          </div>
          <h1 className="font-display text-5xl leading-[1.05] tracking-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.4)] sm:text-6xl md:text-7xl lg:text-[5.25rem]">
            Ancient Wisdom
            <br />
            for <span className="italic text-gold">Modern Life</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            Explore the timeless teachings of the Bhagavad Gita through guided study,
            daily reflections, and AI-powered spiritual insights.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <a href="#chapters" className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-xl shadow-black/30 transition-transform hover:scale-[1.02]">
              Start Reading
            </a>
            <a href="#chapters" className="inline-flex items-center gap-2 rounded-full bg-white/95 px-7 py-3.5 text-sm font-semibold text-foreground shadow-xl shadow-black/20 transition-transform hover:scale-[1.02]">
              <Play className="h-3.5 w-3.5 fill-current text-saffron" /> Audio Gita
            </a>
          </div>

          <a
            href="#verse-of-day"
            aria-label="Scroll to Verse of the Day"
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gold/90 transition-transform hover:translate-y-0.5"
          >
            <ChevronRight className="h-6 w-6 rotate-90" />
          </a>
        </div>
      </div>

      {/* Verse of the Day */}
      <div id="verse-of-day" className="mx-auto -mt-20 max-w-3xl px-5 pb-20 md:pb-28">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card pl-5 pr-6 py-8 text-center shadow-xl shadow-saffron/5">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-gold to-saffron" />
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-saffron">Verse of the Day</p>
          <p className="mt-3 text-sm font-medium text-muted-foreground">Chapter 7 · Verse 9</p>
          <p className="mt-4 font-sanskrit text-xl leading-relaxed text-foreground sm:text-2xl">
            पुण्यो गन्धः पृथिव्यां च तेजश्चास्मि विभावसौ।
          </p>
          <p className="mt-2 font-sanskrit text-xl leading-relaxed text-foreground sm:text-2xl">
            जीवनं सर्वभूतेषु तपश्चास्मि तपस्विषु॥
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm italic text-muted-foreground">
            "I am the sweet fragrance of the earth and the radiance in fire; the life of all beings and the austerity of ascetics."
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <a href="#verses" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              Read Full Verse
            </a>
            <button aria-label="Share" className="grid h-8 w-8 place-items-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              <Share2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-saffron">{kicker}</div>
      <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground sm:text-5xl">{title}</h2>
      {sub && <p className="mt-4 text-base leading-relaxed text-muted-foreground">{sub}</p>}
      <Ornament className="mt-6" />
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-5 py-20 md:py-28">
      <SectionHeading
        kicker="What you'll find"
        title="A complete study companion"
        sub="Every tool you need to engage deeply with the Gita — from original Sanskrit to modern reflection."
      />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => {
          const Icon = featureIcons[i];
          return (
            <div key={f.title} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:border-saffron/40 hover:shadow-xl hover:shadow-saffron/5">
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-saffron/10 text-saffron transition-colors group-hover:bg-saffron group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Chapters() {
  return (
    <section id="chapters" className="bg-secondary/40 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeading
          kicker="18 Chapters"
          title="The Bhagavad Gita"
          sub="Each chapter unfolds a distinct path — read summaries, dive into verses, and walk the teaching at your own pace."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {chapters.map((c) => (
            <article key={c.n} className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-saffron/40 hover:shadow-xl">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={PLACEHOLDER_IMG}
                  alt={`Chapter ${c.n} — ${c.en}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <button
                  aria-label={`Play chapter ${c.n}`}
                  className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-background/90 text-saffron shadow-lg backdrop-blur transition-transform hover:scale-110"
                >
                  <Play className="h-4 w-4 fill-current" />
                </button>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-saffron">Chapter {c.n}</p>
                <h3 className="mt-2 font-display text-xl font-semibold leading-tight text-foreground">{c.en}</h3>
                <p className="mt-1 font-sanskrit text-sm text-muted-foreground">{c.sa}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><BookText className="h-3.5 w-3.5 text-saffron" /> {c.verses} verses</span>
                  <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-saffron" /> {c.read} min read</span>
                  <span className="inline-flex items-center gap-1.5"><Headphones className="h-3.5 w-3.5 text-saffron" /> {c.listen} min listen</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Verses() {
  return (
    <section id="verses" className="mx-auto max-w-7xl px-5 py-20 md:py-28">
      <SectionHeading kicker="Featured Verses" title="Wisdom worth carrying" sub="Six verses to read slowly, sit with, and return to often." />
      <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {verses.map((v) => (
          <div key={v.ref} className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-lg">
            <Quote className="absolute right-5 top-5 h-8 w-8 text-gold/30" />
            <span className="text-xs font-semibold uppercase tracking-wider text-saffron">Verse {v.ref}</span>
            <p className="mt-4 font-sanskrit text-lg leading-snug text-foreground">{v.sa}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">"{v.en}"</p>
            <div className="mt-5 border-t border-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reflection</p>
              <p className="mt-1 text-sm italic text-foreground/80">{v.reflection}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AIGuide() {
  return (
    <section id="ai-guide" className="relative overflow-hidden py-20 md:py-28">
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-br from-saffron/5 via-background to-gold/5" />
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-2 md:items-center md:gap-16">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-saffron">AI Gita Guide</div>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
            A thoughtful guide, <span className="italic text-gradient-gold">always present</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Ask questions about life, work, and meaning. Receive grounded responses drawn from the
            Gita's verses and commentaries — gentle, considered, and never rushed.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              "Ask questions about life challenges",
              "Understand verses in simple, modern language",
              "Explore philosophical concepts at your pace",
              "Receive daily wisdom and gentle guidance",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-1 grid h-5 w-5 place-items-center rounded-full bg-saffron/15 text-saffron">
                  <Sparkles className="h-3 w-3" />
                </span>
                <span className="text-sm text-foreground">{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div aria-hidden className="absolute -inset-4 -z-10 rounded-3xl gita-gradient opacity-15 blur-2xl" />
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
            <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-5 py-4">
              <span className="grid h-9 w-9 place-items-center rounded-full gita-gradient text-primary-foreground">
                <Flame className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Gita Guide</p>
                <p className="text-xs text-muted-foreground">Reflective · grounded in scripture</p>
              </div>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-saffron/10 px-2.5 py-1 text-xs font-medium text-saffron">
                <span className="h-1.5 w-1.5 rounded-full bg-saffron" /> Online
              </span>
            </div>
            <div className="space-y-4 p-5">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm text-primary-foreground">
                I feel anxious about an outcome at work. What does the Gita say?
              </div>
              <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-muted px-4 py-3 text-sm text-foreground">
                In <span className="font-medium">Chapter 2, Verse 47</span>, Krishna teaches:
                you have a right to your effort, but never to its fruits. Try shifting your attention
                from <em>what may happen</em> to <em>how you wish to act</em>. Anxiety often softens
                when we return to sincere, present action.
              </div>
              <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm text-primary-foreground">
                That's helpful. How do I practice this daily?
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-4 py-3 text-sm text-foreground">
                Begin each task with a small intention: <em>"I offer this work."</em> At the end, release
                the result. With practice, equanimity becomes natural.
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-border bg-background p-3">
              <input
                disabled
                placeholder="Ask the Gita Guide…"
                className="flex-1 rounded-full bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DailyWisdom() {
  return (
    <section className="bg-secondary/40 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeading kicker="Daily Wisdom" title="A teaching for every day" sub="Short reflections drawn from the Gita's most enduring themes." />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {wisdomCards.map((w) => (
            <div key={w.theme} className="rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center gap-2 text-saffron">
                <Heart className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">{w.theme}</span>
              </div>
              <p className="mt-4 font-display text-xl leading-snug text-foreground">"{w.line}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 md:py-28">
      <SectionHeading kicker="Voices" title="Loved by seekers worldwide" />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {testimonials.map((t) => (
          <figure key={t.name} className="rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
            <blockquote className="text-sm leading-relaxed text-foreground">"{t.quote}"</blockquote>
            <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
              <img src={PLACEHOLDER_IMG} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">{t.name}</div>
                <div className="truncate text-xs text-muted-foreground">{t.role}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Paths() {
  return (
    <section id="paths" className="bg-secondary/40 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeading kicker="Learning Paths" title="Walk a structured path" sub="Curated tracks for every kind of seeker — from gentle beginnings to dedicated practice." />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {paths.map((p) => (
            <div key={p.name} className="flex flex-col rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-lg">
              <h3 className="font-display text-xl font-semibold text-foreground">{p.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
              <div className="mt-5">
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                  <span>{p.lessons} lessons</span>
                  <span>{p.progress}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full gita-gradient" style={{ width: `${p.progress}%` }} />
                </div>
              </div>
              <a href="#" className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-saffron">
                Continue <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const items: [string, string][] = [
    ["700+", "Verses"],
    ["18", "Chapters"],
    ["1,000+", "Study Notes"],
    ["50,000+", "Community Learners"],
  ];
  return (
    <section className="mx-auto max-w-7xl px-5 py-20">
      <div className="rounded-3xl border border-border bg-gradient-to-br from-saffron/8 via-card to-gold/8 px-6 py-12 md:px-12 md:py-16">
        <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
          {items.map(([n, l]) => (
            <div key={l}>
              <div className="font-display text-5xl font-semibold text-gradient-gold">{n}</div>
              <div className="mt-2 text-sm uppercase tracking-widest text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Blog() {
  return (
    <section id="blog" className="mx-auto max-w-7xl px-5 py-20 md:py-28">
      <SectionHeading kicker="Insights" title="Reflections & essays" sub="Slow writing on dharma, devotion, and applying the Gita to modern living." />
      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <article key={a.title} className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="aspect-[16/10] overflow-hidden">
              <img src={PLACEHOLDER_IMG} alt={a.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="p-6">
              <span className="inline-block rounded-full bg-saffron/10 px-2.5 py-1 text-xs font-medium text-saffron">{a.tag}</span>
              <h3 className="mt-3 font-display text-xl font-semibold text-foreground">{a.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.excerpt}</p>
              <a href="#" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors group-hover:text-saffron">
                Read more <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 md:pb-28">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 md:p-14">
        <div aria-hidden className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-saffron/15 blur-3xl" />
        <div aria-hidden className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
        <div className="relative mx-auto max-w-xl text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-saffron/10 text-saffron">
            <Mail className="h-5 w-5" />
          </div>
          <h2 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
            Receive Daily Gita Wisdom
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            A single verse, a short reflection — delivered each morning to begin your day with intention.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); if (email) setDone(true); }}
            className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center"
          >
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="min-w-0 rounded-full border border-border bg-background px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-saffron focus:outline-none sm:w-72"
            />
            <button type="submit" className="shrink-0 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
              {done ? "Subscribed ✓" : "Subscribe"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const groups = [
    { title: "Explore", links: ["About", "Chapters", "Verses", "AI Guide"] },
    { title: "Learn", links: ["Learning Paths", "Daily Wisdom", "Blog", "Glossary"] },
    { title: "Connect", links: ["Contact", "Community", "Newsletter", "Support"] },
  ];
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <a href="#" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full gita-gradient text-primary-foreground">
                <Flame className="h-4 w-4" />
              </span>
              <span className="font-display text-xl font-semibold">GitaSadhana</span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A modern home for an ancient scripture. Study, reflect on, and live the timeless
              teachings of the Bhagavad Gita.
            </p>
            <div className="mt-5 flex gap-2">
              {[Twitter, Instagram, Youtube, Facebook].map((Icon, i) => (
                <a key={i} href="#" aria-label="Social" className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-saffron hover:text-primary-foreground hover:border-saffron">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {groups.map((g) => (
            <div key={g.title}>
              <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">{g.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {g.links.map((l) => (
                  <li key={l}><a href="#" className="text-sm text-muted-foreground transition-colors hover:text-saffron">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} GitaSadhana. With reverence and care.</p>
          <p className="font-sanskrit text-sm text-muted-foreground">ॐ शान्तिः शान्तिः शान्तिः</p>
        </div>
      </div>
    </footer>
  );
}

function HomePage() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Nav dark={dark} setDark={setDark} />
      <main>
        <Hero />
        <Features />
        <Chapters />
        <Verses />
        <AIGuide />
        <DailyWisdom />
        <Testimonials />
        <Paths />
        <Stats />
        <Blog />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
