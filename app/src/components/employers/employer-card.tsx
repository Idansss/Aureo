import Link from "next/link";
import { Building2, CheckCircle2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CompanyRecord } from "@/lib/types";
import { routes } from "@/lib/routes";
import { UiIcon } from "@/components/ui/icon";
import { IconBadge } from "@/components/ui/icon-badge";

export function EmployerCard({
  employer,
  openRoles,
  className,
}: {
  employer: CompanyRecord & { slug: string };
  openRoles: number;
  className?: string;
}) {
  return (
    <Link
      href={routes.employers.profile(employer.slug)}
      className={cn(
        "group flex h-full flex-col gap-4 rounded-[var(--radius)] border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <IconBadge icon={Building2} tone="neutral" size="lg" className="mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-foreground">{employer.name}</h3>
              {employer.verified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-foreground">
                  <UiIcon icon={CheckCircle2} size="xs" tone="brand" />
                  Verified
                </span>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">
              {employer.location ?? "Remote"}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="shrink-0">
          {openRoles} roles
        </Badge>
      </div>

      <div className="grid gap-2 rounded-[var(--radius)] border border-border bg-secondary p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Trust score</span>
          <span className="font-semibold text-foreground">{employer.trust_score ?? 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Response rate</span>
          <span className="font-semibold text-foreground">{employer.response_rate ?? 0}%</span>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between text-sm">
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <UiIcon icon={ShieldCheck} size="sm" tone="brand" />
          Trust details inside
        </span>
        <span className="font-semibold text-primary">View profile</span>
      </div>
    </Link>
  );
}
