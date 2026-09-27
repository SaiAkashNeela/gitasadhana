import type { Env } from "../types";

import { getAiUsage, incrementAiUsage } from "./db";
import { HttpError } from "./errors";

const MAX_MESSAGE_LENGTH = 2000;

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English", hi: "Hindi", sa: "Sanskrit", te: "Telugu", ta: "Tamil", kn: "Kannada",
  ml: "Malayalam", bn: "Bengali", gu: "Gujarati", mr: "Marathi", pa: "Punjabi", ne: "Nepali",
};

const sanitise = (s: string) => s.replace(/\0/g, "").replace(/\s{10,}/g, " ").trim();

// The same system prompt the Node backend used.
const systemInstruction = (language: string) => `You are Gita AI, a calm, wise, and devotional spiritual assistant built into the Gita Sadhana app.

IDENTITY:
- You are Gita AI. You are not GPT, Claude, Gemini, or any other general-purpose AI.
- Never claim to be human.

ALLOWED TOPICS:
1. Bhagavad Gita: verses, chapters, translations, commentaries, philosophy, context, and teachings
2. Lord Krishna: his life, divine nature, teachings, and significance in the Gita
3. Gita Sadhana app: features, navigation, bookmarks, notes, reading streaks, downloads, settings, and account help

OUT-OF-SCOPE RULE:
- Politely decline with: "My purpose is to guide you through the wisdom of the Bhagavad Gita and Lord Krishna. I'm not able to help with that topic, but I'm here if you have spiritual questions or need app guidance."

LANGUAGE RULE:
- Respond ONLY in ${LANGUAGE_NAMES[language] ?? "English"}.`;

export async function handleGitaChat(
  env: Env,
  p: { userId: string; message: string; history: { role: "user" | "model"; text: string }[]; language: string },
) {
  const message = sanitise(p.message);
  if (!message) throw new HttpError(400, "Message is required.");
  if (message.length > MAX_MESSAGE_LENGTH) throw new HttpError(400, "Message too long.");

  const day = new Date().toISOString().slice(0, 10);
  const limit = Number(env.AI_DAILY_LIMIT) || 30;
  if ((await getAiUsage(env.DB, p.userId, day)) >= limit) return { reply: null, limitReached: true };
  await incrementAiUsage(env.DB, p.userId, day);

  const contents = [
    ...p.history.slice(-20).map((h) => ({ role: h.role, parts: [{ text: sanitise(h.text).slice(0, MAX_MESSAGE_LENGTH) }] })),
    { role: "user", parts: [{ text: message }] },
  ];

  // Vertex AI via AI Gateway: the gateway adds the stored service-account credentials, and
  // every call shows up in the gateway's logs and analytics.
  let res: Response;
  try {
    res = await env.AI.gateway(env.AI_GATEWAY_ID).run({
      provider: "google-vertex-ai",
      endpoint: `v1/projects/${env.VERTEX_PROJECT_ID}/locations/${env.VERTEX_LOCATION}/publishers/google/models/${env.GEMINI_MODEL_ID}:generateContent`,
      headers: { "Content-Type": "application/json", "cf-aig-metadata": { app: "gita-sadhana", user: p.userId.startsWith("guest:") ? "guest" : "member" } },
      query: { systemInstruction: { parts: [{ text: systemInstruction(p.language) }] }, contents },
    });
  } catch {
    throw new HttpError(503, "Service temporarily unavailable.");
  }
  if (res.status === 429) throw new HttpError(429, "Rate limit reached. Please try again shortly.");
  if (!res.ok) throw new HttpError(502, "AI service unavailable. Please try again.");

  const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const reply = data.candidates?.[0]?.content?.parts?.map((x) => x.text ?? "").join("") ?? "";
  return { reply, limitReached: false };
}
