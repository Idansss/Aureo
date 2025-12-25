import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function TrustBadge({
  trustScore,
  verified,
  className,
}: {
  trustScore?: number | null;
  verified?: boolean | null;
  className?: string;
}) {
  const score = typeof trustScore === "number" ? trustScore : null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-foreground",
        className,
      )}
    >
      <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
      <span>{verified ? "Verified" : "Unverified"}</span>
      {score !== null ? (
        <span className="text-muted-foreground">Trust {score}</span>
      ) : null}
    </div>
  );
}

