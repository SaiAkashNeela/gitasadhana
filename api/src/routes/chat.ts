import { Hono } from "hono";
import { z } from "zod";

import { findUserById, getChat, putChat } from "../lib/db";
import { unauthorized } from "../lib/errors";
import { requireUser } from "../lib/auth-middleware";
import type { AppVariables, Env } from "../types";

export const chat = new Hono<{ Bindings: Env; Variables: AppVariables }>();
chat.use("*", requireUser);

const message = z.object({ id: z.string(), role: z.enum(["user", "model"]), text: z.string(), ts: z.number() });

chat.get("/me", async (c) => {
  const user = await findUserById(c.env.DB, c.get("userId"));
  if (!user) throw unauthorized();
  const saved = await getChat(c.env.DB, user.id);
  return c.json({ messages: saved?.messages ?? [], language: saved?.language ?? user.profile.language });
});

chat.put("/me", async (c) => {
  const user = await findUserById(c.env.DB, c.get("userId"));
  if (!user) throw unauthorized();
  const body = z.object({ messages: z.array(message).max(1000), language: z.string().optional() }).parse(await c.req.json());
  await putChat(c.env.DB, user.id, body.messages, body.language ?? user.profile.language, new Date().toISOString());
  return c.json({ success: true, messages: body.messages });
});
