import { existsSync, readFileSync } from "fs";
import { CapacitorConfig } from "@capacitor/cli";

const envCache = new Map<string, string>();

function readEnvValue(name: string): string {
  if (process.env[name]) return process.env[name] as string;
  if (envCache.size === 0 && existsSync(".env")) {
    const content = readFileSync(".env", "utf8");
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/);
      if (!match) continue;
      const key = match[1];
      const rawValue = match[2].trim();
      const value =
        (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
        (rawValue.startsWith("'") && rawValue.endsWith("'"))
          ? rawValue.slice(1, -1)
          : rawValue;
      envCache.set(key, value);
    }
  }

  return envCache.get(name) ?? "";
}

const config: CapacitorConfig = {
  appId: "com.gitasadhana.app",
  appName: "Gita Sadhana",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    GoogleAuth: {
    scopes: ["profile", "email"],
    clientId:
        readEnvValue("VITE_GOOGLE_WEB_CLIENT_ID") ||
        readEnvValue("VITE_GOOGLE_ANDROID_CLIENT_ID") ||
        readEnvValue("VITE_GOOGLE_CLIENT_ID") ||
        readEnvValue("GOOGLE_CLIENT_ID") ||
        "822836118890-5rh7f1cq4149afb8ghjfogkijcfithpr.apps.googleusercontent.com",
      androidClientId:
        readEnvValue("VITE_GOOGLE_ANDROID_CLIENT_ID") ||
        readEnvValue("VITE_GOOGLE_WEB_CLIENT_ID") ||
        readEnvValue("VITE_GOOGLE_CLIENT_ID") ||
        readEnvValue("GOOGLE_CLIENT_ID") ||
        "822836118890-5rh7f1cq4149afb8ghjfogkijcfithpr.apps.googleusercontent.com",
      iosClientId:
        readEnvValue("VITE_GOOGLE_IOS_CLIENT_ID") ||
        readEnvValue("GOOGLE_IOS_CLIENT_ID") ||
        readEnvValue("VITE_GOOGLE_WEB_CLIENT_ID") ||
        readEnvValue("VITE_GOOGLE_CLIENT_ID") ||
        readEnvValue("GOOGLE_CLIENT_ID") ||
        "822836118890-5rh7f1cq4149afb8ghjfogkijcfithpr.apps.googleusercontent.com",
      serverClientId:
        readEnvValue("VITE_GOOGLE_WEB_CLIENT_ID") ||
        readEnvValue("VITE_GOOGLE_CLIENT_ID") ||
        readEnvValue("GOOGLE_CLIENT_ID") ||
        "822836118890-5rh7f1cq4149afb8ghjfogkijcfithpr.apps.googleusercontent.com",
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
