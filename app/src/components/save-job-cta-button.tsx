"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isJobSaved, toggleSavedJob } from "@/app/app/saved/actions";

export function SaveJobCtaButton({
  jobId,
  variant = "outline",
  className,
  preventNavigation,
  savedLabel = "Saved",
  unsavedLabel = "Save job",
}: {
  jobId: string;
  variant?: "primary" | "secondary" | "ghost" | "outline" | "destructive";
  className?: string;
  preventNavigation?: boolean;
  savedLabel?: string;
  unsavedLabel?: string;
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

  const label = useMemo(() => (saved ? savedLabel : unsavedLabel), [saved, savedLabel, unsavedLabel]);

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <Button
        type="button"
        variant={variant}
        className={cn("gap-2", className)}
        disabled
        aria-label="Loading..."
      >
        <Bookmark className="h-4 w-4 text-muted-foreground" aria-hidden />
        {unsavedLabel}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      className={cn("gap-2", className)}
      aria-label={label}
      disabled={pending}
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
          "h-4 w-4",
          saved ? "fill-primary text-primary" : "text-muted-foreground",
        )}
        aria-hidden
      />
      {pending ? "Saving..." : label}
    </Button>
  );
}

