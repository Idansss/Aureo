 "use client";

import * as React from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { formatSupabaseError, isSchemaMissingError } from "@/lib/supabase/error";

type Metrics = {
  verifiedEmployers: number;
  activeRoles: number;
  avgResponseTimeHours: number | null;
};

function formatDays(hours: number | null) {
  if (hours == null) return "—";
  const days = hours / 24;
  return `${days.toFixed(1)} days`;
}

export function HomeMetrics() {
  const [metrics, setMetrics] = React.useState<Metrics | null>(null);

  React.useEffect(() => {
    const supabase = supabaseBrowser();

    const load = async () => {
      const { data, error } = await supabase.from("platform_metrics_public").select("*").maybeSingle();
      if (error) {
        const meta = formatSupabaseError(error);
        console.error("Failed to load platform metrics:", meta, error);
        if (isSchemaMissingError(error)) setMetrics(null);
        return;
      }
      if (!data) return;
      setMetrics({
        verifiedEmployers: Number((data as any).verified_employers ?? 0),
        activeRoles: Number((data as any).active_roles ?? 0),
        avgResponseTimeHours: ((data as any).avg_response_time_hours ?? null) as any,
      });
    };

    load();
    const id = window.setInterval(load, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-[var(--radius)] border border-border bg-background p-4">
        <p className="text-2xl font-semibold tracking-tight text-foreground">
          {metrics ? metrics.verifiedEmployers.toLocaleString() : "—"}
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground">Verified employers</p>
        <p className="mt-1 text-sm text-muted-foreground">Verified continuously.</p>
      </div>

      <div className="rounded-[var(--radius)] border border-border bg-background p-4">
        <p className="text-2xl font-semibold tracking-tight text-foreground">
          {metrics ? metrics.activeRoles.toLocaleString() : "—"}
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground">Active roles</p>
        <p className="mt-1 text-sm text-muted-foreground">Live listings right now.</p>
      </div>

      <div className="rounded-[var(--radius)] border border-border bg-background p-4">
        <p className="text-2xl font-semibold tracking-tight text-foreground">
          {metrics ? formatDays(metrics.avgResponseTimeHours) : "—"}
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground">Avg. response time</p>
        <p className="mt-1 text-sm text-muted-foreground">Based on first employer action.</p>
      </div>
    </div>
  );
}

