import { storage } from "./storage";

const KEY = "gita_guest_session_id";

export function getGuestSessionId() {
  const existing = storage.getString(KEY);
  if (existing) return existing;
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  storage.set(KEY, id);
  return id;
}
