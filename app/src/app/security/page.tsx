import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { IconBadge } from "@/components/ui/icon-badge";

export const metadata: Metadata = {
  title: "Security, Aureo",
  description: "Security practices and trust-first protections in Aureo.",
};

export default function SecurityPage() {
  return (
    <div className="space-y-10 pb-16">
      <PageHeader
        title="Security"
        description="Aureo is designed around trust. We pair verification with transparent signals to reduce scams and protect candidates."
      />

      <section className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <IconBadge
            icon={ShieldCheck}
            tone="neutral"
            size="md"
            className="mt-0.5 bg-secondary text-foreground border-border"
            iconClassName="text-primary"
          />
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Trust-first protections</h2>
            <p className="text-sm text-muted-foreground">
              Verification checks, response rate visibility, and report tooling help reduce low-quality postings. We recommend keeping communication inside Aureo until trust signals are established.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
