"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function ThemeSamples({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-3", className)}>
      <div className="rounded-[var(--radius)] border border-border bg-background p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Light
        </p>
        <p className="mt-2 text-sm font-semibold text-foreground">High clarity</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Dark text on calm surfaces.
        </p>
      </div>
      <div className="rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Current
        </p>
        <p className="mt-2 text-sm font-semibold text-foreground">Token based</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Same layout, adaptive colors.
        </p>
      </div>
      <div className="rounded-[var(--radius)] border border-border bg-secondary p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Dark
        </p>
        <p className="mt-2 text-sm font-semibold text-foreground">Low glare</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Balanced contrast, calmer nights.
        </p>
      </div>
    </div>
  );
}



