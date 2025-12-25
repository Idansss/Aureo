import { trustPoints, metrics } from "./data";
import { IconBadge } from "@/components/ui/icon-badge";

export function TrustSafety() {
  return (
    <section className="grid gap-6 rounded-[var(--radius)] border border-border bg-background p-6 shadow-sm md:grid-cols-[1.2fr_0.8fr] md:p-8">
      <div className="space-y-4 rounded-[var(--radius)] border border-border bg-card p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          Trust & safety
        </p>
        <h2 className="text-2xl font-semibold text-foreground">
          Proof-first verification for every profile and role.
        </h2>
        <p className="text-sm text-muted-foreground">
          We pair automation with manual reviews so seekers and employers always collaborate inside
          transparent rails. No dark patterns, no hidden marketplaces.
        </p>
        <div className="space-y-4">
          {trustPoints.map((point) => (
            <article
              key={point.title}
              className="flex gap-3 rounded-[var(--radius)] border border-border bg-background p-4"
            >
              <IconBadge icon={point.icon} tone="gold" size="sm" className="mt-1" />
              <div>
                <h3 className="text-base font-semibold text-foreground">{point.title}</h3>
                <p className="text-sm text-muted-foreground">{point.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="space-y-4 rounded-[var(--radius)] border border-border bg-card p-6">
        <h3 className="text-base font-semibold text-foreground">Operational stats</h3>
        <p className="text-sm text-muted-foreground">
          Trust metrics are audited every week so everyone has the same data.
        </p>
        <div className="grid gap-4">
          {metrics.map((metric) => (
            <div key={metric.title} className="rounded-[var(--radius)] border border-border bg-background p-4">
              <p className="text-3xl font-semibold text-foreground">{metric.value}</p>
              <p className="text-sm font-medium text-foreground">{metric.title}</p>
              <p className="text-xs text-muted-foreground">{metric.helper}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
