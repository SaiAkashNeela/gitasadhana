import type { Request } from "express";
import { parseBearerToken } from "../lib/http.js";

export type ChatIdentity = {
  userId: string;
  isGuest: boolean;
};

export type ChatTokenVerifier = (token: string) => Promise<{ userId?: string | null }>;

function normalizeGuestId(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "anonymous";
}

export async function resolveAiChatIdentity(
  req: Pick<Request, "headers" | "ip">,
  options: { verifyToken?: ChatTokenVerifier } = {},
): Promise<ChatIdentity> {
  const token = parseBearerToken(req.headers.authorization);
  if (token && options.verifyToken) {
    try {
      const verified = await options.verifyToken(token);
      if (verified.userId) {
        return { userId: verified.userId, isGuest: false };
      }
    } catch {
      // Fall through to guest handling.
    }
  }

  const guestId = req.headers["x-guest-id"];
  const rawGuestId = Array.isArray(guestId) ? guestId[0] : guestId;
  const fallback = normalizeGuestId(req.ip || "anonymous");
  const resolvedGuestId = rawGuestId ? normalizeGuestId(rawGuestId) : fallback;

  return {
    userId: `guest:${resolvedGuestId}`,
    isGuest: true,
  };
}
