import * as SecureStore from "expo-secure-store";

import type { AuthSession } from "./api";
import { storage } from "./storage";

const SESSION_KEY = "gita_auth_session";
const isWeb = process.env.EXPO_OS === "web";

/** Auth token lives in the Keychain / Keystore on device, localStorage on web. */
export async function loadSession(): Promise<AuthSession | null> {
  try {
    const raw = isWeb ? storage.getString(SESSION_KEY) : await SecureStore.getItemAsync(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export async function saveSession(session: AuthSession) {
  const raw = JSON.stringify(session);
  if (isWeb) storage.set(SESSION_KEY, raw);
  else await SecureStore.setItemAsync(SESSION_KEY, raw);
}

export async function clearSession() {
  if (isWeb) storage.remove(SESSION_KEY);
  else await SecureStore.deleteItemAsync(SESSION_KEY);
}
