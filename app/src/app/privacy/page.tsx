import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Privacy, Aureo",
  description: "How Aureo handles data, privacy, and responsible hiring signals.",
};

export default function PrivacyPage() {
  return (
    <div className="space-y-10 pb-16">
      <PageHeader
        title="Privacy"
        description="Aureo is built for trust, we collect only what we need to operate the platform and improve hiring transparency."
      />

      <section className="space-y-6 rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">What we collect</h2>
          <p className="text-sm text-muted-foreground">
            Account information, profile details you choose to provide, and basic usage analytics to keep the product reliable and secure.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">How we use it</h2>
          <p className="text-sm text-muted-foreground">
            To run applications, show trust signals, prevent abuse, and help you manage your hiring workflow. We do not sell personal data.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Your controls</h2>
          <p className="text-sm text-muted-foreground">
            You can edit your profile, remove portfolio links, and request export or deletion of your data.
          </p>
        </div>
      </section>
    </div>
  );
}

