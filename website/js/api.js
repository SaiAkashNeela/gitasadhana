import { API_BASE } from "./config.js";
import { store } from "./store.js";

export const SESSION_KEY = "gita_auth_session";
export const session = () => store.get(SESSION_KEY, null);

/** JSON request to the Gita Sadhana API with the saved session token. */
export async function api(path, { method = "GET", body, token, headers = {}, keepalive = false } = {}) {
  const h = { ...headers };
  if (body !== undefined) h["Content-Type"] = "application/json";
  const bearer = token === undefined ? session()?.token : token;
  if (bearer) h.Authorization = `Bearer ${bearer}`;
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { method, headers: h, keepalive, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new Error("offline");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(typeof data.message === "string" ? data.message : `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}
