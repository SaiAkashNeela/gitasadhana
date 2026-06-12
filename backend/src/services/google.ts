import { createRemoteJWKSet, jwtVerify } from "jose";
import { config } from "../config.js";

const googleJwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export type GoogleIdentity = {
  subject: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
};

export async function verifyGoogleIdToken(idToken: string) {
  const verified = await jwtVerify(idToken, googleJwks, {
    issuer: ["accounts.google.com", "https://accounts.google.com"],
    audience: config.googleClientIds,
  });

  const payload = verified.payload;
  const email = typeof payload.email === "string" ? payload.email : "";
  const name = typeof payload.name === "string" ? payload.name : email.split("@")[0] || "Seeker";
  const picture = typeof payload.picture === "string" ? payload.picture : undefined;

  if (!payload.sub || !email) {
    throw new Error("Google token is missing required claims.");
  }

  return {
    subject: payload.sub,
    email,
    displayName: name,
    photoURL: picture,
    emailVerified: payload.email_verified === true,
  } satisfies GoogleIdentity;
}
