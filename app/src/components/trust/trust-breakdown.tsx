import { BadgeCheck, Gauge, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

export function TrustBreakdown({
  verified,
  responseRate,
  trustScore,
  reportsLast30Days,
  className,
}: {
  verified: boolean;
  responseRate: number;
  trustScore: number;
  reportsLast30Days: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-3 rounded-[var(--radius)] border border-border bg-card p-5 shadow-sm",
        className,
      )}
    >
      <p className="text-sm font-semibold text-foreground">Trust breakdown</p>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <BadgeCheck className="h-4 w-4 text-primary" aria-hidden />
            Verification
          </span>
          <span className="font-semibold text-foreground">{verified ? "Verified" : "Unverified"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <Gauge className="h-4 w-4 text-primary" aria-hidden />
            Response rate
          </span>
          <span className="font-semibold text-foreground">{responseRate}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <Flag className="h-4 w-4 text-primary" aria-hidden />
            Reports (30 days)
          </span>
          <span className="font-semibold text-foreground">{reportsLast30Days}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Trust score</span>
          <span className="font-semibold text-foreground">{trustScore}</span>
        </div>
      </div>
    </div>
  );
}

