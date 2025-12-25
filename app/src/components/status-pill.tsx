import { cn } from "@/lib/utils";

const colorMap: Record<string, string> = {
  // Application statuses
  applied: "bg-secondary text-foreground border-border",
  screening: "bg-primary/15 text-foreground border-primary/25",
  shortlisted: "bg-primary/20 text-foreground border-primary/30",
  interview: "bg-secondary text-foreground border-border",
  offer: "bg-primary/20 text-foreground border-primary/30",
  hired: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30",
  rejected: "bg-destructive/10 text-foreground border-destructive/25",
  withdrawn: "bg-muted text-foreground border-border",
  // Job statuses
  draft: "bg-muted text-foreground border-border",
  live: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30",
  active: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30",
  paused: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  filled: "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30",
  closed: "bg-muted text-foreground border-border",
};

interface StatusPillProps {
  status: string;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  const normalized = status.toLowerCase() as keyof typeof colorMap;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize",
        colorMap[normalized] ?? "bg-muted text-foreground border-border",
        className,
      )}
    >
      {status}
    </span>
  );
}
