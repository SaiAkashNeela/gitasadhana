import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/v2/params";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const awsAccessKeyId = defineSecret("AWS_SES_ACCESS_KEY_ID");
const awsSecretAccessKey = defineSecret("AWS_SES_SECRET_ACCESS_KEY");
const awsRegion = defineSecret("AWS_SES_REGION");
const sesFromEmail = defineSecret("SES_FROM_EMAIL");

function getSES() {
  return new SESClient({
    region: awsRegion.value(),
    credentials: {
      accessKeyId: awsAccessKeyId.value(),
      secretAccessKey: awsSecretAccessKey.value(),
    },
  });
}

export const sendContactEmail = onCall(
  {
    secrets: [awsAccessKeyId, awsSecretAccessKey, awsRegion, sesFromEmail],
    region: "us-central1",
  },
  async (request) => {
    const { email, message } = request.data as { email: string; message: string };

    if (!email || !message?.trim()) {
      throw new HttpsError("invalid-argument", "Email and message are required.");
    }

    const ses = getSES();
    await ses.send(new SendEmailCommand({
      Source: sesFromEmail.value(),
      Destination: { ToAddresses: ["hello@gitasadhana.com"] },
      Message: {
        Subject: { Data: `Contact Form: ${email}` },
        Body: {
          Text: {
            Data: `From: ${email}\n\n${message}`,
          },
        },
      },
      ReplyToAddresses: [email],
    }));

    return { success: true };
  }
);

export const sendCorrectionEmail = onCall(
  {
    secrets: [awsAccessKeyId, awsSecretAccessKey, awsRegion, sesFromEmail],
    region: "us-central1",
  },
  async (request) => {
    const { language, chapter, verse, message } = request.data as {
      language: string;
      chapter: string;
      verse: string;
      message: string;
    };

    if (!language || !chapter || !verse || !message?.trim()) {
      throw new HttpsError("invalid-argument", "All fields are required.");
    }

    const ses = getSES();
    await ses.send(new SendEmailCommand({
      Source: sesFromEmail.value(),
      Destination: { ToAddresses: ["hello@gitasadhana.com"] },
      Message: {
        Subject: { Data: `Correction: ${language} | Chapter ${chapter} Verse ${verse}` },
        Body: {
          Text: {
            Data: `Language: ${language}\nChapter: ${chapter}\nVerse: ${verse}\n\nIssue:\n${message}`,
          },
        },
      },
    }));

    return { success: true };
  }
);

export const sendNewsletterEmail = onCall(
  {
    secrets: [awsAccessKeyId, awsSecretAccessKey, awsRegion, sesFromEmail],
    region: "us-central1",
  },
  async (request) => {
    const { email, frequency } = request.data as {
      email: string;
      frequency: "daily" | "weekly" | "monthly";
    };

    if (!email || !frequency) {
      throw new HttpsError("invalid-argument", "Email and frequency are required.");
    }

    if (!["daily", "weekly", "monthly"].includes(frequency)) {
      throw new HttpsError("invalid-argument", "Invalid frequency value.");
    }

    const ses = getSES();
    const frequencyCapitalized = frequency.charAt(0).toUpperCase() + frequency.slice(1);
    
    await ses.send(new SendEmailCommand({
      Source: sesFromEmail.value(),
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: `Gita Sadhana: ${frequencyCapitalized} Newsletter Subscription Confirmed` },
        Body: {
          Text: {
            Data: `Hello,\n\nThank you for subscribing to our ${frequency} newsletter.\n\nYou will now receive curated verses and spiritual insights from the Bhagavad Gita every ${frequency.replace("monthly", "month")}.\n\nBest regards,\nGita Sadhana Team`,
          },
        },
      },
      ReplyToAddresses: ["hello@gitasadhana.com"],
    }));

    return { success: true };
  }
);
