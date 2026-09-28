import { Hono } from "hono";
import { cors } from "hono/cors";
import { ZodError, z } from "zod";

import { optionalUserId } from "./lib/auth-middleware";
import { HttpError } from "./lib/errors";
import { handleGitaChat } from "./lib/gita-ai";
import { audio } from "./routes/audio";
import { auth } from "./routes/auth";
import { chat } from "./routes/chat";
import { mail } from "./routes/mail";
import { users } from "./routes/users";
import type { AppVariables, Env } from "./types";

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>();

// Native apps send no Origin; the web app can be served from anywhere during development.
app.use("*", cors({ origin: "*", allowHeaders: ["Content-Type", "Authorization", "x-guest-id", "Range"], allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"] }));

app.get("/health", (c) => c.json({ ok: true }));
app.route("/auth", auth);
app.route("/users", users);
app.route("/chat", chat);
app.route("/mail", mail);
app.route("/audio", audio);

const guestKey = (raw: string) =>
  raw.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "anonymous";

app.post("/ai/chat", async (c) => {
  const body = z
    .object({
      message: z.string().default(""),
      history: z.array(z.object({ role: z.enum(["user", "model"]), text: z.string() })).default([]),
      language: z.string().optional(),
    })
    .parse(await c.req.json());
  const userId = await optionalUserId(c);
  // Guests are limited per device id, falling back to their IP address.
  const identity = userId ?? `guest:${guestKey(c.req.header("x-guest-id") ?? c.req.header("CF-Connecting-IP") ?? "anonymous")}`;
  return c.json(await handleGitaChat(c.env, { userId: identity, message: body.message, history: body.history, language: body.language ?? "en" }));
});

app.notFound((c) => c.json({ message: "Not found" }, 404));

app.onError((err, c) => {
  if (err instanceof HttpError) return c.json({ message: err.message }, err.status);
  if (err instanceof ZodError || err instanceof SyntaxError) return c.json({ message: "Invalid request" }, 400);
  console.error(err);
  return c.json({ message: "Internal server error" }, 500);
});

export default app;
