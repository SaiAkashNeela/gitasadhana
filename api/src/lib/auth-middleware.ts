import type { Context, Next } from "hono";

import type { AppVariables, Env } from "../types";

import { unauthorized } from "./errors";
import { bearerToken, verifyAppToken } from "./jwt";

export type AppContext = Context<{ Bindings: Env; Variables: AppVariables }>;

/** Resolves the signed-in user id, or null for guests / bad tokens. */
export async function optionalUserId(c: AppContext) {
  const token = bearerToken(c.req.header("Authorization"));
  if (!token) return null;
  try {
    return (await verifyAppToken(c.env.JWT_SECRET, token)).userId;
  } catch {
    return null;
  }
}

export async function requireUser(c: AppContext, next: Next) {
  const userId = await optionalUserId(c);
  if (!userId) throw unauthorized();
  c.set("userId", userId);
  await next();
}
