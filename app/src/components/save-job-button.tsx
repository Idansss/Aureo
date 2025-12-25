"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { isJobSaved, toggleSavedJob } from "@/app/app/saved/actions";

export function SaveJobButton({
  jobId,
  className,
  preventNavigation,
}: {
  jobId: string;
  className?: string;
  preventNavigation?: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (typeof window === "undefined") return;
    setMounted(true);

    let cancelled = false;
    (async () => {
      const result = await isJobSaved(jobId);
      if (cancelled) return;
      if (result.ok) setSaved(result.data);
    })();

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const label = useMemo(() => (saved ? "Unsave job" : "Save job"), [saved]);

  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "rounded-[var(--radius)] border border-border bg-background p-2 text-muted-foreground shadow-sm transition hover:text-foreground",
        className,
      )}
      disabled={!mounted || pending}
      onClick={(event) => {
        if (preventNavigation) {
          event.preventDefault();
          event.stopPropagation();
        }

        startTransition(async () => {
          const result = await toggleSavedJob(jobId);
          if (!result.ok) {
            toast.error(result.error || "Could not update saved jobs.");
            return;
          }
          setSaved(result.data.saved);
          toast.success(result.data.saved ? "Saved job." : "Removed from saved.");
        });
      }}
    >
      <Bookmark
        className={cn(
          "h-5 w-5",
          saved ? "fill-primary text-primary" : "text-muted-foreground",
        )}
        aria-hidden
      />
    </button>
  );
}
