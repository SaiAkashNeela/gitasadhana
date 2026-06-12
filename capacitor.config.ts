import { CapacitorConfig } from "@capacitor/cli";

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
        process.env.VITE_GOOGLE_WEB_CLIENT_ID ||
        process.env.VITE_GOOGLE_CLIENT_ID ||
        process.env.GOOGLE_CLIENT_ID ||
        "822836118890-5rh7f1cq4149afb8ghjfogkijcfithpr.apps.googleusercontent.com",
      iosClientId:
        process.env.VITE_GOOGLE_IOS_CLIENT_ID ||
        process.env.GOOGLE_IOS_CLIENT_ID ||
        process.env.VITE_GOOGLE_WEB_CLIENT_ID ||
        process.env.VITE_GOOGLE_CLIENT_ID ||
        process.env.GOOGLE_CLIENT_ID ||
        "822836118890-5rh7f1cq4149afb8ghjfogkijcfithpr.apps.googleusercontent.com",
      serverClientId:
        process.env.VITE_GOOGLE_WEB_CLIENT_ID ||
        process.env.VITE_GOOGLE_CLIENT_ID ||
        process.env.GOOGLE_CLIENT_ID ||
        "822836118890-5rh7f1cq4149afb8ghjfogkijcfithpr.apps.googleusercontent.com",
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
