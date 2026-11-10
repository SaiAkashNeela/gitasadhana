import { type Context, Hono } from "hono";
import { z } from "zod";

import { incrementDailyCount } from "../lib/db";
import { HttpError } from "../lib/errors";
import { sendContactEmail, sendCorrectionEmail, sendNewsletterEmail, sendWelcomeEmail } from "../lib/mail";
import type { AppVariables, Env } from "../types";

export const mail = new Hono<{ Bindings: Env; Variables: AppVariables }>();

// These routes need no sign-in and mail the address they are given, so cap them per IP and per recipient.
const MAILS_PER_IP_PER_DAY = 10;
const MAILS_PER_RECIPIENT_PER_DAY = 3;

async function throttle(c: Context<{ Bindings: Env; Variables: AppVariables }>, to?: string) {
  const day = new Date().toISOString().slice(0, 10);
  const ip = c.req.header("CF-Connecting-IP") ?? "anonymous";
  const tooMany =
    (await incrementDailyCount(c.env.DB, `mail-ip:${ip}`, day)) > MAILS_PER_IP_PER_DAY ||
    (to !== undefined && (await incrementDailyCount(c.env.DB, `mail-to:${to.toLowerCase()}`, day)) > MAILS_PER_RECIPIENT_PER_DAY);
  if (tooMany) throw new HttpError(429, "Too many emails today. Please try again tomorrow.");
}

mail.post("/contact", async (c) => {
  const b = z.object({ email: z.string().email(), message: z.string().min(1).max(5000) }).parse(await c.req.json());
  await throttle(c, b.email);
  await sendContactEmail(c.env, b.email, b.message);
  return c.json({ success: true });
});

mail.post("/correction", async (c) => {
  const b = z
    .object({
      // Clients send a language code and numeric chapter/verse; these also go into the subject line.
      language: z.string().regex(/^[a-z]{2,3}$/),
      chapter: z.string().regex(/^\d{1,2}$/),
      verse: z.string().regex(/^\d{1,3}$/),
      message: z.string().min(1).max(5000),
      email: z.string().email().optional(),
    })
    .parse(await c.req.json());
  await throttle(c, b.email);
  await sendCorrectionEmail(c.env, b);
  return c.json({ success: true });
});

mail.post("/newsletter", async (c) => {
  const b = z.object({ email: z.string().email(), frequency: z.enum(["daily", "weekly", "monthly"]) }).parse(await c.req.json());
  await throttle(c, b.email);
  await sendNewsletterEmail(c.env, b.email, b.frequency);
  return c.json({ success: true });
});

mail.post("/welcome", async (c) => {
  const b = z.object({ email: z.string().email(), name: z.string().max(100).optional().default("Seeker") }).parse(await c.req.json());
  await throttle(c, b.email);
  await sendWelcomeEmail(c.env, b.email, b.name);
  return c.json({ success: true });
});
