export type Env = {
  DB: D1Database;
  JWT_SECRET: string;
  GEMINI_API_KEY?: string;
  EMAIL_API_KEY?: string;
  GOOGLE_CLIENT_IDS: string;
  APPLE_BUNDLE_ID: string;
  EMAIL_FROM: string;
  EMAIL_REPLY_TO: string;
  ADMIN_EMAIL: string;
  APP_URL: string;
  GEMINI_MODEL_ID: string;
  AI_DAILY_LIMIT: string;
};

export type Provider = "google" | "apple";

export type AuthUser = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  providerId?: string;
  emailVerified?: boolean;
  metadata: { creationTime: string; lastSignInTime: string };
};

export type UserNote = { id: string; verseId: string; title: string; body: string; date: string };
export type HistoryItem = { id: string; chapter: number; verse: number; date: string };
export type ChatMessage = { id: string; role: "user" | "model"; text: string; ts: number };

export type UserProfile = {
  name: string;
  email: string;
  streak: number;
  versesRead: number;
  bookmarks: string[];
  notes: UserNote[];
  history: HistoryItem[];
  favorites: string[];
  completedVerses: string[];
  readVerses: string[];
  readDates: string[];
  downloadedVerses: string[];
  downloadedChapters: number[];
  isGitaDownloaded: boolean;
  language: string;
  minutes: number;
  createdAt: string;
  updatedAt: string;
};

export type UserRow = {
  id: string;
  provider: Provider;
  provider_subject: string;
  auth_user: string;
  profile: string;
  created_at: string;
  updated_at: string;
};

export type AppVariables = { userId: string };
