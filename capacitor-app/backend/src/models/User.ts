import { Schema, model, type InferSchemaType } from "mongoose";
import type { AuthUser, HistoryItem, UserNote, UserProfile } from "../types.js";

const userNoteSchema = new Schema<UserNote>(
  {
    id: { type: String, required: true },
    verseId: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    date: { type: String, required: true },
  },
  { _id: false },
);

const historyItemSchema = new Schema<HistoryItem>(
  {
    id: { type: String, required: true },
    chapter: { type: Number, required: true },
    verse: { type: Number, required: true },
    date: { type: String, required: true },
  },
  { _id: false },
);

const authUserSchema = new Schema<AuthUser>(
  {
    uid: { type: String, required: true },
    email: { type: String, required: true },
    displayName: { type: String, required: true },
    photoURL: { type: String, required: false },
    providerId: { type: String, required: false },
    emailVerified: { type: Boolean, required: false },
    metadata: {
      creationTime: { type: String, required: true },
      lastSignInTime: { type: String, required: true },
    },
  },
  { _id: false },
);

const userProfileSchema = new Schema<UserProfile>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    streak: { type: Number, required: true, default: 1 },
    versesRead: { type: Number, required: true, default: 0 },
    bookmarks: { type: [String], required: true, default: [] },
    notes: { type: [userNoteSchema], required: true, default: [] },
    history: { type: [historyItemSchema], required: true, default: [] },
    favorites: { type: [String], required: true, default: [] },
    completedVerses: { type: [String], required: true, default: [] },
    readVerses: { type: [String], required: true, default: [] },
    readDates: { type: [String], required: true, default: [] },
    downloadedVerses: { type: [String], required: true, default: [] },
    downloadedChapters: { type: [Number], required: true, default: [] },
    isGitaDownloaded: { type: Boolean, required: true, default: false },
    language: { type: String, required: true, default: "en" },
    minutes: { type: Number, required: true, default: 0 },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    provider: {
      type: String,
      enum: ["google", "apple"],
      required: true,
    },
    providerSubject: { type: String, required: true, unique: true, index: true },
    authUser: { type: authUserSchema, required: true },
    profile: { type: userProfileSchema, required: true },
  },
  {
    timestamps: true,
  },
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: unknown;
};

export const UserModel = model("User", userSchema);

