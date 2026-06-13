import { apiRequest, type AuthSession } from "./backend";
import { loadSession, saveSession } from "./session";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

type AuthListener = (user: AuthSession["user"] | null) => void;

let currentSession: AuthSession | null = loadSession();
const listeners = new Set<AuthListener>();

const googleWebClientId =
  import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID ??
  import.meta.env.VITE_GOOGLE_CLIENT_ID ??
  "822836118890-5rh7f1cq4149afb8ghjfogkijcfithpr.apps.googleusercontent.com";

function emit() {
  listeners.forEach((listener) => listener(currentSession?.user ?? null));
}

async function persistSession(session: AuthSession | null) {
  currentSession = session;
  saveSession(session);
  emit();
}

function loadGoogleScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Google sign-in."));
    document.head.appendChild(script);
  });
}

export async function restoreAuthSession() {
  if (!currentSession?.token) {
    await persistSession(null);
    return null;
  }

  try {
    const result = await apiRequest<{ user: AuthSession["user"] }>("/auth/me", {
      token: currentSession.token,
    });
    await persistSession({ ...currentSession, user: result.user });
    return currentSession;
  } catch {
    await persistSession(null);
    return null;
  }
}

export const auth = {
  get currentUser() {
    return currentSession?.user ?? null;
  },
  onAuthStateChanged(callback: AuthListener) {
    listeners.add(callback);
    callback(currentSession?.user ?? null);
    return () => listeners.delete(callback);
  },
  async signOut() {
    try {
      await apiRequest("/auth/logout", { method: "POST", token: currentSession?.token ?? null });
    } catch {
      // local sign-out should still clear even if backend is unavailable
    }
    await persistSession(null);
  },
};

async function exchangeProviderToken(idToken: string) {
  const response = await apiRequest<{
    success: true;
    token: string;
    user: AuthSession["user"];
  }>("/auth/google", {
    method: "POST",
    body: { idToken },
    token: null,
  });

  await persistSession({ token: response.token, user: response.user });
  return response;
}

export async function renderGoogleSignInButton(container: HTMLElement) {
  await loadGoogleScript();
  if (!window.google?.accounts?.id) {
    throw new Error("Google sign-in is unavailable.");
  }

  container.innerHTML = "";
  window.google.accounts.id.initialize({
    client_id: googleWebClientId,
    callback: async (response) => {
      if (!response.credential) return;
      await exchangeProviderToken(response.credential);
    },
  });
  window.google.accounts.id.renderButton(container, {
    theme: "outline",
    size: "large",
    shape: "pill",
    text: "signin_with",
    width: 320,
  });
}
