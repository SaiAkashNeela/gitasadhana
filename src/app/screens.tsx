import { useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Flower2, Bell, Search, Play, Pause, Bookmark, BookmarkCheck, Heart, Share2,
  ChevronRight, Sparkles, BookOpen, Headphones, Clock, Download, Settings as SettingsIcon,
  Flame, Moon, Sun, Languages, ChevronLeft, SkipBack, SkipForward, Plus, Trash2,
  FileText, History as HistoryIcon, CheckCircle2, Circle, Volume2, LogOut,
} from "lucide-react";
import {
  ScreenWrapper, Header, AppCard, PrimaryButton, GhostButton, IconButton, ProgressBar,
  ImageBanner, SectionTitle, BottomTabs, ChapterCard, VerseCard, EmptyState, Skeleton,
} from "@/app/components/ui";
import {
  DEMO_IMG, chapters, sampleVerses, wisdomQuotes, wisdomThemes, languages,
  bookmarks as demoBookmarks, notes as demoNotes, history as demoHistory, downloads as demoDownloads, profile,
} from "@/app/data";
import { cn } from "@/lib/utils";

/* ───────────────────────── 1. Welcome ───────────────────────── */
export function Welcome() {
  return (
    <ScreenWrapper className="bg-gradient-dawn">
      <div className="flex-1 flex flex-col px-6 pt-10">
        <div className="flex items-center gap-2 text-primary">
          <Flower2 size={22} />
          <span className="font-serif text-lg tracking-wide">Easy Gita</span>
        </div>
        <div className="mt-10">
          <ImageBanner src={DEMO_IMG} alt="Bhagavad Gita" className="aspect-[4/5]">
            <p className="font-serif text-3xl leading-tight text-balance">The eternal song, made simple.</p>
          </ImageBanner>
        </div>
        <div className="mt-8">
          <h1 className="font-serif text-4xl leading-tight text-foreground text-balance">
            Welcome to a quieter way to read the Gita.
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Verse by verse. Word by word. A daily practice in your pocket.
          </p>
        </div>
        <div className="mt-auto pt-8 pb-8 space-y-3">
          <Link to="/onboarding/2"><PrimaryButton>Begin Journey</PrimaryButton></Link>
          <Link to="/language" className="block"><GhostButton>Choose Language</GhostButton></Link>
        </div>
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 2 & 3. Onboarding slides ───────────── */
const slides = [
  { img: DEMO_IMG, title: "Read with calm focus", body: "Sanskrit, transliteration, translation and commentary — beautifully laid out." },
  { img: DEMO_IMG, title: "Listen, reflect, return", body: "Audio recitations, personal notes and daily streaks to keep you steady." },
];
export function Onboarding() {
  const { step } = useParams();
  const i = Math.max(0, Math.min(slides.length - 1, parseInt(step ?? "1") - 2));
  const s = slides[i];
  const next = i === slides.length - 1 ? "/language" : `/onboarding/${i + 3}`;
  return (
    <ScreenWrapper className="bg-gradient-dawn">
      <div className="flex-1 flex flex-col px-6 pt-6">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-sm text-muted-foreground">Back</Link>
          <Link to="/language" className="text-sm text-primary font-medium">Skip</Link>
        </div>
        <div className="mt-8">
          <ImageBanner src={s.img} alt={s.title} className="aspect-square" />
        </div>
        <div className="mt-8">
          <h2 className="font-serif text-3xl text-foreground text-balance">{s.title}</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">{s.body}</p>
        </div>
        <div className="mt-6 flex justify-center gap-2">
          {slides.map((_, idx) => (
            <span key={idx} className={cn("h-1.5 rounded-full transition-all", idx === i ? "w-6 bg-primary" : "w-1.5 bg-border")} />
          ))}
        </div>
        <div className="mt-auto pt-8 pb-8">
          <Link to={next}><PrimaryButton>{i === slides.length - 1 ? "Continue" : "Next"}</PrimaryButton></Link>
        </div>
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 4. Language Selection ───────────── */
export function LanguageSelect() {
  const [picked, setPicked] = useState("en");
  return (
    <ScreenWrapper>
      <Header title="Choose your language" subtitle="You can change this anytime in Settings" />
      <div className="px-5 flex-1 overflow-y-auto space-y-2 pb-4">
        {languages.map((l) => {
          const active = picked === l.code;
          return (
            <AppCard key={l.code} onClick={() => setPicked(l.code)} className={cn("flex items-center justify-between", active && "border-primary/50 ring-1 ring-primary/30")}>
              <div>
                <p className="font-serif text-lg text-foreground">{l.native}</p>
                <p className="text-xs text-muted-foreground">{l.name}</p>
              </div>
              {active ? <CheckCircle2 className="text-primary" size={22} /> : <Circle className="text-muted-foreground/40" size={22} />}
            </AppCard>
          );
        })}
      </div>
      <div className="px-5 pb-6 pt-2">
        <Link to="/home"><PrimaryButton>Continue</PrimaryButton></Link>
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 5. Home ───────────── */
export function HomeScreen() {
  const nav = useNavigate();
  return (
    <ScreenWrapper>
      <div className="px-5 pt-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Hari Om, Aarav</p>
          <h1 className="font-serif text-2xl text-foreground">Today's Verse</h1>
        </div>
        <div className="flex gap-2">
          <IconButton onClick={() => nav("/search")}><Search size={18} /></IconButton>
          <IconButton onClick={() => nav("/reminders")}><Bell size={18} /></IconButton>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        <div className="px-5 mt-5">
          <div onClick={() => nav("/verse/2.47")} className="cursor-pointer">
            <ImageBanner src={DEMO_IMG} alt="Verse of the day" className="aspect-[5/6]">
              <span className="text-[10px] uppercase tracking-widest opacity-80">Verse of the day</span>
              <p className="mt-2 font-serif text-2xl leading-snug text-balance">"You have the right to action, never to its fruits."</p>
              <p className="mt-3 text-xs opacity-80">Bhagavad Gita 2.47</p>
            </ImageBanner>
          </div>
        </div>

        <SectionTitle action={<Link to="/journey" className="text-xs text-primary font-medium">View</Link>}>Your Journey</SectionTitle>
        <div className="px-5">
          <AppCard className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground shadow-soft">
              <Flame size={22} />
            </div>
            <div className="flex-1">
              <p className="font-serif text-lg text-foreground">{profile.streak} day streak</p>
              <p className="text-xs text-muted-foreground">{profile.versesRead} verses · {profile.minutes} min</p>
            </div>
            <ChevronRight className="text-muted-foreground" />
          </AppCard>
        </div>

        <SectionTitle action={<Link to="/chapters" className="text-xs text-primary font-medium">All</Link>}>Continue Reading</SectionTitle>
        <div className="px-5 space-y-3">
          {chapters.slice(0, 2).map((c) => (
            <ChapterCard key={c.id} {...c} onClick={() => nav(`/chapter/${c.id}`)} />
          ))}
        </div>

        <SectionTitle action={<Link to="/wisdom" className="text-xs text-primary font-medium">Explore</Link>}>Wisdom for Today</SectionTitle>
        <div className="px-5">
          <AppCard className="bg-gradient-dawn border-0">
            <Sparkles className="text-primary mb-2" size={18} />
            <p className="font-serif text-base text-foreground leading-relaxed">{wisdomQuotes[0].text}</p>
            <p className="mt-2 text-xs text-muted-foreground">{wisdomQuotes[0].ref}</p>
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
  return (
    <ScreenWrapper>
      <Header title="Chapters" subtitle="18 chapters · 700 verses" back={false} />
      <div className="px-5 flex-1 overflow-y-auto space-y-3 pb-4">
        {chapters.map((c) => (
          <ChapterCard key={c.id} {...c} onClick={() => nav(`/chapter/${c.id}`)} />
        ))}
      </div>
      <BottomTabs />
    </ScreenWrapper>
  );
}

/* ───────────── 7. Chapter Detail ───────────── */
export function ChapterDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const chapter = chapters.find((c) => c.id === Number(id)) ?? chapters[0];
  return (
    <ScreenWrapper>
      <Header right={<IconButton><Share2 size={18} /></IconButton>} />
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="px-5">
          <ImageBanner src={DEMO_IMG} alt={chapter.title} className="aspect-[5/3]">
            <span className="text-[10px] uppercase tracking-widest opacity-80">Chapter {chapter.id}</span>
            <p className="font-serif text-2xl mt-1">{chapter.title}</p>
            <p className="text-xs opacity-80">{chapter.subtitle}</p>
          </ImageBanner>
        </div>
        <div className="px-5 mt-5 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{chapter.summary}</p>
          <div className="grid grid-cols-3 gap-3">
            <AppCard className="text-center"><p className="font-serif text-2xl text-foreground">{chapter.verses}</p><p className="text-[10px] text-muted-foreground uppercase tracking-widest">Verses</p></AppCard>
            <AppCard className="text-center"><p className="font-serif text-2xl text-foreground">{Math.round(chapter.progress * 100)}%</p><p className="text-[10px] text-muted-foreground uppercase tracking-widest">Read</p></AppCard>
            <AppCard className="text-center"><p className="font-serif text-2xl text-foreground">~{Math.round(chapter.verses * 0.6)}m</p><p className="text-[10px] text-muted-foreground uppercase tracking-widest">Length</p></AppCard>
          </div>
          <PrimaryButton onClick={() => nav(`/verse/${chapter.id}.1`)}>Begin Chapter</PrimaryButton>
          <h3 className="font-serif text-lg pt-2">Verses</h3>
          <div className="space-y-3">
            {sampleVerses.map((v) => (
              <VerseCard key={v.id} number={v.id} sanskrit={v.sanskrit} translation={v.translation} onClick={() => nav(`/verse/${v.id}`)} />
            ))}
          </div>
        </div>
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 8. Verse Reading ───────────── */
export function VerseReading() {
  const { id } = useParams();
  const nav = useNavigate();
  const verse = sampleVerses.find((v) => v.id === id) ?? sampleVerses[0];
  const [saved, setSaved] = useState(false);
  return (
    <ScreenWrapper>
      <Header
        title={`Verse ${verse.id}`}
        subtitle="Bhagavad Gita"
        right={
          <div className="flex gap-2">
            <IconButton onClick={() => setSaved((s) => !s)}>
              {saved ? <BookmarkCheck size={18} className="text-primary" /> : <Bookmark size={18} />}
            </IconButton>
            <IconButton><Share2 size={18} /></IconButton>
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto px-5 pb-32 space-y-5">
        <AppCard className="bg-gradient-dawn border-0">
          <p className="font-devanagari text-2xl leading-loose text-foreground whitespace-pre-line text-center">{verse.sanskrit}</p>
        </AppCard>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-primary mb-2">Transliteration</p>
          <p className="font-serif italic text-foreground leading-relaxed whitespace-pre-line">{verse.transliteration}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-primary mb-2">Translation</p>
          <p className="text-foreground leading-relaxed">{verse.translation}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <GhostButton onClick={() => nav(`/verse/${verse.id}/commentary`)}>Commentary</GhostButton>
          <GhostButton onClick={() => nav(`/verse/${verse.id}/words`)}>Word Meaning</GhostButton>
        </div>
      </div>
      <div className="sticky bottom-0 px-5 pb-safe pt-3 bg-gradient-to-t from-background via-background/95 to-transparent flex items-center justify-between gap-3">
        <IconButton><ChevronLeft size={18} /></IconButton>
        <button onClick={() => nav("/player")} className="flex-1 h-12 rounded-full bg-gradient-gold text-primary-foreground font-medium flex items-center justify-center gap-2 shadow-soft">
          <Play size={18} /> Listen
        </button>
        <IconButton><ChevronRight size={18} /></IconButton>
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 9. Commentary ───────────── */
export function VerseCommentary() {
  const { id } = useParams();
  const verse = sampleVerses.find((v) => v.id === id) ?? sampleVerses[0];
  return (
    <ScreenWrapper>
      <Header title="Commentary" subtitle={`Verse ${verse.id}`} />
      <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-5">
        <AppCard className="bg-gradient-dawn border-0">
          <p className="font-devanagari text-lg text-foreground text-center leading-loose whitespace-pre-line">{verse.sanskrit}</p>
        </AppCard>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-primary mb-2">Reflection</p>
          <p className="font-serif text-lg text-foreground leading-relaxed">{verse.commentary}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-primary mb-2">A deeper look</p>
          <p className="text-foreground leading-relaxed text-sm">
            The verse is an invitation, not a command. To act without attachment is to discover an immense lightness — the work is done well precisely because nothing is demanded of it. Each task becomes an offering, complete in itself.
          </p>
          <p className="text-foreground leading-relaxed text-sm mt-3">
            In daily practice, this means meeting outcomes — pleasant or otherwise — with the same steady gaze. The mind, no longer pulled by hope or fear, settles into a clarity that is itself the fruit.
          </p>
        </div>
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 10. Word Meaning ───────────── */
export function VerseWords() {
  const { id } = useParams();
  const verse = sampleVerses.find((v) => v.id === id) ?? sampleVerses[0];
  return (
    <ScreenWrapper>
      <Header title="Word Meanings" subtitle={`Verse ${verse.id}`} />
      <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-4">
        <AppCard className="bg-gradient-dawn border-0">
          <p className="font-devanagari text-lg text-foreground text-center leading-loose whitespace-pre-line">{verse.sanskrit}</p>
        </AppCard>
        <div className="space-y-2">
          {verse.words.map((w, i) => (
            <AppCard key={i} className="flex items-center justify-between gap-4 py-3">
              <p className="font-serif italic text-foreground">{w.word}</p>
              <p className="text-sm text-muted-foreground text-right">{w.meaning}</p>
            </AppCard>
          ))}
        </div>
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 11. Search ───────────── */
export function SearchScreen() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  return (
    <ScreenWrapper>
      <Header title="Search" />
      <div className="px-5">
        <div className="flex items-center gap-2 rounded-full bg-card border border-border px-4 h-12 shadow-card">
          <Search size={18} className="text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && nav(`/search/results?q=${encodeURIComponent(q)}`)}
            placeholder="Search verses, words, themes…"
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
      </div>
      <div className="px-5 mt-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Suggested</p>
        <div className="flex flex-wrap gap-2">
          {["karma", "atman", "devotion", "fear", "meditation", "duty"].map((t) => (
            <button key={t} onClick={() => nav(`/search/results?q=${t}`)} className="px-4 h-9 rounded-full bg-card border border-border text-sm text-foreground">
              {t}
            </button>
          ))}
        </div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 mt-8">Recent</p>
        <div className="space-y-2">
          {["letting go", "steady mind"].map((t) => (
            <AppCard key={t} onClick={() => nav(`/search/results?q=${t}`)} className="flex items-center justify-between py-3">
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
  const q = new URLSearchParams(loc.search).get("q") ?? "";
  const results = sampleVerses;
  return (
    <ScreenWrapper>
      <Header title={`"${q}"`} subtitle={`${results.length} verses found`} />
      <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-8">
        {results.length === 0 ? (
          <EmptyState icon={<Search size={28} />} title="Nothing yet" body="Try a different word — perhaps a feeling or a theme." />
        ) : (
          results.map((v) => (
            <VerseCard key={v.id} number={v.id} sanskrit={v.sanskrit} translation={v.translation} onClick={() => nav(`/verse/${v.id}`)} />
          ))
        )}
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 13. Wisdom ───────────── */
export function WisdomScreen() {
  const nav = useNavigate();
  return (
    <ScreenWrapper>
      <Header title="Wisdom" back={false} />
      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-4">
        <ImageBanner src={DEMO_IMG} alt="Daily wisdom" className="aspect-[5/3]">
          <span className="text-[10px] uppercase tracking-widest opacity-80">Daily wisdom</span>
          <p className="mt-1 font-serif text-xl leading-snug text-balance">{wisdomQuotes[1].text}</p>
          <p className="mt-2 text-xs opacity-80">{wisdomQuotes[1].ref}</p>
        </ImageBanner>
        <button onClick={() => nav("/wisdom/themes")} className="w-full">
          <AppCard className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-full bg-gradient-dawn flex items-center justify-center text-primary"><Sparkles size={18} /></span>
              <div className="text-left">
                <p className="font-serif text-base">Explore by theme</p>
                <p className="text-xs text-muted-foreground">{wisdomThemes.length} curated themes</p>
              </div>
            </div>
            <ChevronRight className="text-muted-foreground" />
          </AppCard>
        </button>
        <div className="space-y-3">
          {wisdomQuotes.map((w) => (
            <AppCard key={w.id}>
              <p className="font-serif text-base text-foreground leading-relaxed">"{w.text}"</p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{w.ref}</p>
                <div className="flex gap-1">
                  <IconButton><Heart size={16} /></IconButton>
                  <IconButton><Share2 size={16} /></IconButton>
                </div>
              </div>
            </AppCard>
          ))}
        </div>
      </div>
      <BottomTabs />
    </ScreenWrapper>
  );
}

/* ───────────── 14. Wisdom Themes ───────────── */
export function WisdomThemes() {
  const nav = useNavigate();
  return (
    <ScreenWrapper>
      <Header title="Themes" subtitle="Wisdom organised by what you seek" />
      <div className="flex-1 overflow-y-auto px-5 grid grid-cols-2 gap-3 pb-8">
        {wisdomThemes.map((t) => (
          <button key={t.id} onClick={() => nav(`/wisdom/theme/${t.id}`)} className="text-left">
            <AppCard className={cn("aspect-square flex flex-col justify-between bg-gradient-to-br", t.color)}>
              <Sparkles className="text-foreground/70" size={18} />
              <div>
                <p className="font-serif text-lg text-foreground">{t.title}</p>
                <p className="text-xs text-foreground/70">{t.count} verses</p>
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
  const theme = wisdomThemes.find((t) => t.id === id) ?? wisdomThemes[0];
  return (
    <ScreenWrapper>
      <Header title={theme.title} subtitle={`${theme.count} verses`} />
      <div className="px-5 flex-1 overflow-y-auto space-y-3 pb-8">
        <ImageBanner src={DEMO_IMG} alt={theme.title} className="aspect-[5/2]">
          <p className="font-serif text-xl">{theme.title}</p>
        </ImageBanner>
        {sampleVerses.map((v) => (
          <VerseCard key={v.id} number={v.id} sanskrit={v.sanskrit} translation={v.translation} onClick={() => nav(`/verse/${v.id}`)} />
        ))}
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 16. Bookmarks ───────────── */
export function Bookmarks() {
  const nav = useNavigate();
  const [tab, setTab] = useState<"all" | "collections">("all");
  return (
    <ScreenWrapper>
      <Header title="Saved" back={false} right={<IconButton onClick={() => nav("/favorites")}><Heart size={18} /></IconButton>} />
      <div className="px-5">
        <div className="flex gap-1 p-1 rounded-full bg-muted">
          {(["all", "collections"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("flex-1 h-9 rounded-full text-sm capitalize transition", tab === t ? "bg-card shadow-card text-foreground" : "text-muted-foreground")}>
              {t === "all" ? "Verses" : "Collections"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 mt-4 space-y-3 pb-4">
        {tab === "all" ? (
          demoBookmarks.length === 0 ? (
            <EmptyState icon={<Bookmark size={28} />} title="No saved verses yet" body="Tap the bookmark icon on any verse to keep it close." />
          ) : (
            demoBookmarks.map((b) => {
              const v = sampleVerses.find((sv) => sv.id === b.verseId) ?? sampleVerses[0];
              return (
                <AppCard key={b.verseId} onClick={() => nav(`/verse/${b.verseId}`)}>
                  <p className="text-[10px] uppercase tracking-widest text-primary">Verse {b.verseId}</p>
                  <p className="font-serif text-base mt-1 line-clamp-2">{v.translation}</p>
                  {b.note && <p className="text-xs text-muted-foreground mt-2 italic">"{b.note}"</p>}
                </AppCard>
              );
            })
          )
        ) : (
          <button onClick={() => nav("/favorites")} className="w-full">
            <AppCard className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground"><Heart size={18} /></span>
                <div className="text-left">
                  <p className="font-serif text-base">Favorites</p>
                  <p className="text-xs text-muted-foreground">12 verses</p>
                </div>
              </div>
              <ChevronRight className="text-muted-foreground" />
            </AppCard>
          </button>
        )}
      </div>
      <BottomTabs />
    </ScreenWrapper>
  );
}

/* ───────────── 17. Favorites Collections ───────────── */
export function Favorites() {
  const nav = useNavigate();
  const collections = [
    { id: "c1", title: "Morning reflections", count: 7 },
    { id: "c2", title: "On stillness", count: 5 },
    { id: "c3", title: "For difficult days", count: 9 },
  ];
  return (
    <ScreenWrapper>
      <Header title="Collections" right={<IconButton><Plus size={18} /></IconButton>} />
      <div className="px-5 flex-1 overflow-y-auto space-y-3 pb-8">
        {collections.map((c) => (
          <AppCard key={c.id} onClick={() => nav(`/wisdom/theme/${c.id}`)} className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-dawn flex items-center justify-center text-primary shadow-card">
              <Heart size={20} />
            </div>
            <div className="flex-1">
              <p className="font-serif text-base">{c.title}</p>
              <p className="text-xs text-muted-foreground">{c.count} verses</p>
            </div>
            <ChevronRight className="text-muted-foreground" />
          </AppCard>
        ))}
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 18. Notes ───────────── */
export function Notes() {
  const [items, setItems] = useState(demoNotes);
  const [draft, setDraft] = useState("");
  const add = () => {
    if (!draft.trim()) return;
    setItems([{ id: String(Date.now()), verseId: "—", title: "New reflection", body: draft, date: "Just now" }, ...items]);
    setDraft("");
  };
  return (
    <ScreenWrapper>
      <Header title="Notes & Reflections" />
      <div className="px-5">
        <AppCard>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="A thought, a feeling, a question…"
            rows={3}
            className="w-full bg-transparent outline-none text-sm resize-none placeholder:text-muted-foreground"
          />
          <div className="flex justify-end mt-2">
            <button onClick={add} className="px-4 h-9 rounded-full bg-gradient-gold text-primary-foreground text-sm font-medium">Save</button>
          </div>
        </AppCard>
      </div>
      <div className="flex-1 overflow-y-auto px-5 mt-4 space-y-3 pb-8">
        {items.length === 0 ? (
          <EmptyState icon={<FileText size={28} />} title="No reflections yet" body="Write your first thought above — even one line is enough." />
        ) : (
          items.map((n) => (
            <AppCard key={n.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-serif text-base text-foreground">{n.title}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{n.date} · Verse {n.verseId}</p>
                </div>
                <button onClick={() => setItems(items.filter((x) => x.id !== n.id))} className="text-muted-foreground"><Trash2 size={16} /></button>
              </div>
              <p className="text-sm text-foreground mt-2 leading-relaxed">{n.body}</p>
            </AppCard>
          ))
        )}
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 19. Reading History ───────────── */
export function HistoryScreen() {
  const nav = useNavigate();
  return (
    <ScreenWrapper>
      <Header title="Reading History" />
      <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-8">
        {demoHistory.map((h) => (
          <AppCard key={h.id} onClick={() => nav(`/verse/${h.chapter}.${h.verse}`)} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-dawn flex items-center justify-center text-primary text-xs font-medium">
              {h.chapter}.{h.verse}
            </div>
            <div className="flex-1">
              <p className="text-sm text-foreground">Chapter {h.chapter}, verse {h.verse}</p>
              <p className="text-xs text-muted-foreground">{h.date}</p>
            </div>
            <HistoryIcon size={16} className="text-muted-foreground" />
          </AppCard>
        ))}
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 20. Audio Player ───────────── */
export function Player() {
  const nav = useNavigate();
  const [playing, setPlaying] = useState(true);
  return (
    <ScreenWrapper className="bg-gradient-dawn">
      <div className="flex items-center justify-between px-5 pt-4">
        <IconButton onClick={() => nav(-1)}><ChevronLeft size={18} /></IconButton>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Now Playing</p>
        <IconButton><Share2 size={18} /></IconButton>
      </div>
      <div className="flex-1 flex flex-col items-center px-8 pt-8">
        <div className="w-full max-w-xs aspect-square rounded-3xl overflow-hidden shadow-soft">
          <img src={DEMO_IMG} alt="Now playing" className="w-full h-full object-cover" />
        </div>
        <div className="mt-8 text-center">
          <p className="font-serif text-2xl text-foreground">Chapter 2, Verse 47</p>
          <p className="text-sm text-muted-foreground mt-1">Sanskrit recitation · 2:14</p>
        </div>
        <div className="w-full mt-8">
          <ProgressBar value={0.42} />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-2"><span>0:56</span><span>2:14</span></div>
        </div>
        <div className="flex items-center justify-center gap-6 mt-10">
          <IconButton><SkipBack size={20} /></IconButton>
          <button onClick={() => setPlaying((p) => !p)} className="h-16 w-16 rounded-full bg-gradient-gold text-primary-foreground flex items-center justify-center shadow-soft">
            {playing ? <Pause size={26} /> : <Play size={26} />}
          </button>
          <IconButton><SkipForward size={20} /></IconButton>
        </div>
        <div className="flex justify-between w-full mt-8 text-muted-foreground">
          <IconButton><Volume2 size={18} /></IconButton>
          <IconButton><Heart size={18} /></IconButton>
          <IconButton><Bookmark size={18} /></IconButton>
        </div>
      </div>
    </ScreenWrapper>
  );
}

/* Mini player overlay state — appears at bottom of Home */
export function MiniPlayer() {
  const nav = useNavigate();
  const [playing, setPlaying] = useState(true);
  return (
    <div className="sticky bottom-0 mx-3 mb-2 rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-soft px-3 py-2 flex items-center gap-3">
      <img src={DEMO_IMG} alt="" className="h-10 w-10 rounded-xl object-cover" />
      <div className="flex-1 min-w-0" onClick={() => nav("/player")}>
        <p className="text-sm font-medium text-foreground truncate">Chapter 2 · Verse 47</p>
        <p className="text-[10px] text-muted-foreground truncate">Sanskrit recitation</p>
      </div>
      <button onClick={() => setPlaying((p) => !p)} className="h-9 w-9 rounded-full bg-gradient-gold text-primary-foreground flex items-center justify-center">
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>
    </div>
  );
}

/* ───────────── 22. Daily Journey / Streak ───────────── */
export function Journey() {
  const days = Array.from({ length: 14 }, (_, i) => i);
  return (
    <ScreenWrapper>
      <Header title="Your Journey" />
      <div className="flex-1 overflow-y-auto px-5 space-y-4 pb-8">
        <AppCard className="bg-gradient-gold text-primary-foreground border-0 text-center py-6">
          <Flame size={28} className="mx-auto" />
          <p className="font-serif text-4xl mt-2">{profile.streak}</p>
          <p className="text-xs uppercase tracking-widest opacity-90">Day streak</p>
        </AppCard>
        <div className="grid grid-cols-3 gap-3">
          <AppCard className="text-center"><p className="font-serif text-2xl">{profile.versesRead}</p><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Verses</p></AppCard>
          <AppCard className="text-center"><p className="font-serif text-2xl">{profile.minutes}m</p><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Read time</p></AppCard>
          <AppCard className="text-center"><p className="font-serif text-2xl">{profile.bookmarks}</p><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Saved</p></AppCard>
        </div>
        <AppCard>
          <p className="font-serif text-base mb-3">Last 14 days</p>
          <div className="grid grid-cols-7 gap-2">
            {days.map((d) => (
              <div key={d} className={cn("aspect-square rounded-lg flex items-center justify-center text-[10px]", d % 4 === 3 ? "bg-muted text-muted-foreground" : "bg-gradient-gold text-primary-foreground")}>
                {d + 1}
              </div>
            ))}
          </div>
        </AppCard>
        <AppCard>
          <div className="flex items-center gap-3">
            <Bell className="text-primary" size={18} />
            <div className="flex-1">
              <p className="font-serif text-base">Daily reminder</p>
              <p className="text-xs text-muted-foreground">Every morning at 7:00</p>
            </div>
          </div>
        </AppCard>
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 23. Reminders ───────────── */
export function Reminders() {
  const [enabled, setEnabled] = useState(true);
  const times = ["06:00", "07:00", "21:00"];
  const [picked, setPicked] = useState("07:00");
  return (
    <ScreenWrapper>
      <Header title="Daily Reminder" />
      <div className="px-5 flex-1 overflow-y-auto space-y-4 pb-8">
        <AppCard className="flex items-center justify-between">
          <div>
            <p className="font-serif text-base">Gentle reminder</p>
            <p className="text-xs text-muted-foreground">A daily nudge to read one verse</p>
          </div>
          <button onClick={() => setEnabled((e) => !e)} className={cn("w-12 h-7 rounded-full transition relative", enabled ? "bg-gradient-gold" : "bg-muted")}>
            <span className={cn("absolute top-0.5 h-6 w-6 rounded-full bg-card shadow transition", enabled ? "left-5" : "left-0.5")} />
          </button>
        </AppCard>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 mt-2">Time</p>
          <div className="grid grid-cols-3 gap-2">
            {times.map((t) => (
              <button key={t} onClick={() => setPicked(t)} className={cn("h-12 rounded-full border text-sm font-medium transition", picked === t ? "bg-gradient-gold text-primary-foreground border-transparent" : "bg-card border-border text-foreground")}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <AppCard>
          <p className="font-serif text-base mb-3">Days</p>
          <div className="flex justify-between">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <button key={i} className={cn("h-9 w-9 rounded-full text-sm", i > 0 && i < 6 ? "bg-gradient-gold text-primary-foreground" : "bg-muted text-muted-foreground")}>{d}</button>
            ))}
          </div>
        </AppCard>
        <PrimaryButton>Save reminder</PrimaryButton>
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 24. Downloads ───────────── */
export function Downloads() {
  return (
    <ScreenWrapper>
      <Header title="Offline Library" subtitle="Read & listen without a connection" />
      <div className="px-5 flex-1 overflow-y-auto space-y-3 pb-8">
        {demoDownloads.length === 0 ? (
          <EmptyState icon={<Download size={28} />} title="Nothing downloaded yet" body="Save chapters and recitations for moments without signal." />
        ) : (
          demoDownloads.map((d) => (
            <AppCard key={d.id} className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-dawn flex items-center justify-center text-primary"><Headphones size={18} /></div>
              <div className="flex-1 min-w-0">
                <p className="font-serif text-base truncate">{d.title}</p>
                <p className="text-xs text-muted-foreground">{d.size}</p>
                {!d.done && <div className="mt-2"><ProgressBar value={d.progress ?? 0} /></div>}
              </div>
              {d.done ? <CheckCircle2 className="text-primary" size={20} /> : <span className="text-xs text-muted-foreground">{Math.round((d.progress ?? 0) * 100)}%</span>}
            </AppCard>
          ))
        )}
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 25. Settings ───────────── */
export function Settings() {
  const nav = useNavigate();
  const [dark, setDark] = useState(false);
  const groups = [
    {
      label: "Reading",
      items: [
        { icon: Languages, label: "Language", value: "English", to: "/language" },
        { icon: BookOpen, label: "Font size", value: "Medium" },
        { icon: dark ? Moon : Sun, label: "Theme", value: dark ? "Dark" : "Light", action: () => setDark((d) => !d) },
      ],
    },
    {
      label: "Practice",
      items: [
        { icon: Bell, label: "Daily reminder", value: "07:00", to: "/reminders" },
        { icon: Flame, label: "Streak", value: `${profile.streak} days`, to: "/journey" },
        { icon: Download, label: "Downloads", value: `${demoDownloads.length}`, to: "/downloads" },
      ],
    },
    {
      label: "About",
      items: [
        { icon: FileText, label: "Notes", to: "/notes" },
        { icon: HistoryIcon, label: "Reading history", to: "/history" },
        { icon: SettingsIcon, label: "About Easy Gita" },
      ],
    },
  ];
  return (
    <ScreenWrapper>
      <Header title="Settings" back={false} />
      <div className="flex-1 overflow-y-auto px-5 space-y-6 pb-8">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 px-1">{g.label}</p>
            <div className="rounded-2xl bg-card border border-border/60 shadow-card divide-y divide-border/60 overflow-hidden">
              {g.items.map((it, i) => {
                const Icon = it.icon;
                const handler = () => {
                  if ("to" in it && it.to) nav(it.to);
                  else if ("action" in it && it.action) it.action();
                };
                return (
                  <button key={i} onClick={handler} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
                    <Icon size={18} className="text-primary" />
                    <span className="flex-1 text-sm text-foreground">{it.label}</span>
                    {"value" in it && it.value && <span className="text-xs text-muted-foreground">{it.value}</span>}
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <button className="w-full flex items-center justify-center gap-2 h-12 rounded-full bg-card border border-border text-destructive font-medium">
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </ScreenWrapper>
  );
}

/* ───────────── 26. Profile ───────────── */
export function Profile() {
  const nav = useNavigate();
  return (
    <ScreenWrapper>
      <Header title="Profile" back={false} right={<IconButton onClick={() => nav("/settings")}><SettingsIcon size={18} /></IconButton>} />
      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-4">
        <AppCard className="flex items-center gap-4">
          <img src={DEMO_IMG} alt={profile.name} className="h-16 w-16 rounded-full object-cover shadow-card" />
          <div className="flex-1">
            <p className="font-serif text-xl text-foreground">{profile.name}</p>
            <p className="text-xs text-muted-foreground">{profile.email}</p>
          </div>
        </AppCard>
        <div className="grid grid-cols-3 gap-3">
          <AppCard className="text-center"><p className="font-serif text-2xl">{profile.streak}</p><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Streak</p></AppCard>
          <AppCard className="text-center"><p className="font-serif text-2xl">{profile.versesRead}</p><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Verses</p></AppCard>
          <AppCard className="text-center"><p className="font-serif text-2xl">{profile.bookmarks}</p><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Saved</p></AppCard>
        </div>
        <div className="space-y-2">
          {[
            { icon: HistoryIcon, label: "Reading history", to: "/history" },
            { icon: FileText, label: "Notes & reflections", to: "/notes" },
            { icon: Bookmark, label: "Saved verses", to: "/bookmarks" },
            { icon: Heart, label: "Favorites", to: "/favorites" },
            { icon: Download, label: "Downloads", to: "/downloads" },
            { icon: Flame, label: "Daily journey", to: "/journey" },
          ].map((r, i) => {
            const Icon = r.icon;
            return (
              <AppCard key={i} onClick={() => nav(r.to)} className="flex items-center gap-3 py-3">
                <span className="h-10 w-10 rounded-full bg-gradient-dawn flex items-center justify-center text-primary"><Icon size={18} /></span>
                <span className="flex-1 text-sm text-foreground">{r.label}</span>
                <ChevronRight size={16} className="text-muted-foreground" />
              </AppCard>
            );
          })}
        </div>
      </div>
      <BottomTabs />
    </ScreenWrapper>
  );
}

/* Loading placeholder (skeleton state demo) */
export function LoadingDemo() {
  return (
    <ScreenWrapper>
      <Header title="Loading" />
      <div className="px-5 space-y-3">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </ScreenWrapper>
  );
}
