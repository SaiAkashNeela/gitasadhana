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
      webClientId: "822836118890-5rh7f1cq4149afb8ghjfogkijcfithpr.apps.googleusercontent.com",
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
