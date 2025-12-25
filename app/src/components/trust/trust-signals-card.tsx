import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrustBadge } from "@/components/trust/trust-badge";
import { IconBadge } from "@/components/ui/icon-badge";

export function TrustSignalsCard({
  verified,
  trustScore,
  responseRate,
}: {
  verified?: boolean | null;
  trustScore?: number | null;
  responseRate?: number | null;
}) {
  const score = typeof trustScore === "number" ? trustScore : null;
  const response = typeof responseRate === "number" ? responseRate : null;

  return (
    <div className="rounded-[var(--radius)] border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Trust signals</p>
          <p className="text-sm text-muted-foreground">
            Verification, response rate, and trust score help you avoid low-signal roles.
          </p>
        </div>
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="Trust signals help"
              >
                <IconBadge icon={Info} tone="neutral" size="md" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[280px]">
              Trust score is a composite of verification and platform behavior. Response rate is based on recent employer activity.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <TrustBadge verified={Boolean(verified)} trustScore={score ?? undefined} />
        {response !== null ? (
          <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-foreground">
            Response {response}%
          </span>
        ) : null}
      </div>
    </div>
  );
}
