import { Router } from "express";
import { z } from "zod";
import { asyncHandler, parseBearerToken } from "../lib/http.js";
import { UserModel } from "../models/User.js";
import { signAppToken, verifyAppToken } from "../services/jwt.js";
import { verifyGoogleIdToken } from "../services/google.js";
import { verifyAppleIdentityToken } from "../services/apple.js";
import type { AuthUser } from "../types.js";

const router = Router();

function buildAuthUser(input: {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  providerId: "google.com" | "apple.com";
  emailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}): AuthUser {
  return {
    uid: input.uid,
    email: input.email,
    displayName: input.displayName,
    photoURL: input.photoURL,
    providerId: input.providerId,
    emailVerified: input.emailVerified,
    metadata: {
      creationTime: input.createdAt,
      lastSignInTime: input.updatedAt,
    },
  };
}

async function upsertUser(params: {
  provider: "google" | "apple";
  subject: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified?: boolean;
}) {
  const now = new Date().toISOString();
  const existing = await UserModel.findOne({ providerSubject: params.subject }).exec();
  const existingDoc = existing as any;
  const createdAt = existingDoc?.profile?.createdAt ?? now;
  const updatedAt = now;

  const user = await UserModel.findOneAndUpdate(
    { providerSubject: params.subject },
    {
      provider: params.provider,
      providerSubject: params.subject,
      authUser: buildAuthUser({
        uid: existingDoc?._id?.toString() ?? params.subject,
        email: params.email,
        displayName: params.displayName,
        photoURL: params.photoURL,
        providerId: `${params.provider}.com` as "google.com" | "apple.com",
        emailVerified: params.emailVerified,
        createdAt,
        updatedAt,
      }),
      profile: existingDoc?.profile ?? {
        name: params.displayName || "Seeker",
        email: params.email,
        streak: 1,
        versesRead: 0,
        bookmarks: [],
        notes: [],
        history: [],
        favorites: [],
        completedVerses: [],
        readVerses: [],
        readDates: [],
        downloadedVerses: [],
        downloadedChapters: [],
        isGitaDownloaded: false,
        language: "en",
        minutes: 0,
        createdAt,
        updatedAt,
      },
    },
    { new: true, upsert: true },
  ).exec();
  const userDoc = user as any;
  const authUser = buildAuthUser({
    uid: userDoc._id.toString(),
    email: userDoc.authUser.email,
    displayName: userDoc.authUser.displayName,
    photoURL: userDoc.authUser.photoURL,
    providerId: userDoc.authUser.providerId ?? `${params.provider}.com`,
    emailVerified: userDoc.authUser.emailVerified,
    createdAt: userDoc.profile.createdAt,
    updatedAt: userDoc.profile.updatedAt,
  });

  const token = await signAppToken({ userId: authUser.uid, provider: params.provider });
  const isNewUser = !existing;
  return { user, authUser, token, isNewUser };
}

async function getAuthenticatedUser(req: any) {
  const token = parseBearerToken(req.headers.authorization);
  if (!token) {
    return null;
  }
  const verified = await verifyAppToken(token);
  if (!verified.userId) {
    return null;
  }
  return UserModel.findById(verified.userId).exec();
}

router.post(
  "/google",
  asyncHandler(async (req, res) => {
    const body = z.object({
      idToken: z.string().min(1),
      displayName: z.string().optional().default(""),
      email: z.string().optional().default(""),
      photoURL: z.string().optional(),
    }).parse(req.body);

    const googleIdentity = await verifyGoogleIdToken(body.idToken);
    const result = await upsertUser({
      provider: "google",
      subject: googleIdentity.subject,
      email: googleIdentity.email || body.email,
      displayName: body.displayName || googleIdentity.displayName,
      photoURL: body.photoURL || googleIdentity.photoURL,
      emailVerified: googleIdentity.emailVerified,
    });

    res.json({
      success: true,
      isNewUser: result.isNewUser,
      token: result.token,
      user: result.authUser,
    });
  }),
);

router.post(
  "/apple",
  asyncHandler(async (req, res) => {
    const body = z.object({
      identityToken: z.string().min(1),
      displayName: z.string().optional().default(""),
      email: z.string().optional().default(""),
      photoURL: z.string().optional(),
    }).parse(req.body);

    const appleIdentity = await verifyAppleIdentityToken(body.identityToken);
    const result = await upsertUser({
      provider: "apple",
      subject: appleIdentity.subject,
      email: appleIdentity.email || body.email,
      displayName: body.displayName || appleIdentity.displayName,
      photoURL: body.photoURL,
      emailVerified: appleIdentity.emailVerified,
    });

    res.json({
      success: true,
      isNewUser: result.isNewUser,
      token: result.token,
      user: result.authUser,
    });
  }),
);

router.get(
  "/me",
  asyncHandler(async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    res.json({
      user: {
        uid: user._id.toString(),
        email: (user as any).authUser.email,
        displayName: (user as any).authUser.displayName,
        photoURL: (user as any).authUser.photoURL,
        providerId: (user as any).authUser.providerId,
        emailVerified: (user as any).authUser.emailVerified,
        metadata: (user as any).authUser.metadata,
      },
      profile: (user as any).profile,
    });
  }),
);

router.post(
  "/logout",
  asyncHandler(async (_req, res) => {
    res.json({ success: true });
  }),
);

export { router as authRouter };
