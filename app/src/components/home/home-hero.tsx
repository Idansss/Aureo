import Link from "next/link";
import { FileText, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchBar } from "@/components/ui/search-bar";
import { HomeMetrics } from "@/components/home/home-metrics";
import { TrustBadge } from "@/components/trust/trust-badge";
import { IconBadge } from "@/components/ui/icon-badge";
import { routes } from "@/lib/routes";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-sm">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_hsl(var(--primary)/0.18),_transparent_55%)]" />
      <div className="relative grid gap-10 p-6 md:grid-cols-[1.1fr_0.9fr] md:p-10">
        <div className="space-y-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs uppercase tracking-[0.28em]">
              Trust-first hiring
            </Badge>
          </div>

          <div className="space-y-4">
            <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              Hiring that balances{" "}
              <span className="underline decoration-primary/40 decoration-[3px] underline-offset-8">
                trust
              </span>
              ,{" "}
              <span className="underline decoration-primary/40 decoration-[3px] underline-offset-8">
                proof
              </span>
              , and calm speed.
            </h1>
            <p className="max-w-[62ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
              Aureo verifies employers, helps candidates attach proof once, and keeps every application tracked with transparent trust signals.
            </p>
          </div>

          <div className="space-y-6">
            <SearchBar />
            <div className="border-t border-border pt-6">
              <HomeMetrics />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[var(--radius)] border border-border bg-background p-4">
            <div className="flex items-start gap-3">
              <IconBadge icon={ShieldCheck} tone="gold" size="lg" className="mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Trust transparency</p>
                <p className="text-sm text-muted-foreground">
                  Every job includes trust score, response rate, and safety signals so you can decide quickly.
                </p>
              </div>
            </div>
          </div>

          <Card className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  Candidate snapshot
                </p>
                <p className="text-lg font-semibold text-foreground">Lead Product Designer</p>
                <p className="text-sm text-muted-foreground">
                  Aureo, remote friendly, verified employer
                </p>
              </div>
              <Badge variant="subtle" className="h-fit">
                Example
              </Badge>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <TrustBadge verified trustScore={92} />
              <Badge variant="outline">Portfolio attached</Badge>
              <Badge variant="outline">Response rate high</Badge>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <Button asChild size="lg" className="w-full">
                <Link href="/jobs">Apply with Aureo profile</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={routes.stories}>See trust stories</Link>
              </Button>
            </div>
          </Card>

          <div className="rounded-[var(--radius)] border border-border bg-secondary p-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <IconBadge icon={FileText} tone="gold" size="lg" className="mt-0.5" />
              <p>
                Reuse your profile, resume, and case studies across applications, then keep employers accountable with response tracking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
