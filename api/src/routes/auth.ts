import { Hono } from "hono";
import { z } from "zod";

import { findUserById, findUserBySubject, insertUser, updateAuthUser } from "../lib/db";
import { unauthorized } from "../lib/errors";
import { verifyAppleIdentityToken, verifyGoogleIdToken, type ProviderIdentity } from "../lib/identity";
import { signAppToken } from "../lib/jwt";
import { requireUser } from "../lib/auth-middleware";
import { newProfile } from "../lib/profile";
import type { AppVariables, AuthUser, Env, Provider } from "../types";

export const auth = new Hono<{ Bindings: Env; Variables: AppVariables }>();

async function signIn(env: Env, provider: Provider, identity: ProviderIdentity, extra: { displayName?: string; email?: string; photoURL?: string }) {
  const now = new Date().toISOString();
  const existing = await findUserBySubject(env.DB, identity.subject);
  const email = identity.email || extra.email || existing?.authUser.email || "";
  const displayName = extra.displayName || existing?.authUser.displayName || identity.displayName;
  const id = existing?.id ?? crypto.randomUUID();
  const createdAt = existing?.profile.createdAt ?? now;
  const authUser: AuthUser = {
    uid: id,
    email,
    displayName,
    photoURL: extra.photoURL || identity.photoURL || existing?.authUser.photoURL,
    providerId: `${provider}.com`,
    emailVerified: identity.emailVerified,
    metadata: { creationTime: createdAt, lastSignInTime: now },
  };
  if (existing) await updateAuthUser(env.DB, id, authUser, now);
  else await insertUser(env.DB, { id, provider, subject: identity.subject, authUser, profile: newProfile(displayName, email, now) }, now);

  const token = await signAppToken(env.JWT_SECRET, { userId: id, provider });
  return { success: true as const, isNewUser: !existing, token, user: authUser };
}

const providerBody = { displayName: z.string().optional().default(""), email: z.string().optional().default(""), photoURL: z.string().optional() };

auth.post("/google", async (c) => {
  const body = z.object({ idToken: z.string().min(1), ...providerBody }).parse(await c.req.json());
  const identity = await verifyGoogleIdToken(body.idToken, c.env.GOOGLE_CLIENT_IDS.split(",").map((s) => s.trim()).filter(Boolean));
  return c.json(await signIn(c.env, "google", identity, body));
});

auth.post("/apple", async (c) => {
  const body = z.object({ identityToken: z.string().min(1), ...providerBody }).parse(await c.req.json());
  const identity = await verifyAppleIdentityToken(body.identityToken, c.env.APPLE_BUNDLE_ID);
  return c.json(await signIn(c.env, "apple", identity, { ...body, photoURL: body.photoURL || undefined }));
});

auth.get("/me", requireUser, async (c) => {
  const user = await findUserById(c.env.DB, c.get("userId"));
  if (!user) throw unauthorized();
  return c.json({ user: user.authUser, profile: user.profile });
});

// Tokens are stateless; the client forgets its token.
auth.post("/logout", (c) => c.json({ success: true }));
