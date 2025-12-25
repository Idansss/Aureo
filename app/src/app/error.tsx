"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconBadge } from "@/components/ui/icon-badge";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const router = useRouter();

  return (
    <div className="space-y-6 rounded-[var(--radius)] border border-border bg-card p-8 shadow-sm">
      <div className="flex items-start gap-3">
        <IconBadge
          icon={AlertTriangle}
          tone="neutral"
          size="md"
          className="mt-0.5 bg-secondary text-foreground border-border"
          iconClassName="text-primary"
        />
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            A page error occurred. You can retry, or navigate to a different area of the site.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => reset()}>
          Retry
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/")}>
          Go home
        </Button>
      </div>
    </div>
  );
}
