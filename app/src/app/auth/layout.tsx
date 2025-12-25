import { ReactNode } from "react";
import { supabaseServer } from "@/lib/supabase/server";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const supabase = await supabaseServer();
  const { data } = await supabase.from("platform_metrics_public").select("*").maybeSingle();
  const verifiedEmployers = Number((data as any)?.verified_employers ?? 0);
  const activeRoles = Number((data as any)?.active_roles ?? 0);

  return (
    <div className="grid min-h-[70vh] gap-8 rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm md:grid-cols-2 md:p-10">
      <div className="space-y-6 rounded-[var(--radius)] border border-border bg-secondary p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Aureo access
        </p>
        <h1 className="text-3xl font-semibold text-foreground">
          Bring trust, proof, and calm process to every hire.
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in with your Aureo identity to sync applications, recommended roles, and employer dashboards.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 rounded-[var(--radius)] border border-border bg-background p-3">
            <p className="text-2xl font-semibold text-foreground">
              {verifiedEmployers.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Verified employers</p>
          </div>
          <div className="space-y-1 rounded-[var(--radius)] border border-border bg-background p-3">
            <p className="text-2xl font-semibold text-foreground">
              {activeRoles.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Active roles</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center">{children}</div>
    </div>
  );
}
