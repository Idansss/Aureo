import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export function PricingHero() {
  return (
    <section className="space-y-6 rounded-[var(--radius)] border border-border bg-card px-6 py-10 shadow-sm md:px-12">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          Pricing
        </p>
        <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
          Plans shaped around proof, trust, and calm hiring.
        </h1>
        <p className="text-lg text-muted-foreground sm:max-w-3xl">
          Aureo aligns seekers and hiring teams with verified profiles, transparent pipelines, and
          measurable accountability. Pick the plan that matches your hiring rhythm.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" className="w-full sm:w-auto" asChild>
          <Link href={routes.auth.register}>Get started</Link>
        </Button>
        <Button size="lg" variant="ghost" className="w-full sm:w-auto" asChild>
          <a href={routes.contact.sales}>Talk to our team</a>
        </Button>
      </div>
    </section>
  );
}
