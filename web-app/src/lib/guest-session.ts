const GUEST_SESSION_KEY = "gita_web_guest_session_id";

function generateGuestSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getGuestSessionId() {
  const existing = localStorage.getItem(GUEST_SESSION_KEY);
  if (existing) return existing;
  const guestId = generateGuestSessionId();
  localStorage.setItem(GUEST_SESSION_KEY, guestId);
  return guestId;
}
