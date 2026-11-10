import type { Env } from "../types";

import { HttpError } from "./errors";


const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const multiline = (s: string) => escape(s).replace(/\n/g, "<br/>");

const shell = (body: string) => `<!DOCTYPE html>
<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#F4F1EA;">
  <div style="max-width:600px;margin:0 auto;padding:20px;background:#FFFFFF;border-radius:16px;">
    <div style="text-align:center;padding:24px 20px 16px 20px;font-family:Georgia,serif;font-size:24px;color:#1B1F2E;">Gita Sadhana</div>
    ${body}
  </div>
</body></html>`;

const card = (content: string) => `<div style="margin:16px 0;padding:24px;background:#FBF9F4;border-radius:12px;">${content}</div>`;
const heading = (t: string) => `<div style="padding:12px 0 6px 0;font-family:Georgia,serif;font-size:22px;color:#1B1F2E;">${t}</div>`;
const para = (t: string) => `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#555A6B;">${t}</div>`;
const label = (t: string) => `<div style="margin-top:12px;font-family:Arial,sans-serif;font-size:12px;color:#A96A1F;text-transform:uppercase;letter-spacing:1px;">${t}</div>`;
const value = (t: string) => `<div style="font-family:Arial,sans-serif;font-size:15px;color:#1B1F2E;font-weight:bold;">${t}</div>`;
const cta = (text: string, url: string) =>
  `<div style="text-align:center;padding:12px 0 4px 0;"><a href="${url}" style="display:inline-block;padding:14px 35px;font-family:Georgia,serif;font-size:16px;color:#ffffff;text-decoration:none;border-radius:999px;background:#2F4A8A;">${text} →</a></div>`;
const shloka = `<div style="font-family:Georgia,serif;font-size:18px;line-height:1.6;color:#1B1F2E;">कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।<br/>मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ।।</div>`;

// Cloudflare Email Service over its REST API, with a token that can only send email
// (the Worker deliberately has no send_email binding).
async function send(env: Env, to: string, subject: string, html: string, replyTo?: string) {
  if (!env.CLOUDFLARE_EMAIL_TOKEN) throw new HttpError(503, "Email is not configured.");
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/email/sending/send`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.CLOUDFLARE_EMAIL_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      to,
      from: { address: env.EMAIL_FROM, name: "Gita Sadhana" },
      reply_to: replyTo ?? env.EMAIL_REPLY_TO,
      subject,
      html,
    }),
  });
  if (!res.ok) {
    await res.body?.cancel();
    throw new HttpError(502, "Failed to send email.");
  }
}

export async function sendContactEmail(env: Env, email: string, message: string) {
  await send(
    env,
    env.ADMIN_EMAIL,
    `Contact Form: Message from ${email}`,
    shell(heading("New Contact Message") + card(label("From") + value(escape(email)) + label("Message") + para(multiline(message)))),
    email,
  );
  await send(
    env,
    email,
    "We received your message — Gita Sadhana",
    shell(
      heading("Thank you for reaching out") +
        para("We have received your message and will get back to you within 1-2 business days.") +
        cta("Continue Reading", env.APP_URL),
    ),
  );
}

export async function sendCorrectionEmail(
  env: Env,
  p: { language: string; chapter: string; verse: string; message: string; email?: string },
) {
  await send(
    env,
    env.ADMIN_EMAIL,
    `Correction Report: ${p.language} | Ch ${p.chapter}.${p.verse}`,
    shell(
      heading("Verse Correction Report") +
        card(
          label("Language") +
            value(escape(p.language)) +
            label("Chapter / Verse") +
            value(`${escape(p.chapter)}.${escape(p.verse)}`) +
            label("Reported Issue") +
            para(multiline(p.message)) +
            (p.email ? label("Reported by") + value(escape(p.email)) : ""),
        ),
    ),
    p.email,
  );
  if (p.email) {
    await send(
      env,
      p.email,
      "Your correction has been submitted — Gita Sadhana",
      shell(
        heading("Thank you for your contribution") +
          para(`We have received your correction report for Chapter ${escape(p.chapter)}, Verse ${escape(p.verse)} (${escape(p.language)}).`) +
          cta("Continue Reading", env.APP_URL),
      ),
    );
  }
}

export async function sendNewsletterEmail(env: Env, email: string, frequency: "daily" | "weekly" | "monthly") {
  const f = { daily: "Daily", weekly: "Weekly", monthly: "Monthly" }[frequency];
  await send(
    env,
    email,
    `You're subscribed to ${f} Wisdom — Gita Sadhana`,
    shell(heading("Timeless wisdom. For everyday life.") + para(`You are now subscribed to our ${f} digest.`) + card(shloka) + cta("Continue Reading", env.APP_URL)),
    env.ADMIN_EMAIL,
  );
  await send(
    env,
    env.ADMIN_EMAIL,
    `New Newsletter Subscriber: ${email} (${f})`,
    shell(heading("New Subscriber") + card(label("Email") + value(escape(email)) + label("Frequency") + value(f))),
  );
}

export async function sendWelcomeEmail(env: Env, email: string, name: string) {
  await send(
    env,
    email,
    "Welcome to Gita Sadhana — Your Journey Begins",
    shell(
      heading(`Namaste, ${escape(name || "Seeker")} 🙏`) +
        para("Welcome to Gita Sadhana. You have taken the first step on a timeless journey through the wisdom of the Bhagavad Gita.") +
        card(shloka) +
        cta("Continue Reading", env.APP_URL),
    ),
  );
}
