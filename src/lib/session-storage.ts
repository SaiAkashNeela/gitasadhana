import { Capacitor } from "@capacitor/core";
import { SecureStorage } from "@aparajita/capacitor-secure-storage";

export type SessionPayload = {
  token: string;
  user: {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    providerId?: string;
    emailVerified?: boolean;
    metadata: {
      creationTime: string;
      lastSignInTime: string;
    };
  };
};

type StorageLike = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

const SESSION_KEY = "gita_auth_session";
const STORAGE_PREFIX = "gita_";

let prefixApplied = false;

async function ensurePrefix() {
  if (prefixApplied) return;
  if (Capacitor.isNativePlatform()) {
    await SecureStorage.setKeyPrefix(STORAGE_PREFIX);
  }
  prefixApplied = true;
}

function createWebStorage(): StorageLike {
  return {
    async getItem(key: string) {
      return localStorage.getItem(key);
    },
    async setItem(key: string, value: string) {
      localStorage.setItem(key, value);
    },
    async removeItem(key: string) {
      localStorage.removeItem(key);
    },
  };
}

function createNativeStorage(): StorageLike {
  return {
    async getItem(key: string) {
      const value = await SecureStorage.getItem(key);
      return value;
    },
    async setItem(key: string, value: string) {
      await SecureStorage.setItem(key, value);
    },
    async removeItem(key: string) {
      await SecureStorage.removeItem(key);
    },
  };
}

export function createSessionStore(storage: StorageLike) {
  return {
    async load(): Promise<SessionPayload | null> {
      const raw = await storage.getItem(SESSION_KEY);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as SessionPayload;
      } catch {
        return null;
      }
    },
    async save(session: SessionPayload) {
      await storage.setItem(SESSION_KEY, JSON.stringify(session));
    },
    async clear() {
      await storage.removeItem(SESSION_KEY);
    },
  };
}

const sessionStore = createSessionStore(Capacitor.isNativePlatform() ? createNativeStorage() : createWebStorage());

export async function loadSession() {
  await ensurePrefix();
  return sessionStore.load();
}

export async function saveSession(session: SessionPayload) {
  await ensurePrefix();
  return sessionStore.save(session);
}

export async function clearSession() {
  await ensurePrefix();
  return sessionStore.clear();
}

