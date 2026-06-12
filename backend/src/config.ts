import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required.`);
  }
  return value;
}

function optional(name: string, fallback = ""): string {
  return process.env[name] || fallback;
}

export const config = {
  port: Number(process.env.PORT || 5001),
  nodeEnv: process.env.NODE_ENV || "production",
  mongoUri: required("MONGODB_URI"),
  jwtSecret: required("JWT_SECRET"),
  googleClientId: optional("GOOGLE_CLIENT_ID", "822836118890-5rh7f1cq4149afb8ghjfogkijcfithpr.apps.googleusercontent.com"),
  appleClientId: optional("APPLE_CLIENT_ID", "com.gitasadhana.ios"),
  emailApiKey: optional("EMAIL_API_KEY"),
  emailFrom: optional("EMAIL_FROM", "hello@mails.gitasadhana.com"),
  emailReplyTo: optional("EMAIL_REPLY_TO", "hello@gitasadhana.com"),
  geminiApiKey: optional("GEMINI_API_KEY"),
  geminiModelId: optional("GEMINI_MODEL_ID", "gemini-2.5-flash"),
  appUrl: optional("APP_URL", "https://gitasadhana.com"),
  allowedOrigins: optional("ALLOWED_ORIGINS", "http://localhost:3000,capacitor://localhost,http://localhost")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
