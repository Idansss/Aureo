import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export function FinalPricingCTA() {
  return (
    <section className="rounded-[var(--radius)] border border-border bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 shadow-sm md:p-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Ready to build trustworthy hiring?</h2>
          <p className="text-sm text-muted-foreground">
            Launch a verified profile, surface proof, and invite your team into a shared timeline in minutes.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href={routes.auth.register}>Create Aureo account</Link>
          </Button>
          <Button variant="ghost" size="lg" asChild>
            <a href={routes.contact.sales}>Schedule a walkthrough</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
