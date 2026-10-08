import { apiRequest } from "./api";

export const sendContactEmail = (email: string, message: string) =>
  apiRequest("/mail/contact", { method: "POST", body: { email, message }, token: null });

export const sendCorrectionEmail = (language: string, chapter: string, verse: string, message: string, email?: string) =>
  apiRequest("/mail/correction", {
    method: "POST",
    body: { language, chapter, verse, message, email },
    token: null,
  });

export const sendWelcomeEmail = (email: string, name: string) =>
  apiRequest("/mail/welcome", { method: "POST", body: { email, name }, token: null });

export const sendNewsletterEmail = async (email: string, frequency: "daily" | "weekly" | "monthly" | "none") => {
  if (frequency === "none") return { success: true };
  return apiRequest("/mail/newsletter", { method: "POST", body: { email, frequency }, token: null });
};
