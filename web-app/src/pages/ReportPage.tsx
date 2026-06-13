import { useState } from "react";
import { toast } from "sonner";
import { LegalPageShell } from "../components/legal-page";
import { sendCorrectionEmail } from "../lib/email";
import { languageOptions, type LanguageCode } from "../lib/gita-data";
import type { AppRoute } from "../lib/hash-route";

const CHAPTER_VERSE_COUNTS: Record<number, number> = {
  1: 47,
  2: 72,
  3: 43,
  4: 42,
  5: 29,
  6: 47,
  7: 30,
  8: 28,
  9: 34,
  10: 42,
  11: 55,
  12: 20,
  13: 35,
  14: 27,
  15: 20,
  16: 24,
  17: 28,
  18: 78,
};

export function ReportPage({
  language,
  signedInEmail,
  onNavigate,
}: {
  language: LanguageCode;
  signedInEmail?: string | null;
  onNavigate: (route: AppRoute) => void;
}) {
  const [reportLanguage, setReportLanguage] = useState<LanguageCode>(language);
  const [chapter, setChapter] = useState("");
  const [verse, setVerse] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(signedInEmail ?? "");
  const [sending, setSending] = useState(false);

  const verseCount = chapter ? CHAPTER_VERSE_COUNTS[Number(chapter)] || 0 : 0;
  const verseOptions = Array.from({ length: verseCount }, (_, index) => String(index + 1));

  return (
    <LegalPageShell
      breadcrumbLabel="Report an Issue"
      title="Report a Verse Correction"
      subtitle="Share a translation issue, correction, or feedback about a specific verse."
      onBack={() => onNavigate({ view: "home" })}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
            Language
          </span>
          <select
            value={reportLanguage}
            onChange={(event) => setReportLanguage(event.target.value as LanguageCode)}
            className="w-full rounded-[18px] border border-black/8 bg-white px-4 py-3 text-sm text-foreground outline-none focus:border-amber-300"
          >
            {languageOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
            Your Email
          </span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="optional@email.com"
            className="w-full rounded-[18px] border border-black/8 bg-white px-4 py-3 text-sm text-foreground outline-none focus:border-amber-300"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Chapter</span>
          <select
            value={chapter}
            onChange={(event) => {
              setChapter(event.target.value);
              setVerse("");
            }}
            className="w-full rounded-[18px] border border-black/8 bg-white px-4 py-3 text-sm text-foreground outline-none focus:border-amber-300"
          >
            <option value="">Select chapter</option>
            {Array.from({ length: 18 }, (_, index) => index + 1).map((value) => (
              <option key={value} value={String(value)}>
                Chapter {value}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Verse</span>
          <select
            value={verse}
            onChange={(event) => setVerse(event.target.value)}
            disabled={!chapter}
            className="w-full rounded-[18px] border border-black/8 bg-white px-4 py-3 text-sm text-foreground outline-none focus:border-amber-300 disabled:opacity-50"
          >
            <option value="">Select verse</option>
            {verseOptions.map((value) => (
              <option key={value} value={value}>
                Verse {value}
              </option>
            ))}
          </select>
        </label>

        <div className="md:col-span-2">
          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
              Describe the issue
            </span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={7}
              placeholder="Tell us what needs to be corrected."
              className="w-full rounded-[18px] border border-black/8 bg-white px-4 py-3 text-sm text-foreground outline-none focus:border-amber-300"
            />
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={sending}
          onClick={async () => {
            if (!reportLanguage || !chapter || !verse || !message.trim()) {
              toast.error("All fields are required.");
              return;
            }
            setSending(true);
            try {
              await sendCorrectionEmail(
                reportLanguage,
                chapter,
                verse,
                message.trim(),
                email.trim() || undefined,
              );
              toast.success("Correction submitted. Thank you!");
              setMessage("");
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Failed to submit report.");
            } finally {
              setSending(false);
            }
          }}
          className="rounded-full bg-[#a96616] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-amber-900/10 disabled:opacity-50"
        >
          {sending ? "Submitting..." : "Submit Correction"}
        </button>
      </div>
    </LegalPageShell>
  );
}
