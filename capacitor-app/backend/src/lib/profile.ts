import type { HistoryItem, UserNote, UserProfile } from "../types.js";

export type UserProfilePatch = Partial<Omit<UserProfile, "bookmarks" | "notes" | "history" | "favorites" | "completedVerses" | "readVerses" | "readDates" | "downloadedVerses" | "downloadedChapters">> & {
  bookmarks?: string[];
  notes?: UserNote[];
  history?: HistoryItem[];
  favorites?: string[];
  completedVerses?: string[];
  readVerses?: string[];
  readDates?: string[];
  downloadedVerses?: string[];
  downloadedChapters?: number[];
};

function uniqBy<T>(items: T[], keyFn: (item: T) => string | number) {
  const seen = new Set<string | number>();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function mergeUserProfile(existing: UserProfile, patch: UserProfilePatch): UserProfile {
  return {
    ...existing,
    ...patch,
    bookmarks: patch.bookmarks ? uniqBy([...existing.bookmarks, ...patch.bookmarks], (item) => item) : existing.bookmarks,
    notes: patch.notes ? uniqBy([...existing.notes, ...patch.notes], (item) => item.id) : existing.notes,
    history: patch.history ? uniqBy([...existing.history, ...patch.history], (item) => item.id) : existing.history,
    favorites: patch.favorites ? uniqBy([...existing.favorites, ...patch.favorites], (item) => item) : existing.favorites,
    completedVerses: patch.completedVerses ? uniqBy([...existing.completedVerses, ...patch.completedVerses], (item) => item) : existing.completedVerses,
    readVerses: patch.readVerses ? uniqBy([...existing.readVerses, ...patch.readVerses], (item) => item) : existing.readVerses,
    readDates: patch.readDates ? uniqBy([...existing.readDates, ...patch.readDates], (item) => item) : existing.readDates,
    downloadedVerses: patch.downloadedVerses ? uniqBy([...existing.downloadedVerses, ...patch.downloadedVerses], (item) => item) : existing.downloadedVerses,
    downloadedChapters: patch.downloadedChapters ? uniqBy([...existing.downloadedChapters, ...patch.downloadedChapters], (item) => item) : existing.downloadedChapters,
  };
}

