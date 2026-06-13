import { LegalPageShell } from "../components/legal-page";
import { privacySections } from "../lib/legal-content";
import type { AppRoute } from "../lib/hash-route";
import type { LanguageCode } from "../lib/gita-data";

export function PrivacyPage({
  language,
  onNavigate,
}: {
  language: LanguageCode;
  onNavigate: (route: AppRoute) => void;
}) {
  return (
    <LegalPageShell
      breadcrumbLabel="Privacy Policy"
      title="Privacy Policy"
      subtitle={`How GitaSadhana handles data and device storage. (${language.toUpperCase()})`}
      onBack={() => onNavigate({ view: "home" })}
    >
      <p className="text-xs text-muted-foreground">Last updated: June 13, 2026</p>
      <div className="mt-6 space-y-6">
        {privacySections.map((section) => (
          <div key={section.title} className="space-y-1.5">
            <h3 className="font-serif text-base text-foreground">{section.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          </div>
        ))}
      </div>
    </LegalPageShell>
  );
}
