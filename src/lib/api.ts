import { loadSession } from "./session";

export type AuthUser = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  providerId?: string;
  emailVerified?: boolean;
  metadata: { creationTime: string; lastSignInTime: string };
};

export type AuthSession = { token: string; user: AuthUser };

const trim = (v: string) => v.replace(/\/+$/, "");

export function getApiBaseUrl() {
  const os = process.env.EXPO_OS;
  const android = process.env.EXPO_PUBLIC_ANDROID_API_BASE_URL;
  const ios = process.env.EXPO_PUBLIC_IOS_API_BASE_URL;
  const shared = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (os === "android" && android) return trim(android);
  if (os === "ios" && ios) return trim(ios);
  if (shared) return trim(shared);
  return os === "android" ? "http://10.0.2.2:5001" : "http://localhost:5001";
}

/** Same contract as the Capacitor app's apiRequest: JSON in, JSON out, bearer token. */
export async function apiRequest<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string | null; headers?: Record<string, string> } = {},
): Promise<T> {
  const headers: Record<string, string> = { ...options.headers };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  const token = options.token === undefined ? (await loadSession())?.token ?? null : options.token;
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error("Network request failed — you appear to be offline.");
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof payload?.message === "string"
        ? payload.message
        : typeof payload?.error === "string"
          ? payload.error
          : `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return payload as T;
}
