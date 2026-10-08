import "expo-sqlite/localStorage/install";

import { useSyncExternalStore } from "react";

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Synchronous JSON key-value storage (SQLite-backed on native, browser storage on web). */
export const storage = {
  get<T>(key: string, fallback: T): T {
    const raw = readRaw(key);
    const hit = cache.get(key);
    if (hit && hit.raw === raw) return hit.value as T;
    let value: T = fallback;
    if (raw != null) {
      try {
        value = JSON.parse(raw) as T;
      } catch {
        value = raw as unknown as T;
      }
    }
    cache.set(key, { raw, value });
    return value;
  },

  getString(key: string): string | null {
    return readRaw(key);
  },

  set<T>(key: string, value: T) {
    const raw = typeof value === "string" ? value : JSON.stringify(value);
    try {
      localStorage.setItem(key, raw);
    } catch {
      // Storage full or unavailable (private browsing) — state still lives in memory.
    }
    cache.set(key, { raw, value });
    listeners.get(key)?.forEach((fn) => fn());
  },

  remove(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {}
    cache.delete(key);
    listeners.get(key)?.forEach((fn) => fn());
  },

  clearAll() {
    try {
      localStorage.clear();
    } catch {}
    cache.clear();
    listeners.forEach((set) => set.forEach((fn) => fn()));
  },

  subscribe(key: string, listener: Listener) {
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)!.add(listener);
    return () => {
      listeners.get(key)?.delete(listener);
    };
  },
};

export function useStored<T>(key: string, fallback: T): [T, (value: T) => void] {
  const value = useSyncExternalStore(
    (cb) => storage.subscribe(key, cb),
    () => storage.get(key, fallback),
    () => fallback,
  );
  return [value, (next: T) => storage.set(key, next)];
}
