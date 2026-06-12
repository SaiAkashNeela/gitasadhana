import { GoogleGenAI } from "@google/genai";
import { config } from "../config.js";
import { AiUsageModel } from "../models/AiUsage.js";
const DAILY_LIMIT = 30;
const MAX_MESSAGE_LENGTH = 2000;

function sanitiseInput(input: string) {
  return input.replace(/\0/g, "").replace(/\s{10,}/g, " ").trim();
}

function languageName(language: string) {
  const languageNames: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    sa: "Sanskrit",
    te: "Telugu",
    ta: "Tamil",
    kn: "Kannada",
    ml: "Malayalam",
    bn: "Bengali",
    gu: "Gujarati",
    mr: "Marathi",
    pa: "Punjabi",
    ne: "Nepali",
  };

  return languageNames[language] ?? "English";
}

async function getDailyUsage(userId: string, day: string) {
  const usage = await AiUsageModel.findOne({ userId, day }).exec();
  return usage?.count ?? 0;
}

async function incrementDailyUsage(userId: string, day: string) {
  await AiUsageModel.updateOne(
    { userId, day },
    { $inc: { count: 1 }, $setOnInsert: { userId, day, count: 0 } },
    { upsert: true },
  ).exec();
}

export async function handleGitaChat(payload: {
  userId: string;
  message: string;
  history: Array<{ role: "user" | "model"; text: string }>;
  language: string;
}) {
  if (!config.geminiApiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }

  const cleanMessage = sanitiseInput(payload.message);
  if (!cleanMessage.trim()) {
    throw new Error("Message is required.");
  }

  if (cleanMessage.length > MAX_MESSAGE_LENGTH) {
    throw new Error("Message too long.");
  }

  const day = new Date().toISOString().slice(0, 10);
  const currentCount = await getDailyUsage(payload.userId, day);
  if (currentCount >= DAILY_LIMIT) {
    return { reply: null as string | null, limitReached: true };
  }

  await incrementDailyUsage(payload.userId, day);

  const safeLanguage = languageName(payload.language);
  const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
  const safeHistory = payload.history.slice(-20).map((entry) => ({
    role: entry.role as "user" | "model",
    parts: [{ text: sanitiseInput(entry.text).slice(0, MAX_MESSAGE_LENGTH) }],
  }));

  const systemInstruction = `You are Gita AI, a calm, wise, and devotional spiritual assistant built into the Gita Sadhana app.

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
- Respond ONLY in ${safeLanguage}.`;

  const chat = ai.chats.create({
    model: config.geminiModelId,
    config: { systemInstruction },
    history: safeHistory,
  });

  try {
    const response = await chat.sendMessage({ message: cleanMessage });
    return { reply: response.text ?? "", limitReached: false };
  } catch (error: any) {
    const message = String(error?.message ?? "");
    if (message.includes("429") || message.toLowerCase().includes("quota") || message.toLowerCase().includes("rate")) {
      throw new Error("Rate limit reached. Please try again shortly.");
    }
    if (message.toLowerCase().includes("network") || message.toLowerCase().includes("fetch")) {
      throw new Error("Service temporarily unavailable.");
    }
    throw new Error("AI service unavailable. Please try again.");
  }
}
