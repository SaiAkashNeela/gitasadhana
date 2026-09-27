import nodemailer from "nodemailer";
import { config } from "../config.js";

const ADMIN_EMAIL = "hello@gitasadhana.com";

export function resolveMailTransportMode(nodeEnv = process.env.NODE_ENV || "production") {
  return nodeEnv === "development" ? "maildev" : "ses";
}

function getEmailApiKey(): string {
  if (!config.emailApiKey) {
    throw new Error("EMAIL_API_KEY environment variable is not set.");
  }
  return config.emailApiKey;
}

function emailShell(bodyContent: string): string {
  return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background-color:#F8F4EC;">
  <div style="max-width:600px;margin:0 auto;padding:20px;background:#FFFDF8;border:1px solid #EBDDCB;border-radius:16px;">
    <div style="text-align:center;padding:24px 20px 16px 20px;font-family:Georgia,serif;font-size:24px;color:#4A3320;">Gita Sadhana</div>
    ${bodyContent}
  </div>
</body>
</html>`;
}

function cardRow(content: string) {
  return `<div style="margin:16px 0;padding:24px;background:#FDF7EE;border:1px solid #EBDDCB;border-radius:12px;">${content}</div>`;
}

function ctaRow(label: string, url: string) {
  return `<div style="text-align:center;padding:12px 0 4px 0;"><a href="${url}" target="_blank" style="display:inline-block;padding:14px 35px;font-family:Georgia,serif;font-size:16px;color:#ffffff;text-decoration:none;border-radius:8px;background:#B37D4E;border:1px solid #A66D3D;">${label} →</a></div>`;
}

async function sendEmail(to: string, subject: string, html: string, replyTo?: string) {
  if (resolveMailTransportMode(config.nodeEnv) === "maildev") {
    const transporter = nodemailer.createTransport({
      host: process.env.MAILDEV_HOST || "maildev",
      port: Number(process.env.MAILDEV_PORT || 1025),
      secure: false,
      ignoreTLS: true,
    });

    await transporter.sendMail({
      to,
      from: config.emailFrom,
      subject,
      html,
      replyTo: replyTo || config.emailReplyTo,
    });
    return;
  }

  const response = await fetch("https://ses-api.geeksdesigns.com/v1/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getEmailApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to,
      subject,
      body: html,
      from: config.emailFrom,
      ...(replyTo ? { replyTo } : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send email: ${response.status} ${response.statusText} - ${errorText}`);
  }
}

export async function sendContactEmail(email: string, message: string) {
  await sendEmail(
    ADMIN_EMAIL,
    `Contact Form: Message from ${email}`,
    emailShell(`
      <div style="padding:12px 0 6px 0;font-family:Georgia,serif;font-size:22px;color:#4A3320;">New Contact Message</div>
      ${cardRow(`
        <div style="font-family:Arial,sans-serif;font-size:13px;color:#9A7B5E;text-transform:uppercase;letter-spacing:1px;">From</div>
        <div style="margin:0 0 18px 0;font-family:Arial,sans-serif;font-size:15px;color:#4A3320;font-weight:bold;">${email}</div>
        <div style="font-family:Arial,sans-serif;font-size:13px;color:#9A7B5E;text-transform:uppercase;letter-spacing:1px;">Message</div>
        <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#5C4A3D;">${message.replace(/\n/g, "<br/>")}</div>
      `)}
    `),
    email,
  );

  await sendEmail(
    email,
    "We received your message — Gita Sadhana",
    emailShell(`
      <div style="padding:12px 0 6px 0;font-family:Georgia,serif;font-size:22px;color:#4A3320;">Thank you for reaching out</div>
      <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#5C4A3D;">We have received your message and will get back to you within 1-2 business days.</div>
      ${cardRow(`<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#5C4A3D;font-style:italic;">"${message.replace(/\n/g, "<br/>")}"</div>`)}
      ${ctaRow("Continue Reading", config.appUrl)}
    `),
  );

  return { success: true };
}

export async function sendCorrectionEmail(payload: {
  language: string;
  chapter: string;
  verse: string;
  message: string;
  email?: string;
}) {
  const { language, chapter, verse, message, email } = payload;
  await sendEmail(
    ADMIN_EMAIL,
    `Correction Report: ${language} | Ch ${chapter}.${verse}`,
    emailShell(`
      <div style="padding:12px 0 6px 0;font-family:Georgia,serif;font-size:22px;color:#4A3320;">Verse Correction Report</div>
      ${cardRow(`
        <div style="font-family:Arial,sans-serif;font-size:12px;color:#9A7B5E;text-transform:uppercase;letter-spacing:1px;">Language</div>
        <div style="font-family:Arial,sans-serif;font-size:15px;color:#4A3320;font-weight:bold;">${language}</div>
        <div style="margin-top:12px;font-family:Arial,sans-serif;font-size:12px;color:#9A7B5E;text-transform:uppercase;letter-spacing:1px;">Chapter / Verse</div>
        <div style="font-family:Arial,sans-serif;font-size:15px;color:#4A3320;font-weight:bold;">${chapter}.${verse}</div>
        <div style="margin-top:12px;font-family:Arial,sans-serif;font-size:12px;color:#9A7B5E;text-transform:uppercase;letter-spacing:1px;">Reported Issue</div>
        <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#5C4A3D;">${message.replace(/\n/g, "<br/>")}</div>
        ${email ? `<div style="margin-top:12px;font-family:Arial,sans-serif;font-size:12px;color:#9A7B5E;">Reported by: <span style="color:#4A3320;">${email}</span></div>` : ""}
      `)}
    `),
    email,
  );

  if (email) {
    await sendEmail(
      email,
      "Your correction has been submitted — Gita Sadhana",
      emailShell(`
        <div style="padding:12px 0 6px 0;font-family:Georgia,serif;font-size:22px;color:#4A3320;">Thank you for your contribution</div>
        <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#5C4A3D;">We have received your correction report for Chapter ${chapter}, Verse ${verse} (${language}).</div>
        ${cardRow(`<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#5C4A3D;font-style:italic;">"${message.replace(/\n/g, "<br/>")}"</div>`)}
        ${ctaRow("Continue Reading", config.appUrl)}
      `),
    );
  }

  return { success: true };
}

export async function sendNewsletterEmail(email: string, frequency: "daily" | "weekly" | "monthly") {
  const frequencyLabel: Record<string, string> = {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
  };

  await sendEmail(
    email,
    `You're subscribed to ${frequencyLabel[frequency]} Wisdom — Gita Sadhana`,
    emailShell(`
      <div style="padding:12px 0 6px 0;font-family:Georgia,serif;font-size:22px;color:#4A3320;">Timeless wisdom. For everyday life.</div>
      <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#5C4A3D;">You are now subscribed to our ${frequencyLabel[frequency]} digest.</div>
      ${cardRow(`<div style="font-family:Georgia,serif;font-size:18px;line-height:1.6;color:#4A3320;">कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।<br/>मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ।।</div>`)}
      ${ctaRow("Continue Reading", config.appUrl)}
    `),
    ADMIN_EMAIL,
  );

  await sendEmail(
    ADMIN_EMAIL,
    `New Newsletter Subscriber: ${email} (${frequencyLabel[frequency]})`,
    emailShell(`
      <div style="padding:12px 0 6px 0;font-family:Georgia,serif;font-size:22px;color:#4A3320;">New Subscriber</div>
      ${cardRow(`
        <div style="font-family:Arial,sans-serif;font-size:13px;color:#9A7B5E;text-transform:uppercase;letter-spacing:1px;">Email</div>
        <div style="font-family:Arial,sans-serif;font-size:15px;color:#4A3320;font-weight:bold;">${email}</div>
        <div style="margin-top:12px;font-family:Arial,sans-serif;font-size:13px;color:#9A7B5E;text-transform:uppercase;letter-spacing:1px;">Frequency</div>
        <div style="font-family:Arial,sans-serif;font-size:15px;color:#4A3320;font-weight:bold;">${frequencyLabel[frequency]}</div>
      `)}
    `),
  );

  return { success: true };
}

export async function sendWelcomeEmail(email: string, name: string) {
  const displayName = name || "Seeker";
  await sendEmail(
    email,
    "Welcome to Gita Sadhana — Your Journey Begins",
    emailShell(`
      <div style="padding:12px 0 6px 0;font-family:Georgia,serif;font-size:22px;color:#4A3320;">Namaste, ${displayName} 🙏</div>
      <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#5C4A3D;">Welcome to Gita Sadhana. You have taken the first step on a timeless journey through the wisdom of the Bhagavad Gita.</div>
      ${cardRow(`<div style="font-family:Georgia,serif;font-size:18px;line-height:1.6;color:#4A3320;">कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।<br/>मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ।।</div>`)}
      ${ctaRow("Continue Reading", config.appUrl)}
    `),
  );

  return { success: true };
}
