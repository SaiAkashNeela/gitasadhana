import { afterEach, describe, expect, it, vi } from "vitest";

import app from "../src/index";

// Just enough D1 for the daily counter upsert.
function fakeDb() {
  const counts = new Map<string, number>();
  return {
    prepare: () => ({
      bind: (key: string, day: string) => ({
        first: async () => {
          const n = (counts.get(`${key}|${day}`) ?? 0) + 1;
          counts.set(`${key}|${day}`, n);
          return { count: n };
        },
      }),
    }),
  };
}

function env() {
  let aiCalls = 0;
  const reply = { candidates: [{ content: { parts: [{ text: "ok" }] } }] };
  return {
    get aiCalls() {
      return aiCalls;
    },
    bindings: {
      DB: fakeDb(),
      AI: { gateway: () => ({ run: async () => (aiCalls++, Response.json(reply)) }) },
      AI_DAILY_LIMIT: "1",
      EMAIL_API_KEY: "dummy",
      ADMIN_EMAIL: "admin@example.test",
      EMAIL_FROM: "from@example.test",
      APP_URL: "https://example.test",
    },
  };
}

const post = (path: string, body: unknown, bindings: object, headers: Record<string, string> = {}) =>
  app.request(path, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) }, bindings);

afterEach(() => vi.unstubAllGlobals());

describe("Gita AI quota", () => {
  it("stops concurrent requests from one key at the limit", async () => {
    const e = env();
    const res = await Promise.all([1, 2, 3].map(() => post("/ai/chat", { message: "hi" }, e.bindings, { "x-guest-id": "g1" })));
    const bodies = await Promise.all(res.map((r) => r.json() as Promise<{ limitReached: boolean }>));
    expect(bodies.filter((b) => !b.limitReached)).toHaveLength(1);
    expect(e.aiCalls).toBe(1);
  });

  it("caps guests per IP even when they rotate x-guest-id", async () => {
    const e = env();
    let allowed = 0;
    for (let i = 0; i < 15; i++) {
      const r = await post("/ai/chat", { message: "hi" }, e.bindings, { "x-guest-id": `g${i}`, "CF-Connecting-IP": "203.0.113.7" });
      if (!((await r.json()) as { limitReached: boolean }).limitReached) allowed++;
    }
    expect(allowed).toBe(10); // limit 1 × 10 devices per IP
  });
});

describe("mail routes", () => {
  it("reject CR/LF in correction fields that reach the subject", async () => {
    const r = await post("/mail/correction", { language: "en\r\nBcc: x@example.test", chapter: "1", verse: "1", message: "m" }, env().bindings);
    expect(r.status).toBe(400);
  });

  it("throttle mail to one recipient", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}")));
    const e = env();
    const statuses = [];
    for (let i = 0; i < 4; i++) statuses.push((await post("/mail/welcome", { email: "v@example.test" }, e.bindings)).status);
    expect(statuses).toEqual([200, 200, 200, 429]);
  });
});
