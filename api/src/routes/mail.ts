import { Hono } from "hono";
import { z } from "zod";

import { sendContactEmail, sendCorrectionEmail, sendNewsletterEmail, sendWelcomeEmail } from "../lib/mail";
import type { AppVariables, Env } from "../types";

export const mail = new Hono<{ Bindings: Env; Variables: AppVariables }>();

mail.post("/contact", async (c) => {
  const b = z.object({ email: z.string().email(), message: z.string().min(1).max(5000) }).parse(await c.req.json());
  await sendContactEmail(c.env, b.email, b.message);
  return c.json({ success: true });
});

mail.post("/correction", async (c) => {
  const b = z
    .object({
      language: z.string().min(1),
      chapter: z.string().min(1),
      verse: z.string().min(1),
      message: z.string().min(1).max(5000),
      email: z.string().email().optional(),
    })
    .parse(await c.req.json());
  await sendCorrectionEmail(c.env, b);
  return c.json({ success: true });
});

mail.post("/newsletter", async (c) => {
  const b = z.object({ email: z.string().email(), frequency: z.enum(["daily", "weekly", "monthly"]) }).parse(await c.req.json());
  await sendNewsletterEmail(c.env, b.email, b.frequency);
  return c.json({ success: true });
});

mail.post("/welcome", async (c) => {
  const b = z.object({ email: z.string().email(), name: z.string().optional().default("Seeker") }).parse(await c.req.json());
  await sendWelcomeEmail(c.env, b.email, b.name);
  return c.json({ success: true });
});
