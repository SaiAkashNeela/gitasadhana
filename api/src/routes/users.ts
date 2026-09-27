import { Hono } from "hono";
import { z } from "zod";

import { deleteUser, findUserById, updateProfile } from "../lib/db";
import { unauthorized } from "../lib/errors";
import { requireUser } from "../lib/auth-middleware";
import { mergeUserProfile, replaceUserProfile } from "../lib/profile";
import type { AppVariables, Env } from "../types";

export const users = new Hono<{ Bindings: Env; Variables: AppVariables }>();
users.use("*", requireUser);

const note = z.object({ id: z.string(), verseId: z.string(), title: z.string(), body: z.string(), date: z.string() });
const historyItem = z.object({ id: z.string(), chapter: z.number(), verse: z.number(), date: z.string() });

const syncBody = z.object({
  /** "merge" (default, used at sign-in) unions lists; "replace" makes this device's lists the truth. */
  mode: z.enum(["merge", "replace"]).optional().default("merge"),
  name: z.string().optional(),
  email: z.string().optional(),
  streak: z.number().optional(),
  versesRead: z.number().optional(),
  bookmarks: z.array(z.string()).optional(),
  notes: z.array(note).optional(),
  history: z.array(historyItem).optional(),
  favorites: z.array(z.string()).optional(),
  completedVerses: z.array(z.string()).optional(),
  readVerses: z.array(z.string()).optional(),
  readDates: z.array(z.string()).optional(),
  downloadedVerses: z.array(z.string()).optional(),
  downloadedChapters: z.array(z.number()).optional(),
  isGitaDownloaded: z.boolean().optional(),
  language: z.string().optional(),
  minutes: z.number().optional(),
  createdAt: z.string().optional(),
});

users.get("/me", async (c) => {
  const user = await findUserById(c.env.DB, c.get("userId"));
  if (!user) throw unauthorized();
  return c.json({ profile: user.profile, authUser: user.authUser });
});

users.post("/me/sync", async (c) => {
  const user = await findUserById(c.env.DB, c.get("userId"));
  if (!user) throw unauthorized();
  const { mode, ...patch } = syncBody.parse(await c.req.json());
  const now = new Date().toISOString();
  const apply = mode === "replace" ? replaceUserProfile : mergeUserProfile;
  const profile = apply(user.profile, { ...patch, updatedAt: now });
  await updateProfile(c.env.DB, user.id, profile, now);
  return c.json({ success: true, profile });
});

users.delete("/me", async (c) => {
  const user = await findUserById(c.env.DB, c.get("userId"));
  if (!user) throw unauthorized();
  await deleteUser(c.env.DB, user.id);
  return c.json({ success: true });
});
