import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AppState } from "react-native";

import { apiRequest, type AuthUser } from "@/lib/api";
import { auth, deleteCurrentUserAccount, restoreAuthSession } from "@/lib/auth";
import * as downloads from "@/lib/downloads";
import { allVerses, versesInChapter, TOTAL_VERSES } from "@/lib/gita";
import { rescheduleIfEnabled } from "@/lib/reminders";
import { storage } from "@/lib/storage";
import { toast } from "@/components/toast";

export type AppNotification = {
  id: string;
  category: "reminders" | "quotes" | "achievements" | "updates";
  title: string;
  body: string;
  time: string;
  dateGroup: "Today" | "This Week" | "Earlier";
  read: boolean;
  linkText?: string;
  linkTo?: string;
  iconType: "bell" | "lotus" | "trophy" | "calendar" | "chapter" | "share" | "megaphone";
};

export type UserNote = { id: string; verseId: string; title: string; body: string; date: string };
export type HistoryItem = { id: string; chapter: number; verse: number; date: string };
export type UserProfile = {
  name: string;
  email: string;
  streak: number;
  versesRead: number;
  bookmarks: number;
  minutes: number;
  createdAt?: string;
};

type Progress = {
  user: AuthUser | null;
  loading: boolean;
  profile: UserProfile;
  bookmarks: string[];
  notes: UserNote[];
  history: HistoryItem[];
  favorites: string[];
  completedVerses: string[];
  readDates: string[];
  notifications: AppNotification[];
  language: string;
  autoPlayOnOpen: boolean;
  fontSize: number;

  setLanguage: (lang: string) => void;
  setAutoPlayOnOpen: (v: boolean) => void;
  setFontSize: (v: number) => void;
  addBookmark: (id: string) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toggleCompleted: (id: string) => void;
  markCompleted: (id: string) => void;
  isCompleted: (id: string) => boolean;
  addNote: (verseId: string, title: string, body: string) => void;
  deleteNote: (id: string) => void;
  addHistory: (chapter: number, verse: number) => void;
  clearNotifications: () => void;
  deleteNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  signOutUser: () => Promise<void>;
  deleteAccountAndData: () => Promise<void>;
  triggerSync: () => Promise<void>;

  downloadedVerses: string[];
  downloadedChapters: number[];
  isGitaDownloaded: boolean;
  downloading: Record<string, number>;
  downloadVerse: (id: string) => Promise<void>;
  deleteVerseDownload: (id: string) => void;
  downloadChapter: (n: number) => Promise<void>;
  deleteChapterDownload: (n: number) => void;
  downloadWholeGita: () => Promise<void>;
  deleteWholeGita: () => void;
  cancelDownloads: () => void;
  isVerseDownloaded: (id: string) => boolean;
  isChapterDownloaded: (n: number) => boolean;
  usedBytes: number;
};

const Ctx = createContext<Progress | null>(null);

const SYNC_INTERVAL_MS = 60 * 1000;

const guestProfile = (): UserProfile => ({
  name: "Seeker",
  email: "guest@easygita.app",
  streak: 1,
  versesRead: 0,
  bookmarks: 0,
  minutes: 0,
  createdAt: new Date().toISOString(),
});

const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function initialNotifications(lastRead: string): AppNotification[] {
  return [
    {
      id: "n1",
      category: "reminders",
      title: "DailyReminderTitle",
      body: "DailyReminderBody",
      time: "7:00 AM",
      dateGroup: "Today",
      read: false,
      linkText: "ReadNow",
      linkTo: "/home",
      iconType: "bell",
    },
    {
      id: "n2",
      category: "reminders",
      title: "ContinueReadingTitle",
      body: "ContinueReadingBody",
      time: "9:00 AM",
      dateGroup: "Today",
      read: false,
      linkText: "ContinueReading",
      linkTo: `/verse/${lastRead}`,
      iconType: "chapter",
    },
    {
      id: "n3",
      category: "reminders",
      title: "StreakReminderTitle",
      body: "StreakReminderBody",
      time: "1:00 PM",
      dateGroup: "Today",
      read: false,
      linkText: "KeepGoing",
      linkTo: "/journey",
      iconType: "trophy",
    },
  ];
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState(() => storage.getString("gita_language") || "en");
  const [bookmarks, setBookmarks] = useState<string[]>(() => storage.get("gita_bookmarks", []));
  const [notes, setNotes] = useState<UserNote[]>(() => storage.get("gita_notes", []));
  const [history, setHistory] = useState<HistoryItem[]>(() => storage.get("gita_history", []));
  const [favorites, setFavorites] = useState<string[]>(() => storage.get("gita_favorites", []));
  const [completedVerses, setCompleted] = useState<string[]>(() => storage.get("gita_completed", []));
  const [readVerses, setReadVerses] = useState<string[]>(() => storage.get("gita_read_verses", []));
  const [readDates, setReadDates] = useState<string[]>(() => storage.get("gita_read_dates", []));
  const [profile, setProfile] = useState<UserProfile>(() => {
    const p = storage.get<UserProfile | null>("gita_profile", null) ?? guestProfile();
    return { ...p, streak: openedTodayStreak(p.streak), createdAt: p.createdAt ?? new Date().toISOString() };
  });
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const raw = storage.get<AppNotification[] | null>("gita_in_app_notifications", null);
    if (raw) return raw;
    const h = storage.get<HistoryItem[]>("gita_history", []);
    return initialNotifications(h[0] ? `${h[0].chapter}.${h[0].verse}` : "1.1");
  });
  const [autoPlayOnOpen, setAutoPlayState] = useState(() => storage.getString("gita_auto_play") !== "false");
  const [fontSize, setFontSizeState] = useState(() => Number(storage.getString("gita_font_size") ?? 16) || 16);

  // Offline audio: disk is the source of truth, refreshed after every change.
  const [diskVersion, setDiskVersion] = useState(0);
  const [downloading, setDownloading] = useState<Record<string, number>>({});
  const cancelRef = useRef(false);

  const dirtyRef = useRef(false);
  const stateRef = useRef({ bookmarks, notes, history, favorites, completedVerses, readVerses, readDates, profile, language });
  useEffect(() => {
    stateRef.current = { bookmarks, notes, history, favorites, completedVerses, readVerses, readDates, profile, language };
  });

  /* ───── persist locally ───── */
  useEffect(() => storage.set("gita_bookmarks", bookmarks), [bookmarks]);
  useEffect(() => storage.set("gita_notes", notes), [notes]);
  useEffect(() => storage.set("gita_history", history), [history]);
  useEffect(() => storage.set("gita_favorites", favorites), [favorites]);
  useEffect(() => storage.set("gita_completed", completedVerses), [completedVerses]);
  useEffect(() => storage.set("gita_read_verses", readVerses), [readVerses]);
  useEffect(() => storage.set("gita_read_dates", readDates), [readDates]);
  useEffect(() => storage.set("gita_profile", profile), [profile]);
  useEffect(() => storage.set("gita_in_app_notifications", notifications), [notifications]);

  /* ───── cloud sync (same /users/me/sync contract) ───── */
  const downloadedVersesNow = () => downloads.listDownloaded(stateRef.current.language);

  const pushToCloud = useCallback(async () => {
    if (!auth.currentUser) return;
    const s = stateRef.current;
    const dl = downloadedVersesNow();
    const dlChapters = chapterCompletion(dl);
    try {
      const res = await apiRequest<{ profile: any }>("/users/me/sync", {
        method: "POST",
        body: {
          // This device is signed in and holds the full state, so removals must stick.
          mode: "replace",
          name: s.profile.name,
          email: s.profile.email,
          streak: s.profile.streak,
          versesRead: s.profile.versesRead,
          bookmarks: s.bookmarks,
          notes: s.notes,
          history: s.history,
          favorites: s.favorites,
          language: s.language,
          downloadedVerses: dl,
          downloadedChapters: dlChapters,
          isGitaDownloaded: dl.length >= TOTAL_VERSES,
          completedVerses: s.completedVerses,
          readVerses: s.readVerses,
          readDates: s.readDates,
          minutes: s.profile.minutes,
          createdAt: s.profile.createdAt || new Date().toISOString(),
        },
      });
      const data = res.profile;
      if (data) {
        setProfile((p) => ({
          ...p,
          name: data.name || p.name,
          email: data.email || p.email,
          streak: data.streak ?? p.streak,
          versesRead: data.versesRead ?? p.versesRead,
          minutes: data.minutes ?? p.minutes,
          createdAt: data.createdAt || p.createdAt,
        }));
      }
      dirtyRef.current = false;
    } catch {
      // Stay dirty; the next tick retries.
    }
  }, []);

  const markDirty = () => {
    if (auth.currentUser) dirtyRef.current = true;
  };

  // Minutes-in-devotion counter + batched sync, once a minute while the app is active.
  useEffect(() => {
    const id = setInterval(() => {
      if (AppState.currentState === "active") {
        setProfile((p) => ({ ...p, minutes: p.minutes + 1 }));
        markDirty();
      }
      if (dirtyRef.current) void pushToCloud();
    }, SYNC_INTERVAL_MS);
    const sub = AppState.addEventListener("change", (s) => {
      if (s !== "active" && dirtyRef.current) void pushToCloud();
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [pushToCloud]);

  // Auth: restore on launch, merge local progress into the account on sign-in.
  useEffect(() => {
    void restoreAuthSession().finally(() => setLoading(false));
    let cancelled = false;
    const unsubscribe = auth.onAuthStateChanged(async (current) => {
      setUser(current);
      if (!current) return;
      setLoading(true);
      const s = stateRef.current;
      const dl = downloadedVersesNow();
      try {
        const res = await apiRequest<{ profile: any }>("/users/me/sync", {
          method: "POST",
          body: {
            name: current.displayName,
            email: current.email,
            streak: s.profile.streak || 1,
            versesRead: s.profile.versesRead || 0,
            bookmarks: s.bookmarks,
            notes: s.notes,
            history: s.history,
            favorites: s.favorites,
            completedVerses: s.completedVerses,
            readVerses: s.readVerses,
            language: s.language,
            downloadedVerses: dl,
            downloadedChapters: chapterCompletion(dl),
            isGitaDownloaded: dl.length >= TOTAL_VERSES,
            readDates: s.readDates,
            minutes: s.profile.minutes || 0,
            createdAt: s.profile.createdAt || current.metadata.creationTime || new Date().toISOString(),
          },
        });
        if (cancelled) return;
        const d = res.profile;
        setBookmarks(d.bookmarks || []);
        setFavorites(d.favorites || []);
        setCompleted(d.completedVerses || []);
        setReadVerses(d.readVerses || []);
        setReadDates(d.readDates || []);
        setNotes(d.notes || []);
        setHistory(d.history || []);
        setProfile({
          name: d.name || current.displayName || "Seeker",
          email: d.email || current.email || "",
          streak: d.streak ?? 1,
          versesRead: d.versesRead ?? (d.readVerses?.length || 0),
          bookmarks: d.bookmarks?.length || 0,
          minutes: d.minutes ?? 0,
          createdAt: d.createdAt || current.metadata.creationTime || new Date().toISOString(),
        });
        if (d.language && d.language !== stateRef.current.language) {
          storage.set("gita_language", d.language);
          setLanguageState(d.language);
        }
      } catch {
        // Offline: keep local progress; it will sync on the next tick.
        dirtyRef.current = true;
      } finally {
        if (!cancelled) setLoading(false);
      }
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  /* ───── actions ───── */
  const setLanguage = (lang: string) => {
    storage.set("gita_language", lang);
    setLanguageState(lang);
    markDirty();
    void rescheduleIfEnabled();
  };

  const setAutoPlayOnOpen = (v: boolean) => {
    storage.set("gita_auto_play", String(v));
    setAutoPlayState(v);
  };

  const setFontSize = (v: number) => {
    const clamped = Math.max(12, Math.min(24, v));
    storage.set("gita_font_size", String(clamped));
    setFontSizeState(clamped);
  };

  const addBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = Array.from(new Set([...prev, id]));
      setProfile((p) => ({ ...p, bookmarks: next.length }));
      return next;
    });
    markDirty();
  };

  const removeBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = prev.filter((b) => b !== id);
      setProfile((p) => ({ ...p, bookmarks: next.length }));
      return next;
    });
    markDirty();
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
    markDirty();
  };

  const toggleCompleted = (id: string) => {
    setCompleted((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
    markDirty();
  };

  const markCompleted = (id: string) => {
    setCompleted((prev) => (prev.includes(id) ? prev : [...prev, id]));
    markDirty();
  };

  const addNote = (verseId: string, title: string, body: string) => {
    const note: UserNote = {
      id: Math.random().toString(36).slice(2, 9),
      verseId,
      title,
      body,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
    setNotes((prev) => [note, ...prev]);
    markDirty();
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    markDirty();
  };

  const addHistory = (chapter: number, verse: number) => {
    setHistory((prev) => {
      if (prev[0]?.chapter === chapter && prev[0]?.verse === verse) return prev;
      return [
        { id: Math.random().toString(36).slice(2, 9), chapter, verse, date: new Date().toISOString() },
        ...prev.slice(0, 49),
      ];
    });
    const id = `${chapter}.${verse}`;
    setReadVerses((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      setProfile((p) => ({ ...p, versesRead: next.length }));
      return next;
    });
    const today = localDate();
    setReadDates((prev) => (prev.includes(today) ? prev : [...prev, today]));
    markDirty();
  };

  const signOutUser = async () => {
    await pushToCloud();
    await auth.signOut();
    setUser(null);
  };

  const deleteAccountAndData = async () => {
    if (!auth.currentUser) return;
    await deleteCurrentUserAccount();
    downloads.deleteAll(stateRef.current.language);
    storage.clearAll();
    setUser(null);
    setBookmarks([]);
    setNotes([]);
    setHistory([]);
    setFavorites([]);
    setCompleted([]);
    setReadVerses([]);
    setReadDates([]);
    setProfile(guestProfile());
    setDiskVersion((v) => v + 1);
  };

  // Keep the "continue reading" notification pointing at the latest verse.
  const lastRead = history[0] ? `${history[0].chapter}.${history[0].verse}` : "1.1";
  const notificationsView = useMemo(
    () =>
      notifications.map((n) =>
        n.title === "ContinueReadingTitle" || n.title === "ContinueReading" ? { ...n, linkTo: `/verse/${lastRead}` } : n,
      ),
    [notifications, lastRead],
  );

  /* ───── offline audio ───── */
  const downloadedVerses = useMemo(
    () => downloads.listDownloaded(language),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language, diskVersion],
  );
  const downloadedSet = useMemo(() => new Set(downloadedVerses), [downloadedVerses]);
  const downloadedChapters = useMemo(() => chapterCompletion(downloadedVerses), [downloadedVerses]);
  const usedBytes = useMemo(
    () => downloads.usedBytes(language),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language, diskVersion],
  );

  const setTask = (key: string, value: number | null) =>
    setDownloading((prev) => {
      const next = { ...prev };
      if (value == null) delete next[key];
      else next[key] = Math.round(value * 100);
      return next;
    });

  const downloadVerse = async (id: string) => {
    if (!downloads.downloadsSupported || downloads.isDownloaded(language, id)) return;
    const key = `verse:${id}`;
    setTask(key, 0);
    try {
      await downloads.downloadVerse(language, id, (f) => setTask(key, f));
    } catch {
      toast.error("Download failed. Check your connection and try again.");
    } finally {
      setTask(key, null);
      setDiskVersion((v) => v + 1);
      markDirty();
    }
  };

  const runBatch = async (key: string, ids: string[]) => {
    const todo = ids.filter((id) => !downloads.isDownloaded(language, id));
    if (todo.length === 0) return;
    cancelRef.current = false;
    let done = ids.length - todo.length;
    setTask(key, done / ids.length);
    let failed = 0;
    const queue = [...todo];
    const worker = async () => {
      while (queue.length && !cancelRef.current) {
        const id = queue.shift()!;
        try {
          await downloads.downloadVerse(language, id);
        } catch {
          failed++;
        }
        done++;
        setTask(key, done / ids.length);
      }
    };
    await Promise.all([worker(), worker(), worker()]);
    setTask(key, null);
    setDiskVersion((v) => v + 1);
    markDirty();
    if (failed > 0) toast.error(`${failed} recitations could not be downloaded. Try again to resume.`);
  };

  const downloadChapter = (n: number) => runBatch(`chapter:${n}`, versesInChapter(n).map((v) => v.id));
  const downloadWholeGita = () => runBatch("gita", allVerses.map((v) => v.id));

  const deleteVerseDownload = (id: string) => {
    downloads.deleteVerse(language, id);
    setDiskVersion((v) => v + 1);
    toast.success(`Removed offline audio for Verse ${id}`);
  };

  const deleteChapterDownload = (n: number) => {
    versesInChapter(n).forEach((v) => downloads.deleteVerse(language, v.id));
    setDiskVersion((v) => v + 1);
    toast.success(`Cleared offline audio for Chapter ${n}`);
  };

  const deleteWholeGita = () => {
    downloads.deleteAll(language);
    setDiskVersion((v) => v + 1);
    toast.success("Cleared entire offline recitation library");
  };

  const value: Progress = {
    user,
    loading,
    profile,
    bookmarks,
    notes,
    history,
    favorites,
    completedVerses,
    readDates,
    notifications: notificationsView,
    language,
    autoPlayOnOpen,
    fontSize,
    setLanguage,
    setAutoPlayOnOpen,
    setFontSize,
    addBookmark,
    removeBookmark,
    isBookmarked: (id) => bookmarks.includes(id),
    toggleFavorite,
    isFavorite: (id) => favorites.includes(id),
    toggleCompleted,
    markCompleted,
    isCompleted: (id) => completedVerses.includes(id),
    addNote,
    deleteNote,
    addHistory,
    clearNotifications: () => setNotifications([]),
    deleteNotification: (id) => setNotifications((prev) => prev.filter((n) => n.id !== id)),
    markNotificationAsRead: (id) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))),
    signOutUser,
    deleteAccountAndData,
    triggerSync: pushToCloud,
    downloadedVerses,
    downloadedChapters,
    isGitaDownloaded: downloadedVerses.length >= TOTAL_VERSES,
    downloading,
    downloadVerse,
    deleteVerseDownload,
    downloadChapter,
    deleteChapterDownload,
    downloadWholeGita,
    deleteWholeGita,
    cancelDownloads: () => {
      cancelRef.current = true;
    },
    isVerseDownloaded: (id) => downloadedSet.has(id),
    isChapterDownloaded: (n) => downloadedChapters.includes(n),
    usedBytes,
  };

  return <Ctx value={value}>{children}</Ctx>;
}

/** The streak counts consecutive days the app is opened, as in the original app. */
function openedTodayStreak(current: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastStr = storage.getString("gita_last_opened_date");
  let streak = current || 1;
  if (lastStr) {
    const last = new Date(lastStr);
    last.setHours(0, 0, 0, 0);
    const diff = Math.round((today.getTime() - last.getTime()) / 86_400_000);
    if (diff === 1) streak += 1;
    else if (diff > 1) streak = 1;
  }
  storage.set("gita_last_opened_date", today.toISOString());
  return streak;
}

function chapterCompletion(ids: string[]) {
  const set = new Set(ids);
  const out: number[] = [];
  for (let n = 1; n <= 18; n++) {
    const vs = versesInChapter(n);
    if (vs.length && vs.every((v) => set.has(v.id))) out.push(n);
  }
  return out;
}

export function useProgress() {
  const ctx = use(Ctx);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
