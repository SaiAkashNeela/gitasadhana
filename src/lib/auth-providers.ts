import * as AppleAuthentication from "expo-apple-authentication";

export type Provider = "google" | "apple";
export type ProviderCredential = { token: string; displayName: string; email: string; photoURL: string };

const webClientId =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "822836118890-c0phehllvd4s2409adtgo13f1ipg997k.apps.googleusercontent.com";
const iosClientId =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "822836118890-sufsueg8u9be6t9kc0cf60crl5eiaies.apps.googleusercontent.com";

type GoogleModule = typeof import("@react-native-google-signin/google-signin");
let google: GoogleModule | null = null;

/** Loaded on demand: the native module only exists in development/store builds, not Expo Go. */
function googleModule(): GoogleModule {
  if (!google) {
    try {
      google = require("@react-native-google-signin/google-signin") as GoogleModule;
    } catch {
      throw new Error("Google sign-in needs a development or store build of the app.");
    }
  }
  return google;
}

let configured = false;
function configureGoogle() {
  const { GoogleSignin } = googleModule();
  if (configured) return;
  // The ID token's audience is the web client ID, which is what the backend verifies.
  GoogleSignin.configure({ webClientId, iosClientId, scopes: ["profile", "email"] });
  configured = true;
}

export class SignInCancelled extends Error {
  constructor() {
    super("Sign-in cancelled");
  }
}

export async function isAppleSignInAvailable() {
  if (process.env.EXPO_OS !== "ios") return false;
  return AppleAuthentication.isAvailableAsync().catch(() => false);
}

export async function getProviderCredential(provider: Provider): Promise<ProviderCredential> {
  if (provider === "google") {
    configureGoogle();
    const { GoogleSignin, isErrorWithCode, statusCodes } = googleModule();
    try {
      if (process.env.EXPO_OS === "android") await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const res = await GoogleSignin.signIn();
      if (res.type !== "success") throw new SignInCancelled();
      const idToken = res.data.idToken;
      if (!idToken) throw new Error("Google sign-in did not return an ID token.");
      return {
        token: idToken,
        displayName: res.data.user.name ?? "",
        email: res.data.user.email ?? "",
        photoURL: res.data.user.photo ?? "",
      };
    } catch (e) {
      if (isErrorWithCode(e) && e.code === statusCodes.SIGN_IN_CANCELLED) throw new SignInCancelled();
      throw e;
    }
  }

  try {
    const res = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    if (!res.identityToken) throw new Error("Apple sign-in did not return an identity token.");
    const displayName = `${res.fullName?.givenName ?? ""} ${res.fullName?.familyName ?? ""}`.trim();
    return { token: res.identityToken, displayName, email: res.email ?? "", photoURL: "" };
  } catch (e: any) {
    if (e?.code === "ERR_REQUEST_CANCELED") throw new SignInCancelled();
    throw e;
  }
}

export async function providerSignOut() {
  if (configured) await googleModule().GoogleSignin.signOut();
}
