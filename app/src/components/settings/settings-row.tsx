"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function SettingsRow({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-border py-4 last:border-b-0 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1 sm:max-w-[360px]">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="min-w-0 sm:w-[360px]">{children}</div>
    </div>
  );
}

