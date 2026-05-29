import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
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
  updateStreak: (days: number) => void;
  signOutUser: () => Promise<void>;
  triggerSync: () => Promise<void>;

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

  // 1. Load initial local storage data for Guests
  useEffect(() => {
    if (!user) {
      setBookmarks(JSON.parse(localStorage.getItem("gita_bookmarks") || "[]"));
      setNotes(JSON.parse(localStorage.getItem("gita_notes") || "[]"));
      setHistory(JSON.parse(localStorage.getItem("gita_history") || "[]"));
      setFavorites(JSON.parse(localStorage.getItem("gita_favorites") || "[]"));
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

  // 2. Write to LocalStorage on changes
  useEffect(() => {
    if (!user) {
      localStorage.setItem("gita_bookmarks", JSON.stringify(bookmarks));
      localStorage.setItem("gita_notes", JSON.stringify(notes));
      localStorage.setItem("gita_history", JSON.stringify(history));
      localStorage.setItem("gita_favorites", JSON.stringify(favorites));
      localStorage.setItem("gita_profile", JSON.stringify(profile));
    }
  }, [bookmarks, notes, history, favorites, profile, user]);

  useEffect(() => {
    localStorage.setItem("gita_downloaded_verses", JSON.stringify(downloadedVerses));
    localStorage.setItem("gita_downloaded_chapters", JSON.stringify(downloadedChapters));
    localStorage.setItem("gita_is_gita_downloaded", isGitaDownloaded.toString());
  }, [downloadedVerses, downloadedChapters, isGitaDownloaded]);

  // 3. Listen to Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        setLoading(true);
        console.log(`👤 User logged in: ${currentUser.email}`);

        // Setup a real-time snapshot listener on the user's Firestore document
        const userDocRef = doc(db, "users", currentUser.uid);
        const unsubDoc = onSnapshot(
          userDocRef,
          async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              console.log("☁️ Syncing down remote progress from cloud...", data);

              // Merge state: Remote values take precedence, but we merge lists to ensure no local data is lost
              setBookmarks((prev) => Array.from(new Set([...prev, ...(data.bookmarks || [])])));
              setFavorites((prev) => Array.from(new Set([...prev, ...(data.favorites || [])])));
              setDownloadedVerses((prev) => Array.from(new Set([...prev, ...(data.downloadedVerses || [])])));
              setDownloadedChapters((prev) => Array.from(new Set([...prev, ...(data.downloadedChapters || [])])));
              setIsGitaDownloaded((prev) => prev || !!data.isGitaDownloaded);

              setNotes((prev) => {
                const remoteNotes: UserNote[] = data.notes || [];
                const combined = [...prev, ...remoteNotes];
                const unique = combined.reduce<Record<string, UserNote>>((acc, n) => { acc[n.id] = acc[n.id] ?? n; return acc; }, {});
                return Object.values(unique);
              });
              setHistory((prev) => {
                const remoteHist: HistoryItem[] = data.history || [];
                const combined = [...prev, ...remoteHist];
                const unique = combined.reduce<Record<string, HistoryItem>>((acc, h) => { acc[h.id] = acc[h.id] ?? h; return acc; }, {});
                return Object.values(unique);
              });
              setProfile({
                name: currentUser.displayName || data.name || "Seeker",
                email: currentUser.email || data.email || "",
                streak: data.streak ?? 1,
                versesRead: Math.max(profile.versesRead, data.versesRead || 0),
                bookmarks: Math.max(bookmarks.length, data.bookmarks?.length || 0),
                minutes: Math.max(profile.minutes, data.minutes || 0),
              });

              if (data.language) {
                setSelectedLanguage(data.language);
                localStorage.setItem("gita_language", data.language);
              }
            } else {
              // First time logging in: Sync local progress up as initial backup
              console.log("☁️ Seeding local progress to Firestore...");
              await setDoc(userDocRef, {
                name: currentUser.displayName || "Seeker",
                email: currentUser.email || "",
                streak: profile.streak || 1,
                versesRead: profile.versesRead || 0,
                bookmarks: bookmarks,
                notes: notes,
                history: history,
                favorites: favorites,
                language: selectedLanguage,
                downloadedVerses: downloadedVerses,
                downloadedChapters: downloadedChapters,
                isGitaDownloaded: isGitaDownloaded,
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

        return () => unsubDoc();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [profile.streak, profile.versesRead, bookmarks, notes, history, favorites, selectedLanguage]);

  // Sync downloads to firestore when they change and user is logged in
  useEffect(() => {
    if (user) {
      syncStateToCloud(bookmarks, notes, history, favorites, profile, selectedLanguage, downloadedVerses, downloadedChapters, isGitaDownloaded);
    }
  }, [downloadedVerses, downloadedChapters, isGitaDownloaded, user]);

  // 4. Helper to push state changes to cloud if logged in
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
  ) => {
    if (!user) return;
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
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
      console.log("☁️ Successfully backed up progress to cloud.");
    } catch (e) {
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

    // Increment verses read
    const uniqueRead = new Set(updated.map((h) => `${h.chapter}.${h.verse}`));
    const updatedProfile = {
      ...profile,
      versesRead: Math.max(profile.versesRead, uniqueRead.size),
    };
    setProfile(updatedProfile);

    syncStateToCloud(bookmarks, notes, updated, favorites, updatedProfile);
  };

  const toggleFavorite = (verseId: string) => {
    const updated = favorites.includes(verseId)
      ? favorites.filter((id) => id !== verseId)
      : [...favorites, verseId];
    setFavorites(updated);
    syncStateToCloud(bookmarks, notes, history, updated, profile);
  };

  const isFavorite = (verseId: string) => favorites.includes(verseId);

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

  const triggerSync = async () => {
    if (!user) return;
    await syncStateToCloud();
  };

  // ──── High-fidelity Simulated Download Methods ────

  const downloadVerse = async (verseId: string) => {
    if (downloadedVerses.includes(verseId)) {
      toast.info(`Verse ${verseId} is already offline`);
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
        toast.success(`Verse ${verseId} recitation saved offline!`);
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
      toast.info(`Chapter ${chapterNum} is already offline`);
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
        toast.success(`Chapter ${chapterNum} offline recitation loaded!`);
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
      toast.info("Complete Gita is already offline");
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
        toast.success("All 18 chapters & 700 verses downloaded successfully!");
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
        triggerSync,

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
