export type Provider = "google" | "apple";
export type ProviderCredential = { token: string; displayName: string; email: string; photoURL: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (r: { credential?: string }) => void }) => void;
          renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const webClientId =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "822836118890-c0phehllvd4s2409adtgo13f1ipg997k.apps.googleusercontent.com";

export class SignInCancelled extends Error {
  constructor() {
    super("Sign-in cancelled");
  }
}

export async function isAppleSignInAvailable() {
  return false;
}

function loadGsi() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existing = document.querySelector<HTMLScriptElement>('script[data-gsi="true"]');
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("Unable to load Google sign-in.")), { once: true });
    if (!existing) {
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.dataset.gsi = "true";
      document.head.appendChild(script);
    }
  });
}

// A closed Google popup never calls back, so a new attempt settles the abandoned one.
let cancelPending: (() => void) | undefined;

/** Google Identity Services, same flow as the Capacitor web build. */
export async function getProviderCredential(provider: Provider): Promise<ProviderCredential> {
  if (provider === "apple") throw new Error("Apple sign-in is available on iOS only.");
  await loadGsi();
  const gsi = window.google?.accounts?.id;
  if (!gsi) throw new Error("Google sign-in is unavailable.");

  return new Promise((resolve, reject) => {
    cancelPending?.();
    const host = document.createElement("div");
    Object.assign(host.style, { position: "fixed", left: "-9999px", top: "-9999px", width: "320px", height: "60px" });
    document.body.appendChild(host);
    cancelPending = () => {
      host.remove();
      reject(new Error("Google sign-in was cancelled."));
    };
    gsi.initialize({
      client_id: webClientId,
      callback: (r) => {
        cancelPending = undefined;
        host.remove();
        if (!r.credential) return reject(new Error("Google sign-in did not return an ID token."));
        resolve({ token: r.credential, displayName: "", email: "", photoURL: "" });
      },
    });
    gsi.renderButton(host, { theme: "outline", size: "large", shape: "pill", text: "signin_with", width: 320 });
    requestAnimationFrame(() => {
      const button = host.querySelector("button,[role='button']");
      if (button instanceof HTMLElement) button.click();
      else gsi.prompt();
    });
  });
}

export async function providerSignOut() {}
