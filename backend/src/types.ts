export type ProviderName = "google" | "apple";

export type AuthUser = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  providerId?: string;
  emailVerified?: boolean;
  metadata: {
    creationTime: string;
    lastSignInTime: string;
  };
};

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

export type UserNote = {
  id: string;
  verseId: string;
  title: string;
  body: string;
  date: string;
};

export type HistoryItem = {
  id: string;
  chapter: number;
  verse: number;
  date: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "model";
  text: string;
  ts: number;
};

