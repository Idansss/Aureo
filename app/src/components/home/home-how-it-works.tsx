import Link from "next/link";
import { BadgeCheck, FileText, KanbanSquare } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconBadge } from "@/components/ui/icon-badge";
import { routes } from "@/lib/routes";

const steps = [
  {
    title: "Verify employers",
    description:
      "Teams publish structured roles, clear salary ranges, and verified company details so you can trust the baseline.",
    icon: BadgeCheck,
  },
  {
    title: "Attach proof once",
    description:
      "Build a reusable Aureo profile with work samples, case studies, and a resume link that travels with every application.",
    icon: FileText,
  },
  {
    title: "Track with trust signals",
    description:
      "Stay calm with response-rate tracking, trust scores, and an applications timeline that surfaces real progress.",
    icon: KanbanSquare,
  },
] as const;

export function HomeHowItWorks() {
  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          title="Proof-based hiring, without the chaos"
          description="Aureo keeps both sides aligned with transparent roles, reusable profiles, and calm tracking."
        />
        <Button asChild variant="outline" className="w-full md:w-auto">
          <Link href={routes.settings.profile}>Build your profile</Link>
        </Button>
      </div>

      <ol className="grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <li key={step.title}>
              <Card className="h-full p-6">
                <div className="flex items-start justify-between gap-3">
                  <IconBadge icon={Icon} tone="gold" size="lg" />
                  <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </Card>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
