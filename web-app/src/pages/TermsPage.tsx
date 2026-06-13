import { LegalPageShell } from "../components/legal-page";
import { termsSections } from "../lib/legal-content";
import type { AppRoute } from "../lib/hash-route";
import type { LanguageCode } from "../lib/gita-data";

export function TermsPage({
  language,
  onNavigate,
}: {
  language: LanguageCode;
  onNavigate: (route: AppRoute) => void;
}) {
  return (
    <LegalPageShell
      breadcrumbLabel="Terms of Service"
      title="Terms of Service"
      subtitle={`Rules and usage terms for GitaSadhana. (${language.toUpperCase()})`}
      onBack={() => onNavigate({ view: "home" })}
    >
      <p className="text-xs text-muted-foreground">Last updated: June 13, 2026</p>
      <div className="mt-6 space-y-6">
        {termsSections.map((section) => (
          <div key={section.title} className="space-y-1.5">
            <h3 className="font-serif text-base text-foreground">{section.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          </div>
        ))}
      </div>
    </LegalPageShell>
  );
}
