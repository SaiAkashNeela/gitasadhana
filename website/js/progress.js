// Reading progress, saved items and settings. Same storage keys and sync contract as the
// mobile app: local first, synced to the account when signed in.
import { api, session } from "./api.js";
import { lang } from "./i18n.js";
import { store } from "./store.js";

const K = {
  bookmarks: "gita_bookmarks",
  favorites: "gita_favorites",
  notes: "gita_notes",
  history: "gita_history",
  completed: "gita_completed",
  readVerses: "gita_read_verses",
  readDates: "gita_read_dates",
  profile: "gita_profile",
  lastOpened: "gita_last_opened_date",
  dirty: "gita_sync_dirty",
};

const listeners = new Set();
export const onProgress = (fn) => (listeners.add(fn), () => listeners.delete(fn));
const emit = () => listeners.forEach((fn) => fn());

const list = (k) => store.get(k, []);
const setList = (k, v) => {
  store.set(k, v);
  markDirty();
  emit();
};

export const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function profile() {
  const p = store.get(K.profile, null) ?? {};
  return {
    name: p.name || "Seeker",
    email: p.email || "",
    streak: p.streak || 1,
    versesRead: p.versesRead ?? list(K.readVerses).length,
    bookmarks: list(K.bookmarks).length,
    minutes: p.minutes || 0,
    createdAt: p.createdAt || new Date().toISOString(),
  };
}
const saveProfile = (patch) => {
  store.set(K.profile, { ...profile(), ...patch });
  markDirty();
  emit();
};

export const bookmarks = () => list(K.bookmarks);
export const favorites = () => list(K.favorites);
export const notes = () => list(K.notes);
export const history = () => list(K.history);
export const completed = () => list(K.completed);
export const readDates = () => list(K.readDates);
export const isBookmarked = (id) => bookmarks().includes(id);
export const isFavorite = (id) => favorites().includes(id);
export const isCompleted = (id) => completed().includes(id);

const toggle = (k, id) => {
  const cur = list(k);
  const on = !cur.includes(id);
  setList(k, on ? [...cur, id] : cur.filter((x) => x !== id));
  return on;
};
export const toggleBookmark = (id) => toggle(K.bookmarks, id);
export const toggleFavorite = (id) => toggle(K.favorites, id);
export const toggleCompleted = (id) => toggle(K.completed, id);
export function markCompleted(id) {
  if (!isCompleted(id)) setList(K.completed, [...completed(), id]);
}

export function addNote(verseId, body, title = "Reflection") {
  const note = { id: Math.random().toString(36).slice(2, 9), verseId, title, body, date: new Date().toISOString() };
  setList(K.notes, [note, ...notes()]);
}
export const deleteNote = (id) => setList(K.notes, notes().filter((n) => n.id !== id));

/** Opening a verse records history, read verses and today's reading day. */
export function recordRead(chapter, verse) {
  const h = history();
  if (!(h[0]?.chapter === chapter && h[0]?.verse === verse)) {
    store.set(K.history, [{ id: Math.random().toString(36).slice(2, 9), chapter, verse, date: new Date().toISOString() }, ...h.slice(0, 49)]);
  }
  const id = `${chapter}.${verse}`;
  const read = list(K.readVerses);
  if (!read.includes(id)) store.set(K.readVerses, [...read, id]);
  const today = localDate();
  const days = readDates();
  if (!days.includes(today)) store.set(K.readDates, [...days, today]);
  saveProfile({ versesRead: list(K.readVerses).length });
}

// Streak: consecutive days on which the app or site is opened (the original's rule).
(function streak() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = store.getString(K.lastOpened);
  const p = profile();
  let s = p.streak;
  if (last) {
    const d = new Date(last);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((today - d) / 86400000);
    if (diff === 1) s += 1;
    else if (diff > 1) s = 1;
  }
  store.set(K.profile, { ...p, streak: s });
  store.set(K.lastOpened, today.toISOString());
})();

// Minutes in devotion, counted while the page is visible.
setInterval(() => {
  if (document.visibilityState === "visible") saveProfile({ minutes: profile().minutes + 1 });
}, 60000);

/* ───────── Settings ───────── */
export const settings = {
  get autoPlay() {
    return store.getString("gita_auto_play") !== "false";
  },
  set autoPlay(v) {
    store.set("gita_auto_play", String(v));
  },
  get fontSize() {
    return Number(store.getString("gita_font_size") ?? 16) || 16;
  },
  set fontSize(v) {
    store.set("gita_font_size", String(Math.max(12, Math.min(24, v))));
  },
  get theme() {
    return store.get("gita_theme", "system");
  },
  set theme(v) {
    store.set("gita_theme", v);
  },
  get newsletter() {
    return store.get("gita_newsletter_pref", "daily");
  },
  set newsletter(v) {
    store.set("gita_newsletter_pref", v);
  },
};

/* ───────── Cloud sync ───────── */
function markDirty() {
  if (session()?.token) store.set(K.dirty, "true");
}

function payload(mode) {
  const p = profile();
  return {
    mode,
    name: p.name,
    email: p.email,
    streak: p.streak,
    versesRead: p.versesRead,
    minutes: p.minutes,
    createdAt: p.createdAt,
    bookmarks: bookmarks(),
    favorites: favorites(),
    notes: notes(),
    history: history(),
    completedVerses: completed(),
    readVerses: list(K.readVerses),
    readDates: readDates(),
    language: lang,
  };
}

function applyServer(d, user) {
  if (!d) return;
  store.set(K.bookmarks, d.bookmarks || []);
  store.set(K.favorites, d.favorites || []);
  store.set(K.notes, d.notes || []);
  store.set(K.history, d.history || []);
  store.set(K.completed, d.completedVerses || []);
  store.set(K.readVerses, d.readVerses || []);
  store.set(K.readDates, d.readDates || []);
  store.set(K.profile, {
    name: d.name || user?.displayName || "Seeker",
    email: d.email || user?.email || "",
    streak: d.streak ?? 1,
    versesRead: d.versesRead ?? (d.readVerses?.length || 0),
    minutes: d.minutes ?? 0,
    createdAt: d.createdAt || new Date().toISOString(),
  });
  emit();
}

/** Right after signing in: merge this browser's progress into the account. */
export async function mergeOnSignIn(user) {
  const res = await api("/users/me/sync", { method: "POST", body: { ...payload("merge"), name: user.displayName, email: user.email } });
  applyServer(res.profile, user);
  store.remove(K.dirty);
  if (res.profile?.language && res.profile.language !== lang) return res.profile.language;
  return null;
}

export async function pushNow({ keepalive = false } = {}) {
  if (!session()?.token || store.getString(K.dirty) !== "true") return;
  try {
    await api("/users/me/sync", { method: "POST", body: payload("replace"), keepalive });
    store.remove(K.dirty);
  } catch {
    // Stays dirty; retried on the next tick.
  }
}

setInterval(pushNow, 60000);
// keepalive lets the last sync finish while the page unloads.
addEventListener("pagehide", () => void pushNow({ keepalive: true }));

export function clearLocalProgress() {
  Object.values(K).forEach((k) => store.remove(k));
  ["gita_ai_chat", "gita_recent_searches"].forEach((k) => store.remove(k));
  emit();
}
