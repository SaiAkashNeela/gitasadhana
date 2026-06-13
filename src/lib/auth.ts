import { Capacitor } from "@capacitor/core";
import { apiRequest, AuthSession, AuthUser } from "./backend";
import { clearSession, loadSession, saveSession } from "./session-storage";

type AuthListener = (user: AuthUser | null) => void;

type SignInResponse = {
  success: true;
  isNewUser: boolean;
  user: AuthUser;
  token: string;
};

const googleWebClientId =
  import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID ??
  import.meta.env.VITE_GOOGLE_ANDROID_CLIENT_ID ??
  import.meta.env.VITE_GOOGLE_CLIENT_ID ??
  import.meta.env.GOOGLE_CLIENT_ID ??
  "822836118890-5rh7f1cq4149afb8ghjfogkijcfithpr.apps.googleusercontent.com";

const googleAndroidClientId =
  import.meta.env.VITE_GOOGLE_ANDROID_CLIENT_ID ??
  import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID ??
  googleWebClientId;

const googleIosClientId =
  import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID ??
  import.meta.env.GOOGLE_IOS_CLIENT_ID ??
  googleWebClientId;

const appleBundleId =
  import.meta.env.VITE_APPLE_BUNDLE_ID ??
  import.meta.env.VITE_APPLE_CLIENT_ID ??
  "com.gitasadhana.ios";

const listeners = new Set<AuthListener>();
let currentSession: AuthSession | null = null;

function isUnauthorizedError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.toLowerCase().includes("unauthorized");
}

function emit() {
  const user = currentSession?.user ?? null;
  listeners.forEach((listener) => listener(user));
}

async function persistSession(session: AuthSession | null) {
  currentSession = session;
  if (!session) {
    await clearSession();
  } else {
    await saveSession(session);
  }
  emit();
}

export async function restoreAuthSession() {
  const session = await loadSession();
  if (!session?.token) {
    await persistSession(null);
    return null;
  }

  try {
    const result = await apiRequest<{ user: AuthUser }>("/auth/me", { token: session.token });
    await persistSession({ ...session, user: result.user });
    return currentSession;
  } catch (error) {
    if (isUnauthorizedError(error)) {
      await persistSession(null);
      return null;
    }

    if (currentSession?.token !== session.token) {
      currentSession = session;
      emit();
    }

    return currentSession;
  }
}

export const auth = {
  get currentUser() {
    return currentSession?.user ?? null;
  },
  onAuthStateChanged(callback: AuthListener) {
    listeners.add(callback);
    callback(currentSession?.user ?? null);
    return () => {
      listeners.delete(callback);
    };
  },
  async signOut() {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {
      // Logout should still clear the local session if the backend is unavailable.
    }
    await persistSession(null);
  },
};

async function exchangeProviderToken(
  endpoint: "/auth/google" | "/auth/apple",
  payload: Record<string, unknown>,
) {
  const response = await apiRequest<SignInResponse>(endpoint, {
    method: "POST",
    body: payload,
    token: null,
  });

  await persistSession({
    token: response.token,
    user: response.user,
  });

  return response;
}

export async function signInWithGoogle() {
  if (!Capacitor.isNativePlatform()) {
    throw new Error("Google sign-in is available in the native app only.");
  }

  const { GoogleAuth } = await import("@codetrix-studio/capacitor-google-auth");
  await GoogleAuth.initialize({
    scopes: ["profile", "email"],
    clientId: googleWebClientId,
    grantOfflineAccess: true,
  });

  const nativeUser = await GoogleAuth.signIn();
  const idToken = nativeUser.authentication?.idToken;
  if (!idToken) {
    throw new Error("Google sign-in did not return an ID token.");
  }

  return exchangeProviderToken("/auth/google", {
    idToken,
    displayName: nativeUser.name ?? "",
    email: nativeUser.email ?? "",
    photoURL: nativeUser.imageUrl ?? "",
  });
}

export async function signInWithApple() {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "ios") {
    throw new Error("Apple sign-in is available on iOS only.");
  }

  const { SignInWithApple } = await import("@capacitor-community/apple-sign-in");
  const result = await SignInWithApple.authorize({
    clientId: appleBundleId,
    redirectURI: import.meta.env.VITE_APPLE_REDIRECT_URI ?? "com.gitasadhana.ios://callback",
    scopes: "email name",
  });

  const identityToken = result.response.identityToken;
  if (!identityToken) {
    throw new Error("Apple sign-in did not return an identity token.");
  }

  const givenName = result.response?.givenName ?? "";
  const familyName = result.response?.familyName ?? "";
  const displayName = `${givenName} ${familyName}`.trim();

  return exchangeProviderToken("/auth/apple", {
    identityToken,
    displayName,
    email: result.response.email ?? "",
    photoURL: "",
  });
}

export async function deleteCurrentUserAccount() {
  await apiRequest("/users/me", { method: "DELETE" });
  await persistSession(null);
}

export async function getCurrentUserState() {
  const session = currentSession ?? (await loadSession());
  if (!session?.token) return null;
  return apiRequest<{ user: AuthUser }>("/auth/me", { token: session.token });
}
