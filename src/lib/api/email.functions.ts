import { apiRequest } from "../backend";

export const sendContactEmail = async (email: string, message: string) => {
  return apiRequest("/mail/contact", {
    method: "POST",
    body: { email, message },
    token: null,
  });
};

export const sendCorrectionEmail = async (
  language: string,
  chapter: string,
  verse: string,
  message: string,
  email?: string,
) => {
  return apiRequest("/mail/correction", {
    method: "POST",
    body: { language, chapter, verse, message, email },
    token: null,
  });
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  return apiRequest("/mail/welcome", {
    method: "POST",
    body: { email, name },
    token: null,
  });
};

export const sendNewsletterEmail = async (
  email: string,
  frequency: "daily" | "weekly" | "monthly" | "none",
) => {
  if (frequency === "none") {
    return { data: { success: true } };
  }

  return apiRequest("/mail/newsletter", {
    method: "POST",
    body: { email, frequency },
    token: null,
  });
};

