import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

/**
 * Sends a contact form email via AWS SES
 * @param email - Sender's email address
 * @param message - Message content
 * @returns Success response from Cloud Function
 */
export const sendContactEmail = async (email: string, message: string) => {
  const contactEmailFn = httpsCallable(functions, "sendContactEmail");
  return contactEmailFn({ email, message });
};

/**
 * Sends a verse correction/report email via AWS SES
 * @param language - Language code (e.g., 'en', 'hi')
 * @param chapter - Chapter number
 * @param verse - Verse number
 * @param message - Description of the correction/issue
 * @returns Success response from Cloud Function
 */
export const sendCorrectionEmail = async (
  language: string,
  chapter: string,
  verse: string,
  message: string,
  email?: string,
) => {
  const correctionEmailFn = httpsCallable(functions, "sendCorrectionEmail");
  return correctionEmailFn({ language, chapter, verse, message, email });
};

/**
 * Sends a newsletter subscription confirmation email
 * @param email - Subscriber's email address
 * @param frequency - Frequency ('daily', 'weekly', 'monthly', or 'none')
 * @returns Success response from Cloud Function or resolved promise if 'none'
 */
export const sendWelcomeEmail = async (email: string, name: string) => {
  const fn = httpsCallable(functions, "sendWelcomeEmail");
  return fn({ email, name });
};

export const sendNewsletterEmail = async (
  email: string,
  frequency: "daily" | "weekly" | "monthly" | "none"
) => {
  // If frequency is "none", don't send an email - just return success
  if (frequency === "none") {
    return { data: { success: true } };
  }

  const newsletterEmailFn = httpsCallable(functions, "sendNewsletterEmail");
  return newsletterEmailFn({ email, frequency });
};
