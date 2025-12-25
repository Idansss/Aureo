import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TimelineItem {
  title: string;
  description?: string;
  timestamp?: string;
  icon?: ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <ol className={cn("relative space-y-4 pl-6", className)}>
      {items.map((item, index) => (
        <li key={index} className="relative">
          <span className="absolute left-0 top-1.5 h-full w-0.5 bg-border" />
          <div className="absolute left-[-12px] top-0 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
            {item.icon ?? <span className="h-2 w-2 rounded-full bg-primary" />}
          </div>
          <div className="ml-4 rounded-[var(--radius)] border border-border bg-card p-3 shadow-sm">
            <p className="text-sm font-semibold text-foreground">
              {item.title}
            </p>
            {item.description && (
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
            )}
            {item.timestamp && (
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {item.timestamp}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
