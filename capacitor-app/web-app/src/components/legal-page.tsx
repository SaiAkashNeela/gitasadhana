import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Breadcrumbs, Card, PageFrame, SectionHeading } from "./site-shell";

export function LegalPageShell({
  breadcrumbLabel,
  title,
  subtitle,
  onBack,
  children,
}: {
  breadcrumbLabel: string;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: ReactNode;
}) {
  return (
    <PageFrame>
      <section className="space-y-6">
        <Breadcrumbs items={[{ label: "GitaSadhana", href: "/" }, { label: breadcrumbLabel }]} />
        <SectionHeading
          eyebrow="Support"
          title={title}
          sub={subtitle}
          action={
            onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-foreground"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            ) : null
          }
        />
        <Card className="overflow-hidden p-5 md:p-6">{children}</Card>
      </section>
    </PageFrame>
  );
}
