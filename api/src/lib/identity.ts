import { createRemoteJWKSet, jwtVerify } from "jose";

import { HttpError } from "./errors";

// JWKS are cached per isolate by jose.
const googleJwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
const appleJwks = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));

export type ProviderIdentity = {
  subject: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
};

export async function verifyGoogleIdToken(idToken: string, audience: string[]): Promise<ProviderIdentity> {
  let payload;
  try {
    ({ payload } = await jwtVerify(idToken, googleJwks, {
      issuer: ["accounts.google.com", "https://accounts.google.com"],
      audience,
    }));
  } catch {
    throw new HttpError(401, "Unauthorized: invalid Google token");
  }
  const email = typeof payload.email === "string" ? payload.email : "";
  if (!payload.sub || !email) throw new HttpError(400, "Google token is missing required claims.");
  return {
    subject: payload.sub,
    email,
    displayName: typeof payload.name === "string" ? payload.name : email.split("@")[0] || "Seeker",
    photoURL: typeof payload.picture === "string" ? payload.picture : undefined,
    emailVerified: payload.email_verified === true,
  };
}

export async function verifyAppleIdentityToken(identityToken: string, bundleIds: string[]): Promise<ProviderIdentity> {
  let payload;
  try {
    ({ payload } = await jwtVerify(identityToken, appleJwks, { issuer: "https://appleid.apple.com", audience: bundleIds }));
  } catch {
    throw new HttpError(401, "Unauthorized: invalid Apple token");
  }
  if (!payload.sub) throw new HttpError(400, "Apple identity token is missing required claims.");
  // Apple only includes the email when the user shares it; the client sends it on first sign-in.
  const email = typeof payload.email === "string" ? payload.email : "";
  return {
    subject: payload.sub,
    email,
    displayName: email.split("@")[0] || "Seeker",
    emailVerified: payload.email_verified === "true" || payload.email_verified === true,
  };
}
