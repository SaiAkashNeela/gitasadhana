import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, User, deleteUser } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { toast } from "sonner";
import gitaProcessedData from "@/app/gita-processed.json";

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
}

interface UserProgressContextType {
  user: User | null;
  loading: boolean;
  profile: UserProfile;
  bookmarks: string[]; // List of bookmarked verse IDs (e.g. "2.47")
  notes: UserNote[];
  history: HistoryItem[];
  favorites: string[]; // List of favorite verse IDs
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

const SYNC_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes in milliseconds

export function UserProgressProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
      setProfile(
        JSON.parse(
          localStorage.getItem("gita_profile") ||
            JSON.stringify({
              name: "Seeker",
              email: "guest@easygita.app",
              streak: 1,
              versesRead: 0,
              bookmarks: 0,
              minutes: 0,
            }),
        ),
      );
    }
  }, [user]);

  // 2. Write to LocalStorage on changes (always, as local cache)
  useEffect(() => {
    localStorage.setItem("gita_bookmarks", JSON.stringify(bookmarks));
    localStorage.setItem("gita_notes", JSON.stringify(notes));
    localStorage.setItem("gita_history", JSON.stringify(history));
    localStorage.setItem("gita_favorites", JSON.stringify(favorites));
    localStorage.setItem("gita_profile", JSON.stringify(profile));
    localStorage.setItem("gita_completed", JSON.stringify(completedVerses));
    localStorage.setItem("gita_read_verses", JSON.stringify(readVerses));
  }, [bookmarks, notes, history, favorites, profile, completedVerses, readVerses]);

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

  // Background interval for minutes read tracking
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        setProfile(prev => ({ ...prev, minutes: prev.minutes + 1 }));
      }
    }, 60000);
    return () => clearInterval(interval);
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
                const streak = data.streak ?? 1;
                const versesRead = Math.max(prev.versesRead, data.readVerses?.length || data.versesRead || 0);
                const bookmarksCount = Math.max(prev.bookmarks, data.bookmarks?.length || 0);
                const minutes = Math.max(prev.minutes, data.minutes || 0);

                if (
                  prev.name === name &&
                  prev.email === email &&
                  prev.streak === streak &&
                  prev.versesRead === versesRead &&
                  prev.bookmarks === bookmarksCount &&
                  prev.minutes === minutes
                ) {
                  return prev;
                }
                return { name, email, streak, versesRead, bookmarks: bookmarksCount, minutes };
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
  }, [downloadedVerses, downloadedChapters, isGitaDownloaded, user]);

  // 4. Helper to push state changes to cloud if logged in (Throttled to once every 30 minutes, synchronously locks to block race conditions)
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
  ) => {
    if (!user) return;

    // Retrieve last sync timestamp
    const lastSyncTimeStr = localStorage.getItem("gita_last_sync_time") || "0";
    const now = Date.now();
    const timeSinceLastSync = now - Number(lastSyncTimeStr);

    if (!force && timeSinceLastSync < SYNC_INTERVAL_MS) {
      console.log(`☁️ Cloud sync deferred. Last sync was ${Math.round(timeSinceLastSync / 1000 / 60)} mins ago (sync is limited to once every 30 mins).`);
      return;
    }

    // Set the sync timestamp IMMEDIATELY and synchronously before setDoc to block race conditions!
    if (!force) {
      localStorage.setItem("gita_last_sync_time", now.toString());
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
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
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
      // Update with the final completion timestamp
      localStorage.setItem("gita_last_sync_time", Date.now().toString());
      console.log("☁️ Successfully backed up progress to cloud.");
    } catch (e) {
      // If it failed, clear the timestamp so it can retry later
      if (!force) {
        localStorage.removeItem("gita_last_sync_time");
      }
      console.error("Cloud backup failed:", e);
    }
  };

  const setLanguage = (lang: string) => {
    setSelectedLanguage(lang);
    localStorage.setItem("gita_language", lang);
    syncStateToCloud(bookmarks, notes, history, favorites, profile, lang);
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
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      chapter,
      verse,
      date: "Today",
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

    const updatedProfile = {
      ...profile,
      versesRead: newReadVerses.length,
    };
    setProfile(updatedProfile);

    syncStateToCloud(bookmarks, notes, updated, favorites, updatedProfile, selectedLanguage, downloadedVerses, downloadedChapters, isGitaDownloaded, false, completedVerses, newReadVerses);
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

  const signOutUser = async () => {
    await auth.signOut();
    setUser(null);
    localStorage.clear();
    setBookmarks([]);
    setNotes([]);
    setHistory([]);
    setFavorites([]);
    setCompletedVerses([]);
    setReadVerses([]);
    setDownloadedVerses([]);
    setDownloadedChapters([]);
    setIsGitaDownloaded(false);
    setProfile({
      name: "Seeker",
      email: "guest@easygita.app",
      streak: 1,
      versesRead: 0,
      bookmarks: 0,
      minutes: 0,
    });
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
    setDownloadedVerses([]);
    setDownloadedChapters([]);
    setIsGitaDownloaded(false);
  };

  const triggerSync = async () => {
    if (!user) return;
    await syncStateToCloud(bookmarks, notes, history, favorites, profile, selectedLanguage, downloadedVerses, downloadedChapters, isGitaDownloaded, true);
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
