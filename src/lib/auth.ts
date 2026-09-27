import { apiRequest, type AuthSession, type AuthUser } from "./api";
import { getProviderCredential, providerSignOut, type Provider } from "./auth-providers";
import { clearSession, loadSession, saveSession } from "./session";

type Listener = (user: AuthUser | null) => void;
type SignInResponse = { success: true; isNewUser: boolean; user: AuthUser; token: string };

const listeners = new Set<Listener>();
let current: AuthSession | null = null;

function emit() {
  const user = current?.user ?? null;
  listeners.forEach((l) => l(user));
}

async function persist(session: AuthSession | null) {
  current = session;
  if (session) await saveSession(session);
  else await clearSession();
  emit();
}

/** Validates the stored token with the backend; keeps it when merely offline. */
export async function restoreAuthSession() {
  const session = await loadSession();
  if (!session?.token) {
    current = null;
    emit();
    return null;
  }
  current = session;
  emit();
  try {
    const result = await apiRequest<{ user: AuthUser }>("/auth/me", { token: session.token });
    await persist({ ...session, user: result.user });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.toLowerCase().includes("unauthorized")) await persist(null);
  }
  return current;
}

export const auth = {
  get currentUser() {
    return current?.user ?? null;
  },
  onAuthStateChanged(cb: Listener) {
    listeners.add(cb);
    cb(current?.user ?? null);
    return () => {
      listeners.delete(cb);
    };
  },
  async signOut() {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {
      // Clear locally even when the backend is unreachable.
    }
    await providerSignOut().catch(() => {});
    await persist(null);
  },
};

export async function signIn(provider: Provider) {
  const credential = await getProviderCredential(provider);
  const endpoint = provider === "google" ? "/auth/google" : "/auth/apple";
  const body =
    provider === "google"
      ? { idToken: credential.token, displayName: credential.displayName, email: credential.email, photoURL: credential.photoURL }
      : { identityToken: credential.token, displayName: credential.displayName, email: credential.email, photoURL: "" };
  const response = await apiRequest<SignInResponse>(endpoint, { method: "POST", body, token: null });
  await persist({ token: response.token, user: response.user });
  return response;
}

export async function deleteCurrentUserAccount() {
  await apiRequest("/users/me", { method: "DELETE" });
  await persist(null);
}

export { isAppleSignInAvailable } from "./auth-providers";
