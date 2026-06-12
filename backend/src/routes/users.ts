import { Router } from "express";
import { z } from "zod";
import { asyncHandler, parseBearerToken } from "../lib/http.js";
import { mergeUserProfile } from "../lib/profile.js";
import { UserModel } from "../models/User.js";
import { verifyAppToken } from "../services/jwt.js";

const router = Router();

async function getCurrentUser(req: any) {
  const token = parseBearerToken(req.headers.authorization);
  if (!token) return null;
  const verified = await verifyAppToken(token);
  if (!verified.userId) return null;
  return UserModel.findById(verified.userId).exec();
}

function uniqById<T extends { id: string }>(items: T[]) {
  return Object.values(items.reduce<Record<string, T>>((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {}));
}

router.get(
  "/me",
  asyncHandler(async (req, res) => {
    const user = await getCurrentUser(req);
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const existingProfile = (user as any).profile;

    res.json({
      profile: existingProfile,
      authUser: (user as any).authUser,
    });
  }),
);

router.post(
  "/me/sync",
  asyncHandler(async (req, res) => {
    const user = await getCurrentUser(req);
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const existingProfile = (user as any).profile;

    const body = z.object({
      name: z.string().optional(),
      email: z.string().optional(),
      streak: z.number().optional(),
      versesRead: z.number().optional(),
      bookmarks: z.array(z.string()).optional(),
      notes: z.array(z.object({
        id: z.string(),
        verseId: z.string(),
        title: z.string(),
        body: z.string(),
        date: z.string(),
      })).optional(),
      history: z.array(z.object({
        id: z.string(),
        chapter: z.number(),
        verse: z.number(),
        date: z.string(),
      })).optional(),
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
      chatMessages: z.array(z.object({
        id: z.string(),
        role: z.enum(["user", "model"]),
        text: z.string(),
        ts: z.number(),
      })).optional(),
    }).parse(req.body);

    const nextProfile = mergeUserProfile(existingProfile, {
      name: body.name ?? existingProfile.name,
      email: body.email ?? existingProfile.email,
      streak: body.streak ?? existingProfile.streak,
      versesRead: body.versesRead ?? existingProfile.versesRead,
      bookmarks: body.bookmarks,
      notes: body.notes,
      history: body.history,
      favorites: body.favorites,
      completedVerses: body.completedVerses,
      readVerses: body.readVerses,
      readDates: body.readDates,
      downloadedVerses: body.downloadedVerses,
      downloadedChapters: body.downloadedChapters,
      isGitaDownloaded: body.isGitaDownloaded ?? existingProfile.isGitaDownloaded,
      language: body.language ?? existingProfile.language,
      minutes: body.minutes ?? existingProfile.minutes,
      createdAt: body.createdAt ?? existingProfile.createdAt,
      updatedAt: new Date().toISOString(),
    });

    (user as any).profile = nextProfile;
    await user.save();

    res.json({ success: true, profile: nextProfile });
  }),
);

router.delete(
  "/me",
  asyncHandler(async (req, res) => {
    const user = await getCurrentUser(req);
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    await user.deleteOne();
    res.json({ success: true });
  }),
);

export { router as usersRouter };
