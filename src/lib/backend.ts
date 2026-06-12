import { Capacitor } from "@capacitor/core";
import { loadSession } from "./session-storage";

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export type AuthUser = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  providerId?: string;
  emailVerified?: boolean;
  metadata: {
    creationTime: string;
    lastSignInTime: string;
  };
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (configured) return trimTrailingSlash(configured);
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android") {
    return "http://10.0.2.2:5001";
  }
  return "http://localhost:5001";
}

export async function apiRequest<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    token?: string | null;
    headers?: HeadersInit;
  } = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const token = options.token ?? (await loadSession())?.token ?? null;
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload?.message === "string"
      ? payload.message
      : typeof payload?.error === "string"
        ? payload.error
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}
