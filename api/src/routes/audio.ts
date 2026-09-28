import { Hono } from "hono";

import type { AppVariables, Env } from "../types";

// Recitations live on gita.saiakash.dev, which sends no CORS headers: browsers can play them
// in <audio> but can't fetch them to save for offline listening. This route streams the same
// file with CORS and Range support, cached at Cloudflare's edge.
const UPSTREAM = "https://gita.saiakash.dev";
const LANGS = new Set(["en", "hi", "te", "ta", "kn", "ml", "bn", "gu", "mr", "pa", "ne", "or"]);

export const audio = new Hono<{ Bindings: Env; Variables: AppVariables }>();

audio.get("/:lang/:file", async (c) => {
  const { lang, file } = c.req.param();
  if (!LANGS.has(lang) || !/^\d{1,2}_\d{1,2}\.wav$/.test(file)) return c.json({ message: "Not found" }, 404);

  const headers = new Headers();
  const range = c.req.header("Range");
  if (range) headers.set("Range", range);
  const upstream = await fetch(`${UPSTREAM}/${lang}/complete/${file}`, {
    headers,
    cf: { cacheEverything: true, cacheTtl: 60 * 60 * 24 * 30 },
  });

  const out = new Headers();
  for (const h of ["Content-Type", "Content-Length", "Content-Range", "Accept-Ranges", "ETag", "Last-Modified"]) {
    const v = upstream.headers.get(h);
    if (v) out.set(h, v);
  }
  out.set("Access-Control-Allow-Origin", "*");
  out.set("Access-Control-Expose-Headers", "Content-Length, Content-Range, Accept-Ranges");
  out.set("Cache-Control", "public, max-age=2592000, immutable");
  return new Response(upstream.body, { status: upstream.status, headers: out });
});
