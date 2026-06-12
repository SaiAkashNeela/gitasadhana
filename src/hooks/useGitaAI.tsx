import { useState, useEffect, useRef, useCallback } from "react";
import { apiRequest } from "@/lib/backend";
import { auth } from "@/lib/auth";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  ts: number;
}

const STORAGE_KEY = "gita_ai_chat";
const LANGUAGE_KEY = "gita_ai_language";
const SYNC_INTERVAL_MS = 10 * 60 * 1000;

function loadLocal(): ChatMessage[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocal(msgs: ChatMessage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
}

export function useGitaAI(uid: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadLocal());
  const [language, setLanguageState] = useState<string | null>(
    () => localStorage.getItem(LANGUAGE_KEY),
  );
  const [sending, setSending] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const syncDirtyRef = useRef(false);
  const syncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    saveLocal(messages);
    if (uid) syncDirtyRef.current = true;
  }, [messages, uid]);

  const pushToCloud = useCallback(async (msgs: ChatMessage[]) => {
    if (!auth.currentUser) return;
    try {
      await apiRequest("/chat/me", {
        method: "PUT",
        body: {
          messages: msgs,
          language: language ?? "en",
        },
      });
      syncDirtyRef.current = false;
    } catch (e) {
      console.error("Gita AI sync failed:", e);
    }
  }, [language]);

  const pullFromCloud = useCallback(async (): Promise<ChatMessage[]> => {
    if (!auth.currentUser) return [];
    try {
      const result = await apiRequest<{ messages: ChatMessage[] }>("/chat/me");
      return result.messages ?? [];
    } catch (e) {
      console.error("Gita AI pull failed:", e);
    }
    return [];
  }, []);

  useEffect(() => {
    if (!uid || !auth.currentUser) return;
    pullFromCloud().then((cloud) => {
      setMessages((local) => {
        if (cloud.length === 0) return local;
        const merged = [...local, ...cloud];
        const seen = new Set<string>();
        const unique = merged.filter((message) => {
          if (seen.has(message.id)) return false;
          seen.add(message.id);
          return true;
        });
        unique.sort((a, b) => a.ts - b.ts);
        saveLocal(unique);
        return unique;
      });
    });
  }, [uid, pullFromCloud]);

  useEffect(() => {
    if (!uid) return;
    syncTimerRef.current = setInterval(() => {
      if (syncDirtyRef.current) {
        setMessages((current) => {
          void pushToCloud(current);
          return current;
        });
      }
    }, SYNC_INTERVAL_MS);
    return () => {
      if (syncTimerRef.current) clearInterval(syncTimerRef.current);
    };
  }, [uid, pushToCloud]);

  const setLanguage = (lang: string) => {
    localStorage.setItem(LANGUAGE_KEY, lang);
    setLanguageState(lang);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || sending) return;

    const userMsg: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      text: text.trim(),
      ts: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setSending(true);
    setError(null);

    const historyForApi = messages.slice(-20).map((message) => ({
      role: message.role,
      text: message.text,
    }));

    try {
      const result = await apiRequest<{ reply: string | null; limitReached: boolean }>("/ai/chat", {
        method: "POST",
        body: {
          message: text.trim(),
          history: historyForApi,
          language: language ?? "en",
        },
      });

      if (result.limitReached) {
        setLimitReached(true);
        setMessages((prev) => prev.filter((message) => message.id !== userMsg.id));
        return;
      }

      const modelMsg: ChatMessage = {
        id: `${Date.now()}-model`,
        role: "model",
        text: result.reply ?? "",
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (e: any) {
      const message = String(e?.message ?? "");
      if (message.toLowerCase().includes("rate")) {
        setError("Rate limit reached. Please try again in a moment.");
      } else if (message.toLowerCase().includes("network") || message.toLowerCase().includes("offline") || message.toLowerCase().includes("temporarily unavailable")) {
        setError("offline");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setMessages((prev) => prev.filter((entry) => entry.id !== userMsg.id));
    } finally {
      setSending(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    saveLocal([]);
    setLimitReached(false);
  };

  const forceSyncBeforeLogout = async () => {
    const current = loadLocal();
    await pushToCloud(current);
  };

  return {
    messages,
    language,
    setLanguage,
    sending,
    limitReached,
    error,
    clearError: () => setError(null),
    sendMessage,
    clearChat,
    forceSyncBeforeLogout,
  };
}
