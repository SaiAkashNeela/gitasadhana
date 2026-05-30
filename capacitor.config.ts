import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.gitachapters.app",
  appName: "Gita Sadhana",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    GoogleAuth: {
      scopes: ["profile", "email"],
      webClientId: "397599373842-mao262jgi24u7jh6k6penqni973airfe.apps.googleusercontent.com",
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
