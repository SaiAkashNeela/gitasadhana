// Small JSON key-value store over localStorage, with change listeners. Keys match the app's.
const listeners = new Map();

export const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    } catch {
      return fallback;
    }
  },
  getString(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    } catch {
      // Private mode or full storage: the page keeps working in memory.
    }
    listeners.get(key)?.forEach((fn) => fn(value));
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {}
    listeners.get(key)?.forEach((fn) => fn(undefined));
  },
  on(key, fn) {
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key).add(fn);
    return () => listeners.get(key)?.delete(fn);
  },
};

// Other tabs changing the same keys.
addEventListener("storage", (e) => {
  if (e.key && listeners.has(e.key)) listeners.get(e.key).forEach((fn) => fn(store.get(e.key)));
});
