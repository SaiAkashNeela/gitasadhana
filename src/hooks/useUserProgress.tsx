import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { onAuthStateChanged, User, deleteUser } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { toast } from "sonner";
import gitaProcessedData from "@/app/gita-processed.json";
import { getReminderConfig, scheduleDailyReminder } from "@/lib/notifications";

export interface AppNotification {
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
}

export interface UserNote {
  id: string;
  verseId: string;
  title: string;
  body: string;
  date: string;
}

export interface HistoryItem {
  id: string;
  chapter: number;
  verse: number;
  date: string;
}

export interface UserProfile {
  name: string;
  email: string;
  streak: number;
  versesRead: number;
  bookmarks: number;
  minutes: number;
  createdAt?: string; // registration/installation timestamp
}

interface UserProgressContextType {
  user: User | null;
  loading: boolean;
  profile: UserProfile;
  bookmarks: string[]; // List of bookmarked verse IDs (e.g. "2.47")
  notes: UserNote[];
  history: HistoryItem[];
  favorites: string[]; // List of favorite verse IDs
  readDates: string[]; // List of unique read dates YYYY-MM-DD
  notifications: AppNotification[];
  clearNotifications: () => void;
  deleteNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  selectedLanguage: string;
  setLanguage: (lang: string) => void;
  addBookmark: (verseId: string) => void;
  removeBookmark: (verseId: string) => void;
  isBookmarked: (verseId: string) => boolean;
  addNote: (verseId: string, title: string, body: string) => void;
  deleteNote: (noteId: string) => void;
  addHistory: (chapter: number, verse: number) => void;
  toggleFavorite: (verseId: string) => void;
  isFavorite: (verseId: string) => boolean;
  completedVerses: string[];
  toggleCompleted: (verseId: string) => void;
  isCompleted: (verseId: string) => boolean;
  updateStreak: (days: number) => void;
  signOutUser: () => Promise<void>;
  deleteAccountAndData: () => Promise<void>;
  triggerSync: () => Promise<void>;
  autoPlayOnOpen: boolean;
  setAutoPlayOnOpen: (val: boolean) => void;

  // Download APIs
  downloadedVerses: string[];
  downloadedChapters: number[];
  isGitaDownloaded: boolean;
  downloading: Record<string, number>;
  downloadVerse: (verseId: string) => Promise<void>;
  deleteVerseDownload: (verseId: string) => void;
  downloadChapter: (chapterNum: number) => Promise<void>;
  deleteChapterDownload: (chapterNum: number) => void;
  downloadWholeGita: () => Promise<void>;
  deleteWholeGita: () => void;
  isVerseDownloaded: (verseId: string) => boolean;
  isChapterDownloaded: (chapterNum: number) => boolean;
}

const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined);

const SYNC_INTERVAL_MS = 60 * 1000;

export function UserProgressProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const syncDirtyRef = useRef(false);

  // Current Language
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem("gita_language") || "en";
  });

  // Local State
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [completedVerses, setCompletedVerses] = useState<string[]>([]);
  const [readVerses, setReadVerses] = useState<string[]>([]);
  const [readDates, setReadDates] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    name: "Seeker",
    email: "offline@easygita.app",
    streak: 0,
    versesRead: 0,
    bookmarks: 0,
    minutes: 0,
  });

  // Offline Download States
  const [downloadedVerses, setDownloadedVerses] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem("gita_downloaded_verses") || "[]");
  });
  const [downloadedChapters, setDownloadedChapters] = useState<number[]>(() => {
    return JSON.parse(localStorage.getItem("gita_downloaded_chapters") || "[]");
  });
  const [isGitaDownloaded, setIsGitaDownloaded] = useState<boolean>(() => {
    return localStorage.getItem("gita_is_gita_downloaded") === "true";
  });
  const [downloading, setDownloading] = useState<Record<string, number>>({});

  const [autoPlayOnOpen, setAutoPlayOnOpenState] = useState<boolean>(() => {
    return localStorage.getItem("gita_auto_play") !== "false";
  });

  const setAutoPlayOnOpen = (val: boolean) => {
    setAutoPlayOnOpenState(val);
    localStorage.setItem("gita_auto_play", String(val));
  };

  // 1. Load initial local storage data for Guests
  useEffect(() => {
    if (!user) {
      setBookmarks(JSON.parse(localStorage.getItem("gita_bookmarks") || "[]"));
      setNotes(JSON.parse(localStorage.getItem("gita_notes") || "[]"));
      setHistory(JSON.parse(localStorage.getItem("gita_history") || "[]"));
      setFavorites(JSON.parse(localStorage.getItem("gita_favorites") || "[]"));
      setCompletedVerses(JSON.parse(localStorage.getItem("gita_completed") || "[]"));
      setReadVerses(JSON.parse(localStorage.getItem("gita_read_verses") || "[]"));
      setReadDates(JSON.parse(localStorage.getItem("gita_read_dates") || "[]"));
      
      const savedProfile = JSON.parse(
        localStorage.getItem("gita_profile") ||
          JSON.stringify({
            name: "Seeker",
            email: "guest@easygita.app",
            streak: 1,
            versesRead: 0,
            bookmarks: 0,
            minutes: 0,
            createdAt: new Date().toISOString(),
          }),
      );
      if (!savedProfile.createdAt) {
        savedProfile.createdAt = new Date().toISOString();
      }
      setProfile(savedProfile);
    }
  }, [user]);

  // Load In-App Notifications on startup and sync dynamic linkTo
  useEffect(() => {
    const raw = localStorage.getItem("gita_in_app_notifications");
    if (raw === "[]") {
      setNotifications([]);
      return;
    }

    let parsed: AppNotification[] = [];
    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch {}
    }

    let lastReadStr = "1.1";
    if (history && history.length > 0) {
      lastReadStr = `${history[0].chapter}.${history[0].verse}`;
    }

    if (parsed.length > 0) {
      // Just keep dynamic linkTo fresh
      setNotifications(
        parsed.map((n) =>
          n.title === "ContinueReadingTitle" || n.title === "ContinueReading"
            ? { ...n, linkTo: `/verse/${lastReadStr}` }
            : n
        )
      );
    } else if (raw === null) {
      const initial: AppNotification[] = [
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
          linkTo: `/verse/${lastReadStr}`,
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
      setNotifications(initial);
      localStorage.setItem("gita_in_app_notifications", JSON.stringify(initial));
    }
  }, [history]);

  // 2. Write to LocalStorage on changes (always, as local cache)
  useEffect(() => {
    localStorage.setItem("gita_bookmarks", JSON.stringify(bookmarks));
    localStorage.setItem("gita_notes", JSON.stringify(notes));
    localStorage.setItem("gita_history", JSON.stringify(history));
    localStorage.setItem("gita_favorites", JSON.stringify(favorites));
    localStorage.setItem("gita_profile", JSON.stringify(profile));
    localStorage.setItem("gita_completed", JSON.stringify(completedVerses));
    localStorage.setItem("gita_read_verses", JSON.stringify(readVerses));
    localStorage.setItem("gita_read_dates", JSON.stringify(readDates));
    localStorage.setItem("gita_in_app_notifications", JSON.stringify(notifications));
  }, [bookmarks, notes, history, favorites, profile, completedVerses, readVerses, readDates, notifications]);

  // App open tracking for streak
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();
    const lastOpenedStr = localStorage.getItem("gita_last_opened_date");
    
    setProfile(prev => {
      let streak = prev.streak || 1;
      if (lastOpenedStr) {
        const lastOpened = new Date(lastOpenedStr);
        lastOpened.setHours(0, 0, 0, 0);
        const diffDays = Math.round((today.getTime() - lastOpened.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          streak += 1;
        } else if (diffDays > 1) {
          streak = 1;
        }
      }
      return { ...prev, streak };
    });
    localStorage.setItem("gita_last_opened_date", todayStr);
  }, []);

  // Background interval for minutes read tracking + 1-min cloud sync flush
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        setProfile(prev => ({ ...prev, minutes: prev.minutes + 1 }));
      }
      if (syncDirtyRef.current) {
        syncStateToCloud();
      }
    }, SYNC_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem("gita_downloaded_verses", JSON.stringify(downloadedVerses));
    localStorage.setItem("gita_downloaded_chapters", JSON.stringify(downloadedChapters));
    localStorage.setItem("gita_is_gita_downloaded", isGitaDownloaded.toString());
  }, [downloadedVerses, downloadedChapters, isGitaDownloaded]);

  // 3. Listen to Auth State Changes (Run exactly once on mount to prevent expensive re-subscriptions, cleans up properly)
  useEffect(() => {
    let unsubDoc: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      // Cancel any existing snapshot listener
      if (unsubDoc) {
        unsubDoc();
        unsubDoc = null;
      }

      if (currentUser) {
        setLoading(true);
        console.log(`👤 User logged in: ${currentUser.email}`);

        // Setup a real-time snapshot listener on the user's Firestore document
        const userDocRef = doc(db, "users", currentUser.uid);
        unsubDoc = onSnapshot(
          userDocRef,
          async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              console.log("☁️ Syncing down remote progress from cloud...", data);

              // Merge state with array-equality checks to prevent infinite React rendering/HMR loops from new empty array instances
              setBookmarks((prev) => {
                const combined = Array.from(new Set([...prev, ...(data.bookmarks || [])]));
                if (prev.length === combined.length && prev.every((v, i) => v === combined[i])) return prev;
                return combined;
              });

              setFavorites((prev) => {
                const combined = Array.from(new Set([...prev, ...(data.favorites || [])]));
                if (prev.length === combined.length && prev.every((v, i) => v === combined[i])) return prev;
                return combined;
              });

              setCompletedVerses((prev) => {
                const combined = Array.from(new Set([...prev, ...(data.completedVerses || [])]));
                if (prev.length === combined.length && prev.every((v, i) => v === combined[i])) return prev;
                return combined;
              });

              setReadVerses((prev) => {
                const combined = Array.from(new Set([...prev, ...(data.readVerses || [])]));
                if (prev.length === combined.length && prev.every((v, i) => v === combined[i])) return prev;
                return combined;
              });

              setReadDates((prev) => {
                const combined = Array.from(new Set([...prev, ...(data.readDates || [])]));
                if (prev.length === combined.length && prev.every((v, i) => v === combined[i])) return prev;
                return combined;
              });

              setDownloadedVerses((prev) => {
                const combined = Array.from(new Set([...prev, ...(data.downloadedVerses || [])]));
                if (prev.length === combined.length && prev.every((v, i) => v === combined[i])) return prev;
                return combined;
              });

              setDownloadedChapters((prev) => {
                const combined = Array.from(new Set([...prev, ...(data.downloadedChapters || [])]));
                if (prev.length === combined.length && prev.every((v, i) => v === combined[i])) return prev;
                return combined;
              });

              setIsGitaDownloaded((prev) => prev || !!data.isGitaDownloaded);

              setNotes((prev) => {
                const remoteNotes: UserNote[] = data.notes || [];
                const combined = [...prev, ...remoteNotes];
                const unique = combined.reduce<Record<string, UserNote>>((acc, n) => { acc[n.id] = acc[n.id] ?? n; return acc; }, {});
                const updated = Object.values(unique);
                if (prev.length === updated.length && prev.every((n, i) => n.id === updated[i].id && n.title === updated[i].title && n.body === updated[i].body)) {
                  return prev;
                }
                return updated;
              });

              setHistory((prev) => {
                const remoteHist: HistoryItem[] = data.history || [];
                const combined = [...prev, ...remoteHist];
                const unique = combined.reduce<Record<string, HistoryItem>>((acc, h) => { acc[h.id] = acc[h.id] ?? h; return acc; }, {});
                const updated = Object.values(unique);
                if (prev.length === updated.length && prev.every((h, i) => h.id === updated[i].id && h.chapter === updated[i].chapter && h.verse === updated[i].verse)) {
                  return prev;
                }
                return updated;
              });

              setProfile((prev) => {
                const name = currentUser.displayName || data.name || "Seeker";
                const email = currentUser.email || data.email || "";
                const streak = Math.max(prev.streak, data.streak ?? 1);
                const versesRead = Math.max(prev.versesRead, data.readVerses?.length || data.versesRead || 0);
                const bookmarksCount = Math.max(prev.bookmarks, data.bookmarks?.length || 0);
                const minutes = Math.max(prev.minutes, data.minutes || 0);
                const createdAt = data.createdAt || prev.createdAt || currentUser.metadata.creationTime || new Date().toISOString();

                if (
                  prev.name === name &&
                  prev.email === email &&
                  prev.streak === streak &&
                  prev.versesRead === versesRead &&
                  prev.bookmarks === bookmarksCount &&
                  prev.minutes === minutes &&
                  prev.createdAt === createdAt
                ) {
                  return prev;
                }
                return { name, email, streak, versesRead, bookmarks: bookmarksCount, minutes, createdAt };
              });

              if (data.language) {
                setSelectedLanguage((prev) => {
                  if (prev === data.language) return prev;
                  localStorage.setItem("gita_language", data.language);
                  return data.language;
                });
              }
            } else {
              // First time logging in: Sync local progress up as initial backup (read from localStorage cache to prevent stale closures)
              console.log("☁️ Seeding local progress to Firestore...");
              const localBookmarks = JSON.parse(localStorage.getItem("gita_bookmarks") || "[]");
              const localNotes = JSON.parse(localStorage.getItem("gita_notes") || "[]");
              const localHistory = JSON.parse(localStorage.getItem("gita_history") || "[]");
              const localFavorites = JSON.parse(localStorage.getItem("gita_favorites") || "[]");
              const localCompleted = JSON.parse(localStorage.getItem("gita_completed") || "[]");
              const localReadVerses = JSON.parse(localStorage.getItem("gita_read_verses") || "[]");
              const localProfile = JSON.parse(localStorage.getItem("gita_profile") || `{"streak": 1, "versesRead": 0, "bookmarks": 0, "minutes": 0}`);
              const localLang = localStorage.getItem("gita_language") || "en";
              const localDownloadedVerses = JSON.parse(localStorage.getItem("gita_downloaded_verses") || "[]");
              const localDownloadedChapters = JSON.parse(localStorage.getItem("gita_downloaded_chapters") || "[]");
              const localIsGitaDownloaded = localStorage.getItem("gita_is_gita_downloaded") === "true";
              const localReadDates = JSON.parse(localStorage.getItem("gita_read_dates") || "[]");

              await setDoc(userDocRef, {
                name: currentUser.displayName || "Seeker",
                email: currentUser.email || "",
                streak: localProfile.streak || 1,
                versesRead: localProfile.versesRead || 0,
                bookmarks: localBookmarks,
                notes: localNotes,
                history: localHistory,
                favorites: localFavorites,
                completedVerses: localCompleted,
                readVerses: localReadVerses,
                language: localLang,
                downloadedVerses: localDownloadedVerses,
                downloadedChapters: localDownloadedChapters,
                isGitaDownloaded: localIsGitaDownloaded,
                readDates: localReadDates,
                createdAt: localProfile.createdAt || currentUser.metadata.creationTime || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            }
            setLoading(false);
          },
          (err) => {
            console.error("Firestore sync error:", err);
            setLoading(false);
          },
        );
      } else {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubDoc) unsubDoc();
    };
  }, []);

  // Sync downloads to firestore when they change and user is logged in
  useEffect(() => {
    if (user) {
      syncStateToCloud(bookmarks, notes, history, favorites, profile, selectedLanguage, downloadedVerses, downloadedChapters, isGitaDownloaded, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downloadedVerses, downloadedChapters, isGitaDownloaded, user]);

  // 4. Helper to push state to cloud.
  // Non-forced calls just mark dirty — a 1-min interval batches all changes into 1 write.
  // Forced calls (sign-out, triggerSync) write immediately.
  const syncStateToCloud = async (
    updatedBookmarks = bookmarks,
    updatedNotes = notes,
    updatedHistory = history,
    updatedFavorites = favorites,
    updatedProfile = profile,
    lang = selectedLanguage,
    updatedDownloadedVerses = downloadedVerses,
    updatedDownloadedChapters = downloadedChapters,
    updatedIsGitaDownloaded = isGitaDownloaded,
    force = false,
    updatedCompleted = completedVerses,
    updatedReadVerses = readVerses,
    updatedReadDates = readDates,
  ) => {
    if (!user) return;

    const doWrite = async (u: typeof user) => {
      try {
        const userDocRef = doc(db, "users", u.uid);
        await setDoc(
          userDocRef,
          {
            name: updatedProfile.name,
            email: updatedProfile.email,
            streak: updatedProfile.streak,
            versesRead: updatedProfile.versesRead,
            bookmarks: updatedBookmarks,
            notes: updatedNotes,
            history: updatedHistory,
            favorites: updatedFavorites,
            language: lang,
            downloadedVerses: updatedDownloadedVerses,
            downloadedChapters: updatedDownloadedChapters,
            isGitaDownloaded: updatedIsGitaDownloaded,
            completedVerses: updatedCompleted,
            readVerses: updatedReadVerses,
            readDates: updatedReadDates,
            createdAt: updatedProfile.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );
        syncDirtyRef.current = false;
        console.log("☁️ Successfully backed up progress to cloud.");
      } catch (e) {
        console.error("Cloud backup failed:", e);
      }
    };

    if (force) {
      await doWrite(user);
    } else {
      syncDirtyRef.current = true;
    }
  };

  const setLanguage = (lang: string) => {
    setSelectedLanguage(lang);
    localStorage.setItem("gita_language", lang);
    syncStateToCloud(bookmarks, notes, history, favorites, profile, lang);
    
    // Reschedule push notifications in the newly selected language if enabled
    const reminderConfig = getReminderConfig();
    if (reminderConfig.enabled) {
      scheduleDailyReminder(reminderConfig.time).catch((err) => {
        console.error("Failed to reschedule reminders on language change:", err);
      });
    }
  };

  const addBookmark = (verseId: string) => {
    const updated = Array.from(new Set([...bookmarks, verseId]));
    setBookmarks(updated);
    setProfile((p) => ({ ...p, bookmarks: updated.length }));
    syncStateToCloud(updated, notes, history, favorites, { ...profile, bookmarks: updated.length });
  };

  const removeBookmark = (verseId: string) => {
    const updated = bookmarks.filter((id) => id !== verseId);
    setBookmarks(updated);
    setProfile((p) => ({ ...p, bookmarks: updated.length }));
    syncStateToCloud(updated, notes, history, favorites, { ...profile, bookmarks: updated.length });
  };

  const isBookmarked = (verseId: string) => bookmarks.includes(verseId);

  const addNote = (verseId: string, title: string, body: string) => {
    const newNote: UserNote = {
      id: Math.random().toString(36).substring(2, 9),
      verseId,
      title,
      body,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    syncStateToCloud(bookmarks, updated, history, favorites, profile);
  };

  const deleteNote = (noteId: string) => {
    const updated = notes.filter((n) => n.id !== noteId);
    setNotes(updated);
    syncStateToCloud(bookmarks, updated, history, favorites, profile);
  };

  const addHistory = (chapter: number, verse: number) => {
    const today = new Date();
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      chapter,
      verse,
      date: today.toISOString(),
    };
    // Ensure no rapid duplicates in history
    if (history[0]?.chapter === chapter && history[0]?.verse === verse) return;

    const updated = [newItem, ...history.slice(0, 49)]; // Cap history at 50 items
    setHistory(updated);

    // Track verses read
    const verseId = `${chapter}.${verse}`;
    let newReadVerses = readVerses;
    if (!readVerses.includes(verseId)) {
      newReadVerses = [...readVerses, verseId];
      setReadVerses(newReadVerses);
    }

    // Local timezone date string format: YYYY-MM-DD
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    let newReadDates = readDates;
    if (!readDates.includes(todayStr)) {
      newReadDates = [...readDates, todayStr];
      setReadDates(newReadDates);
    }

    const updatedProfile = {
      ...profile,
      versesRead: newReadVerses.length,
      createdAt: profile.createdAt || today.toISOString(),
    };
    setProfile(updatedProfile);

    syncStateToCloud(bookmarks, notes, updated, favorites, updatedProfile, selectedLanguage, downloadedVerses, downloadedChapters, isGitaDownloaded, false, completedVerses, newReadVerses, newReadDates);
  };

  const toggleFavorite = (verseId: string) => {
    const updated = favorites.includes(verseId)
      ? favorites.filter((id) => id !== verseId)
      : [...favorites, verseId];
    setFavorites(updated);
    syncStateToCloud(bookmarks, notes, history, updated, profile);
  };

  const isFavorite = (verseId: string) => favorites.includes(verseId);

  const toggleCompleted = (verseId: string) => {
    const updated = completedVerses.includes(verseId)
      ? completedVerses.filter((id) => id !== verseId)
      : [...completedVerses, verseId];
    setCompletedVerses(updated);
    syncStateToCloud(bookmarks, notes, history, favorites, profile, selectedLanguage, downloadedVerses, downloadedChapters, isGitaDownloaded, false, updated);
  };

  const isCompleted = (verseId: string) => completedVerses.includes(verseId);

  const updateStreak = (days: number) => {
    const updatedProfile = { ...profile, streak: days };
    setProfile(updatedProfile);
    syncStateToCloud(bookmarks, notes, history, favorites, updatedProfile);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const signOutUser = async () => {
    await syncStateToCloud(bookmarks, notes, history, favorites, profile, selectedLanguage, downloadedVerses, downloadedChapters, isGitaDownloaded, true, completedVerses, readVerses, readDates);
    await auth.signOut();
    setUser(null);
  };

  const deleteAccountAndData = async () => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid));
    } catch {}
    try {
      await deleteUser(user);
    } catch {}
    localStorage.clear();
    setUser(null);
    setBookmarks([]);
    setNotes([]);
    setHistory([]);
    setFavorites([]);
    setCompletedVerses([]);
    setReadVerses([]);
    setDownloadedVerses([]);
    setDownloadedChapters([]);
    setIsGitaDownloaded(false);
    setReadDates([]);
    setProfile({
      name: "Seeker",
      email: "guest@easygita.app",
      streak: 1,
      versesRead: 0,
      bookmarks: 0,
      minutes: 0,
      createdAt: new Date().toISOString(),
    });
  };

  const triggerSync = async () => {
    if (!user) return;
    await syncStateToCloud(bookmarks, notes, history, favorites, profile, selectedLanguage, downloadedVerses, downloadedChapters, isGitaDownloaded, true, completedVerses, readVerses, readDates);
  };

  // ──── High-fidelity Simulated Download Methods ────

  const downloadVerse = async (verseId: string) => {
    if (downloadedVerses.includes(verseId)) {
      return;
    }
    const taskKey = `verse:${verseId}`;
    setDownloading((prev) => ({ ...prev, [taskKey]: 0 }));

    let prog = 0;
    const interval = setInterval(() => {
      prog += 20;
      if (prog >= 100) {
        clearInterval(interval);
        setDownloading((prev) => {
          const next = { ...prev };
          delete next[taskKey];
          return next;
        });
        setDownloadedVerses((prev) => Array.from(new Set([...prev, verseId])));
      } else {
        setDownloading((prev) => ({ ...prev, [taskKey]: prog }));
      }
    }, 120);
  };

  const deleteVerseDownload = (verseId: string) => {
    setDownloadedVerses((prev) => prev.filter((id) => id !== verseId));
    setIsGitaDownloaded(false);
    const [ch] = verseId.split(".").map(Number);
    setDownloadedChapters((prev) => prev.filter((c) => c !== ch));
    toast.success(`Removed offline audio for Verse ${verseId}`);
  };

  const downloadChapter = async (chapterNum: number) => {
    if (downloadedChapters.includes(chapterNum)) {
      return;
    }
    const taskKey = `chapter:${chapterNum}`;
    setDownloading((prev) => ({ ...prev, [taskKey]: 0 }));

    // Find all verses in this chapter
    const allVersesMap = (gitaProcessedData as any).verses || {};
    const chapterVerses = Object.values(allVersesMap)
      .filter((v: any) => v.chapter === chapterNum)
      .map((v: any) => `${v.chapter}.${v.verse}`);

    let prog = 0;
    const interval = setInterval(() => {
      prog += 10;
      if (prog >= 100) {
        clearInterval(interval);
        setDownloading((prev) => {
          const next = { ...prev };
          delete next[taskKey];
          return next;
        });
        setDownloadedVerses((prev) => Array.from(new Set([...prev, ...chapterVerses])));
        setDownloadedChapters((prev) => Array.from(new Set([...prev, chapterNum])));
      } else {
        setDownloading((prev) => ({ ...prev, [taskKey]: prog }));
      }
    }, 180);
  };

  const deleteChapterDownload = (chapterNum: number) => {
    setDownloadedChapters((prev) => prev.filter((c) => c !== chapterNum));
    setDownloadedVerses((prev) => prev.filter((id) => !id.startsWith(`${chapterNum}.`)));
    setIsGitaDownloaded(false);
    toast.success(`Cleared offline audio for Chapter ${chapterNum}`);
  };

  const downloadWholeGita = async () => {
    if (isGitaDownloaded) {
      return;
    }
    const taskKey = "gita";
    setDownloading((prev) => ({ ...prev, [taskKey]: 0 }));

    const allVersesMap = (gitaProcessedData as any).verses || {};
    const allVerseIds = Object.values(allVersesMap).map((v: any) => `${v.chapter}.${v.verse}`);
    const allChapters = Array.from({ length: 18 }, (_, i) => i + 1);

    let prog = 0;
    const interval = setInterval(() => {
      prog += 10;
      if (prog >= 100) {
        clearInterval(interval);
        setDownloading((prev) => {
          const next = { ...prev };
          delete next[taskKey];
          return next;
        });
        setDownloadedVerses(allVerseIds);
        setDownloadedChapters(allChapters);
        setIsGitaDownloaded(true);
      } else {
        setDownloading((prev) => ({ ...prev, [taskKey]: prog }));
      }
    }, 280);
  };

  const deleteWholeGita = () => {
    setDownloadedVerses([]);
    setDownloadedChapters([]);
    setIsGitaDownloaded(false);
    toast.success("Cleared entire offline recitation library");
  };

  const isVerseDownloaded = (verseId: string) => downloadedVerses.includes(verseId);
  const isChapterDownloaded = (chapterNum: number) => downloadedChapters.includes(chapterNum);

  return (
    <UserProgressContext.Provider
      value={{
        user,
        loading,
        profile,
        bookmarks,
        notes,
        history,
        favorites,
        readDates,
        notifications,
        clearNotifications,
        deleteNotification,
        markNotificationAsRead,
        selectedLanguage,
        setLanguage,
        addBookmark,
        removeBookmark,
        isBookmarked,
        addNote,
        deleteNote,
        addHistory,
        toggleFavorite,
        isFavorite,
        updateStreak,
        signOutUser,
        deleteAccountAndData,
        triggerSync,
        autoPlayOnOpen,
        setAutoPlayOnOpen,

        completedVerses,
        toggleCompleted,
        isCompleted,

        // New Downloads Context Values
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
      }}
    >
      {children}
    </UserProgressContext.Provider>
  );
}

export function useUserProgress() {
  const context = useContext(UserProgressContext);
  if (!context) {
    throw new Error("useUserProgress must be used within a UserProgressProvider");
  }
  return context;
}
