export const emailAddress = "hello@gitasadhana.com";

export const privacySections = [
  {
    title: "Information We Collect",
    body: "Gita Sadhana collects minimal personal information to provide you with a meaningful spiritual experience. When you create an account, we collect your name and email address. We also collect anonymized usage data such as which verses you read, your reading streak, and bookmarks — solely to personalize your journey.",
  },
  {
    title: "How We Use Your Information",
    body: "Your data is used exclusively to power your in-app experience: syncing your bookmarks, notes, reading history, and streak across devices. We do not sell, rent, or share your personal information with third parties for marketing purposes.",
  },
  {
    title: "Audio & Offline Content",
    body: "When you download verses for offline listening, audio files are cached locally on your device. These files are sourced from our secure cloud storage and are used only for personal, non-commercial spiritual practice.",
  },
  {
    title: "Third-Party Services",
    body: "We use our own Node.js backend and MongoDB for authentication and data sync, and Cloudflare R2 for audio storage. These services operate under their own privacy policies. We encourage you to review them. We do not use advertising SDKs or trackers.",
  },
  {
    title: "Data Retention & Deletion",
    body: `Your data is retained as long as your account is active. You may delete your account at any time by contacting us at ${emailAddress}. Upon deletion, all your personal data is removed from our systems within 30 days.`,
  },
  {
    title: "Children's Privacy",
    body: "Gita Sadhana is suitable for all ages. We do not knowingly collect data from children under 13 without parental consent. If you believe a child has provided us with personal information, please contact us immediately.",
  },
  {
    title: "Contact",
    body: `For privacy-related inquiries, please reach us at ${emailAddress}. We are committed to resolving any concerns promptly and transparently.`,
  },
] as const;

export const termsSections = [
  {
    title: "Acceptance of Terms",
    body: "By using Gita Sadhana, you agree to these Terms of Service. If you do not agree, please discontinue use of the application. These terms apply to all users, including guests and registered members.",
  },
  {
    title: "Purpose of the App",
    body: "Gita Sadhana is a spiritual study companion designed to help individuals explore the Bhagavad Gita. The app provides translations, commentary, audio recitations, and personal study tools. It is intended for personal, non-commercial use only.",
  },
  {
    title: "User Accounts",
    body: "You may use the app as a guest or sign in with Google or Apple. By creating an account, you agree to provide accurate information and keep your credentials secure. You are responsible for all activity under your account.",
  },
  {
    title: "Content & Intellectual Property",
    body: "All content within Gita Sadhana — including translations, commentary, audio, and imagery — is either original or used with appropriate rights. You may not reproduce, distribute, or commercialize any content without prior written consent from Gita Sadhana.",
  },
  {
    title: "Offline Downloads",
    body: "Audio tracks downloaded for offline use are licensed solely for personal, non-commercial spiritual practice. You may not extract, redistribute, or use these recordings outside of the Gita Sadhana app.",
  },
  {
    title: "Prohibited Conduct",
    body: "You agree not to misuse the app, attempt to reverse-engineer any part of it, submit false correction reports, or engage in any activity that disrupts the service for others. Violations may result in account suspension.",
  },
  {
    title: "Disclaimer",
    body: "Gita Sadhana is provided as-is. While we strive for accuracy in all translations and commentary, we make no guarantees of completeness or correctness. For authoritative scriptural guidance, please consult a qualified teacher.",
  },
  {
    title: "Changes to Terms",
    body: "We may update these terms from time to time. Continued use of the app after changes constitutes your acceptance of the revised terms. We will notify users of significant changes via in-app notice.",
  },
  {
    title: "Contact",
    body: `Questions about these terms? Reach us at ${emailAddress}.`,
  },
] as const;
