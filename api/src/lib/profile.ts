import type { UserProfile } from "../types";

export type UserProfilePatch = Partial<UserProfile>;

function uniqBy<T>(items: T[], key: (item: T) => string | number) {
  const seen = new Set<string | number>();
  return items.filter((item) => {
    const k = key(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/**
 * Merge a device's progress into the stored profile. Lists are unioned (never dropped), so a
 * sign-in on a new phone adds to — rather than replaces — what the account already has.
 * Identical to the Node backend's mergeUserProfile.
 */
export function mergeUserProfile(existing: UserProfile, patch: UserProfilePatch): UserProfile {
  const union = <T>(a: T[], b: T[] | undefined, key: (x: T) => string | number) => (b ? uniqBy([...a, ...b], key) : a);
  const same = <T>(x: T) => x as unknown as string | number;
  return {
    ...existing,
    ...patch,
    bookmarks: union(existing.bookmarks, patch.bookmarks, same),
    notes: union(existing.notes, patch.notes, (n) => n.id),
    history: union(existing.history, patch.history, (h) => h.id),
    favorites: union(existing.favorites, patch.favorites, same),
    completedVerses: union(existing.completedVerses, patch.completedVerses, same),
    readVerses: union(existing.readVerses, patch.readVerses, same),
    readDates: union(existing.readDates, patch.readDates, same),
    downloadedVerses: union(existing.downloadedVerses, patch.downloadedVerses, same),
    downloadedChapters: union(existing.downloadedChapters, patch.downloadedChapters, same),
  };
}

export function newProfile(name: string, email: string, now: string): UserProfile {
  return {
    name: name || "Seeker",
    email,
    streak: 1,
    versesRead: 0,
    bookmarks: [],
    notes: [],
    history: [],
    favorites: [],
    completedVerses: [],
    readVerses: [],
    readDates: [],
    downloadedVerses: [],
    downloadedChapters: [],
    isGitaDownloaded: false,
    language: "en",
    minutes: 0,
    createdAt: now,
    updatedAt: now,
  };
}

/** A signed-in device's own periodic sync: its lists are the truth (so removals stick). */
export function replaceUserProfile(existing: UserProfile, patch: UserProfilePatch): UserProfile {
  return { ...existing, ...Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)) } as UserProfile;
}
