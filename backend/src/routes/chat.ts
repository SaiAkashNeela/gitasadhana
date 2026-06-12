import { Router } from "express";
import { z } from "zod";
import { asyncHandler, parseBearerToken } from "../lib/http.js";
import { ChatModel } from "../models/Chat.js";
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

router.get(
  "/me",
  asyncHandler(async (req, res) => {
    const user = await getCurrentUser(req);
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const profile = (user as any).profile;

    const chat = await ChatModel.findOne({ userId: user._id.toString() }).exec();
    res.json({
      messages: chat?.messages ?? [],
      language: chat?.language ?? profile.language,
    });
  }),
);

router.put(
  "/me",
  asyncHandler(async (req, res) => {
    const user = await getCurrentUser(req);
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const body = z.object({
      messages: z.array(z.object({
        id: z.string(),
        role: z.enum(["user", "model"]),
        text: z.string(),
        ts: z.number(),
      })),
      language: z.string().optional(),
    }).parse(req.body);

    const updated = await ChatModel.findOneAndUpdate(
      { userId: user._id.toString() },
      {
        userId: user._id.toString(),
        messages: body.messages,
        language: body.language ?? (user as any).profile.language,
        updatedAt: new Date().toISOString(),
      },
      { new: true, upsert: true },
    ).exec();

    res.json({ success: true, messages: updated.messages });
  }),
);

export { router as chatRouter };
