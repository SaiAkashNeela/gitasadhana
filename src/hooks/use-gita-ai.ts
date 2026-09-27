import { useCallback, useEffect, useRef, useState } from "react";

import { apiRequest } from "@/lib/api";
import { auth } from "@/lib/auth";
import { getGuestSessionId } from "@/lib/guest";
import { storage, useStored } from "@/lib/storage";

export type ChatMessage = { id: string; role: "user" | "model"; text: string; ts: number };

const STORAGE_KEY = "gita_ai_chat";
const LANGUAGE_KEY = "gita_ai_language";
const SYNC_INTERVAL_MS = 10 * 60 * 1000;

/** Same contract as the original hook: /ai/chat for replies, /chat/me for history sync. */
export function useGitaAI(uid: string | null) {
  const [messages, setMessagesState] = useState<ChatMessage[]>(() => storage.get(STORAGE_KEY, []));
  const [language, setLanguage] = useStored<string | null>(LANGUAGE_KEY, null);
  const [sending, setSending] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dirty = useRef(false);
  const latest = useRef(messages);

  const setMessages = (updater: (prev: ChatMessage[]) => ChatMessage[]) => {
    setMessagesState((prev) => {
      const next = updater(prev);
      latest.current = next;
      storage.set(STORAGE_KEY, next);
      if (uid) dirty.current = true;
      return next;
    });
  };

  const push = useCallback(async () => {
    if (!auth.currentUser) return;
    try {
      await apiRequest("/chat/me", { method: "PUT", body: { messages: latest.current, language: language ?? "en" } });
      dirty.current = false;
    } catch {}
  }, [language]);

  // Merge cloud history on sign-in.
  useEffect(() => {
    if (!uid || !auth.currentUser) return;
    apiRequest<{ messages: ChatMessage[] }>("/chat/me")
      .then((res) => {
        const cloud = res.messages ?? [];
        if (!cloud.length) return;
        setMessages((local) => {
          const seen = new Set<string>();
          return [...local, ...cloud]
            .filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)))
            .sort((a, b) => a.ts - b.ts);
        });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    const id = setInterval(() => dirty.current && void push(), SYNC_INTERVAL_MS);
    return () => {
      clearInterval(id);
      if (dirty.current) void push();
    };
  }, [uid, push]);

  const sendMessage = async (text: string) => {
    const body = text.trim();
    if (!body || sending) return;
    const userMsg: ChatMessage = { id: `${Date.now()}-user`, role: "user", text: body, ts: Date.now() };
    const history = latest.current.slice(-20).map((m) => ({ role: m.role, text: m.text }));
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);
    setError(null);
    try {
      const res = await apiRequest<{ reply: string | null; limitReached: boolean }>("/ai/chat", {
        method: "POST",
        body: { message: body, history, language: language ?? "en" },
        headers: auth.currentUser ? undefined : { "x-guest-id": getGuestSessionId() },
      });
      if (res.limitReached) {
        setLimitReached(true);
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
        return;
      }
      setMessages((prev) => [...prev, { id: `${Date.now()}-model`, role: "model", text: res.reply ?? "", ts: Date.now() }]);
    } catch (e: any) {
      const msg = String(e?.message ?? "").toLowerCase();
      // Errors are dictionary keys so the screen can show them in the reader's language.
      if (msg.includes("rate")) setError("gitaAiRateLimited");
      else if (msg.includes("network") || msg.includes("offline") || msg.includes("temporarily unavailable")) setError("offline");
      else if (msg.includes("available")) setError("gitaAiUnavailable");
      else setError("gitaAiError");
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
    } finally {
      setSending(false);
    }
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
    clearChat: () => {
      setMessages(() => []);
      setLimitReached(false);
    },
  };
}
