import { api, session, SESSION_KEY } from "./api.js";
import { GOOGLE_WEB_CLIENT_ID } from "./config.js";
import { store } from "./store.js";

export const currentUser = () => session()?.user ?? null;

function loadGsi() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load Google sign-in."));
    document.head.appendChild(s);
  });
}

/**
 * Renders Google's own "Sign in with Google" button into `container` (official branding) and
 * exchanges the returned ID token with the API.
 */
export async function mountGoogleButton(container, { onSignedIn, onError, locale, theme }) {
  await loadGsi();
  window.google.accounts.id.initialize({
    client_id: GOOGLE_WEB_CLIENT_ID,
    ux_mode: "popup",
    callback: async ({ credential }) => {
      try {
        if (!credential) throw new Error("Google did not return a sign-in token.");
        const res = await api("/auth/google", { method: "POST", body: { idToken: credential }, token: null });
        store.set(SESSION_KEY, { token: res.token, user: res.user });
        onSignedIn?.(res);
      } catch (e) {
        onError?.(e);
      }
    },
  });
  container.replaceChildren();
  window.google.accounts.id.renderButton(container, {
    type: "standard",
    theme: theme === "dark" ? "filled_black" : "outline",
    size: "large",
    shape: "pill",
    text: "continue_with",
    logo_alignment: "left",
    width: Math.min(360, container.clientWidth || 320),
    locale,
  });
}

/** Re-validates the saved token; keeps it when merely offline. */
export async function restoreSession() {
  const s = session();
  if (!s?.token) return null;
  try {
    const res = await api("/auth/me");
    store.set(SESSION_KEY, { ...s, user: res.user });
    return res.user;
  } catch (e) {
    if (e.status === 401) store.remove(SESSION_KEY);
    return currentUser();
  }
}

export async function signOut() {
  try {
    await api("/auth/logout", { method: "POST" });
  } catch {}
  window.google?.accounts?.id?.disableAutoSelect?.();
  store.remove(SESSION_KEY);
}

export async function deleteAccount() {
  await api("/users/me", { method: "DELETE" });
  store.remove(SESSION_KEY);
}
