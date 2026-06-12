import { SignJWT, jwtVerify } from "jose";
import { config } from "../config.js";

const encoder = new TextEncoder();

function secretKey() {
  return encoder.encode(config.jwtSecret);
}

export async function signAppToken(payload: { userId: string; provider: string }) {
  return new SignJWT({ provider: payload.provider })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime("365d")
    .sign(secretKey());
}

export async function verifyAppToken(token: string) {
  const result = await jwtVerify(token, secretKey());
  return {
    userId: result.payload.sub as string | undefined,
    provider: typeof result.payload.provider === "string" ? result.payload.provider : undefined,
  };
}
