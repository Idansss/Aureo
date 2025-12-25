import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Terms, Aureo",
  description: "Terms of service for Aureo.",
};

export default function TermsPage() {
  return (
    <div className="space-y-10 pb-16">
      <PageHeader
        title="Terms of service"
        description="These terms outline expected behavior for seekers, employers, and visitors using Aureo."
      />

      <section className="space-y-6 rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Platform use</h2>
          <p className="text-sm text-muted-foreground">
            Do not post misleading roles, impersonate companies, or request sensitive information from candidates outside the application flow.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Employer responsibilities</h2>
          <p className="text-sm text-muted-foreground">
            Employers must provide accurate job details, salary clarity where required, and respond to candidates in a timely manner.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Candidate responsibilities</h2>
          <p className="text-sm text-muted-foreground">
            Candidates should provide truthful profile information and respect employer time by applying thoughtfully and communicating clearly.
          </p>
        </div>
      </section>
    </div>
  );
}

