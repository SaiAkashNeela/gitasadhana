import { useState } from "react";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { LegalPageShell } from "../components/legal-page";
import { emailAddress } from "../lib/legal-content";
import { sendContactEmail } from "../lib/email";
import type { AppRoute } from "../lib/hash-route";
import type { LanguageCode } from "../lib/gita-data";

export function ContactPage({
  language,
  signedInEmail,
  onNavigate,
}: {
  language: LanguageCode;
  signedInEmail?: string | null;
  onNavigate: (route: AppRoute) => void;
}) {
  const [email, setEmail] = useState(signedInEmail ?? "");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  return (
    <LegalPageShell
      breadcrumbLabel="Contact Us"
      title="Contact Us"
      subtitle="Need help, have feedback, or want to reach the team directly?"
      onBack={() => onNavigate({ view: "home" })}
    >
      <div className="space-y-5">
        <div className="rounded-[24px] border border-amber-100 bg-amber-50/70 p-4">
          <div className="flex items-start gap-3">
            <Info size={18} className="mt-0.5 text-amber-700" />
            <div className="space-y-1">
              <p className="text-sm text-foreground">
                You can also email us directly at{" "}
                <a className="font-medium text-amber-800" href={`mailto:${emailAddress}`}>
                  {emailAddress}
                </a>
              </p>
              <p className="text-xs text-muted-foreground">
                Please allow us a little time to respond thoughtfully.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
              Your Email
            </span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="your@email.com"
              className="w-full rounded-[18px] border border-black/8 bg-white px-4 py-3 text-sm text-foreground outline-none focus:border-amber-300"
            />
          </label>
          <div className="md:col-span-2">
            <label className="space-y-1.5">
              <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                Message
              </span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={7}
                placeholder="Tell us what you need help with."
                className="w-full rounded-[18px] border border-black/8 bg-white px-4 py-3 text-sm text-foreground outline-none focus:border-amber-300"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={sending}
            onClick={async () => {
              if (!email.trim() || !message.trim()) {
                toast.error("Email and message are required.");
                return;
              }
              setSending(true);
              try {
                await sendContactEmail(email.trim(), message.trim());
                toast.success("Message sent successfully.");
                setMessage("");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to send message.");
              } finally {
                setSending(false);
              }
            }}
            className="rounded-full bg-[#a96616] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-amber-900/10 disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send Message"}
          </button>
          <button
            type="button"
            onClick={() => onNavigate({ view: "report" })}
            className="rounded-full border border-black/8 bg-white px-5 py-3 text-sm font-medium text-foreground"
          >
            Report an Issue
          </button>
        </div>

        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
          Language: {language}
        </p>
      </div>
    </LegalPageShell>
  );
}
