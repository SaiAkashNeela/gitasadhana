import { useState, useEffect, useRef, useCallback } from "react";
import { httpsCallable } from "firebase/functions";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { functions, db } from "@/lib/firebase";

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

  // Persist to localStorage whenever messages change
  useEffect(() => {
    saveLocal(messages);
    if (uid) syncDirtyRef.current = true;
  }, [messages, uid]);

  // Cloud sync helpers
  const pushToCloud = useCallback(async (msgs: ChatMessage[]) => {
    if (!uid) return;
    try {
      await setDoc(
        doc(db, "gitaAiChats", uid),
        { messages: msgs, updatedAt: new Date().toISOString() },
        { merge: true },
      );
      syncDirtyRef.current = false;
    } catch (e) {
      console.error("Gita AI sync failed:", e);
    }
  }, [uid]);

  const pullFromCloud = useCallback(async (): Promise<ChatMessage[]> => {
    if (!uid) return [];
    try {
      const snap = await getDoc(doc(db, "gitaAiChats", uid));
      if (snap.exists()) return (snap.data().messages as ChatMessage[]) ?? [];
    } catch (e) {
      console.error("Gita AI pull failed:", e);
    }
    return [];
  }, [uid]);

  // On login: merge cloud + local
  useEffect(() => {
    if (!uid) return;
    pullFromCloud().then((cloud) => {
      setMessages((local) => {
        if (cloud.length === 0) return local;
        const merged = [...local, ...cloud];
        const seen = new Set<string>();
        const unique = merged.filter((m) => {
          if (seen.has(m.id)) return false;
          seen.add(m.id);
          return true;
        });
        unique.sort((a, b) => a.ts - b.ts);
        saveLocal(unique);
        return unique;
      });
    });
  }, [uid, pullFromCloud]);

  // 10-min sync interval
  useEffect(() => {
    if (!uid) return;
    syncTimerRef.current = setInterval(() => {
      if (syncDirtyRef.current) {
        setMessages((m) => { pushToCloud(m); return m; });
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

    // Build history for API (last 20 messages, exclude the one just added)
    const historyForApi = messages.slice(-20).map((m) => ({
      role: m.role,
      text: m.text,
    }));

    try {
      const fn = httpsCallable(functions, "gitaChat");
      const result = await fn({
        message: text.trim(),
        history: historyForApi,
        language: language ?? "en",
        uid: uid ?? "anonymous",
      }) as { data: { reply: string | null; limitReached: boolean } };

      if (result.data.limitReached) {
        setLimitReached(true);
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
        return;
      }

      const modelMsg: ChatMessage = {
        id: `${Date.now()}-model`,
        role: "model",
        text: result.data.reply ?? "",
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (e: any) {
      const code = e?.code ?? "";
      if (code === "functions/resource-exhausted") {
        setError("Rate limit reached. Please try again in a moment.");
      } else if (
        e?.message?.toLowerCase().includes("network") ||
        e?.message?.toLowerCase().includes("offline") ||
        code === "functions/unavailable"
      ) {
        setError("offline");
      } else {
        setError("Something went wrong. Please try again.");
      }
      // Remove the optimistic user message on failure
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
    } finally {
      setSending(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    saveLocal([]);
    setLimitReached(false);
  };

  // Force sync before logout — call this and await before signing out
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
