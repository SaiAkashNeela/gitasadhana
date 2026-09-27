import { SignJWT, jwtVerify } from "jose";

const encoder = new TextEncoder();

/** App session token — same shape as the Node backend (HS256, sub = user id, 365 days). */
export async function signAppToken(secret: string, payload: { userId: string; provider: string }) {
  return new SignJWT({ provider: payload.provider })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime("365d")
    .sign(encoder.encode(secret));
}

export async function verifyAppToken(secret: string, token: string) {
  const { payload } = await jwtVerify(token, encoder.encode(secret));
  return { userId: typeof payload.sub === "string" ? payload.sub : null };
}

export function bearerToken(header: string | undefined | null) {
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7).trim() || null;
}
