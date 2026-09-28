// Offline recitations: saved in Cache Storage through the API's CORS audio proxy.
import { AUDIO_PROXY, RECITED } from "./config.js";

const CACHE = "gita-audio-v1";
export const supported = "caches" in window;
export const audioLang = (code) => (RECITED.includes(code) ? code : "en");
const url = (code, id) => `${AUDIO_PROXY}/${audioLang(code)}/${id.replace(".", "_")}.wav`;

const open = () => caches.open(CACHE);

export async function isSaved(code, id) {
  if (!supported) return false;
  return !!(await (await open()).match(url(code, id)));
}

/** Object URL for a saved recitation, or null. Callers revoke it when done. */
export async function savedBlobUrl(code, id) {
  if (!supported) return null;
  const res = await (await open()).match(url(code, id));
  return res ? URL.createObjectURL(await res.blob()) : null;
}

export async function saveVerse(code, id, onProgress, signal) {
  const cache = await open();
  if (await cache.match(url(code, id))) return;
  const res = await fetch(url(code, id), { signal });
  if (!res.ok || !res.body) throw new Error(`download failed (${res.status})`);
  const total = Number(res.headers.get("Content-Length")) || 0;
  const reader = res.body.getReader();
  const chunks = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    got += value.length;
    if (total && onProgress) onProgress(got / total);
  }
  const blob = new Blob(chunks, { type: "audio/wav" });
  await cache.put(url(code, id), new Response(blob, { headers: { "Content-Type": "audio/wav", "Content-Length": String(blob.size) } }));
}

export async function deleteVerse(code, id) {
  await (await open()).delete(url(code, id));
}

/** Saved verse ids for a language, with their total size in bytes. */
export async function library(code) {
  if (!supported) return { ids: [], bytes: 0 };
  const cache = await open();
  const prefix = `${AUDIO_PROXY}/${audioLang(code)}/`;
  const keys = (await cache.keys()).filter((r) => r.url.startsWith(prefix));
  let bytes = 0;
  const ids = [];
  for (const r of keys) {
    ids.push(r.url.slice(prefix.length).replace(".wav", "").replace("_", "."));
    const res = await cache.match(r);
    bytes += Number(res?.headers.get("Content-Length")) || 0;
  }
  return { ids, bytes };
}

/** Downloads several verses, three at a time. Resolves with the number that failed. */
export async function saveMany(code, ids, onProgress, signal) {
  const queue = [...ids];
  let done = 0;
  let failed = 0;
  const worker = async () => {
    while (queue.length && !signal?.aborted) {
      const id = queue.shift();
      try {
        await saveVerse(code, id, null, signal);
      } catch {
        if (!signal?.aborted) failed++;
      }
      done++;
      onProgress?.(done / ids.length);
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  return failed;
}
