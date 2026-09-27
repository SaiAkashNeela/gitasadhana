import { apiRequest } from "./backend";

export async function sendContactEmail(email: string, message: string) {
  return apiRequest("/mail/contact", {
    method: "POST",
    body: { email, message },
    token: null,
  });
}

export async function sendCorrectionEmail(
  language: string,
  chapter: string,
  verse: string,
  message: string,
  email?: string,
) {
  return apiRequest("/mail/correction", {
    method: "POST",
    body: { language, chapter, verse, message, email },
    token: null,
  });
}
