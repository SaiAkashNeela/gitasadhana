import { createRemoteJWKSet, jwtVerify } from "jose";
import { config } from "../config.js";

const appleJwks = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));

export type AppleIdentity = {
  subject: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
};

export async function verifyAppleIdentityToken(identityToken: string) {
  const verified = await jwtVerify(identityToken, appleJwks, {
    issuer: "https://appleid.apple.com",
    audience: config.appleClientId,
  });

  const payload = verified.payload;
  const email = typeof payload.email === "string" ? payload.email : "";

  if (!payload.sub || !email) {
    throw new Error("Apple identity token is missing required claims.");
  }

  return {
    subject: payload.sub,
    email,
    displayName: email.split("@")[0] || "Seeker",
    emailVerified: payload.email_verified === "true" || payload.email_verified === true,
  } satisfies AppleIdentity;
}

