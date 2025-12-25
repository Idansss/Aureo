import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type IconBadgeTone = "gold" | "neutral" | "success" | "danger";
export type IconBadgeSize = "sm" | "md" | "lg";
export type IconBadgeVariant = "default" | "subtle" | "outlined";

const SIZE_STYLES: Record<
  IconBadgeSize,
  { container: string; icon: string }
> = {
  sm: {
    container: "h-8 w-8 rounded-xl",
    icon: "h-4 w-4",
  },
  md: {
    container: "h-10 w-10 rounded-xl",
    icon: "h-5 w-5",
  },
  lg: {
    container: "h-12 w-12 rounded-xl",
    icon: "h-6 w-6",
  },
};

const TONE_STYLES: Record<IconBadgeTone, Record<IconBadgeVariant, string>> = {
  neutral: {
    default: "bg-muted/50 text-foreground border-border/60",
    subtle: "bg-muted/30 text-foreground border-border/50",
    outlined: "bg-transparent text-foreground border-border/70",
  },
  gold: {
    default: "bg-primary/8 text-primary border-primary/15",
    subtle: "bg-primary/6 text-primary border-primary/10",
    outlined: "bg-transparent text-primary border-primary/25",
  },
  success: {
    default:
      "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
    subtle:
      "bg-emerald-500/8 text-emerald-700 border-emerald-500/15 dark:text-emerald-400",
    outlined:
      "bg-transparent text-emerald-700 border-emerald-500/30 dark:text-emerald-400",
  },
  danger: {
    default: "bg-destructive/10 text-destructive border-destructive/20",
    subtle: "bg-destructive/8 text-destructive border-destructive/15",
    outlined: "bg-transparent text-destructive border-destructive/30",
  },
};

export function IconBadge({
  icon: Icon,
  tone = "neutral",
  variant = "default",
  size = "md",
  label,
  className,
  iconClassName,
  ...props
}: Omit<React.ComponentPropsWithoutRef<"span">, "children"> & {
  icon: LucideIcon;
  tone?: IconBadgeTone;
  variant?: IconBadgeVariant;
  size?: IconBadgeSize;
  label?: string;
  iconClassName?: string;
}) {
  const styles = SIZE_STYLES[size];
  const a11y =
    typeof label === "string" && label.trim().length > 0
      ? { role: "img" as const, "aria-label": label.trim() }
      : { "aria-hidden": true as const };

  return (
    <span
      {...props}
      className={cn(
        "inline-grid shrink-0 place-items-center border shadow-sm shadow-black/5 dark:shadow-black/30",
        styles.container,
        TONE_STYLES[tone][variant],
        className,
      )}
    >
      <Icon
        {...a11y}
        strokeWidth={2.25}
        className={cn(styles.icon, "translate-y-[0.5px]", iconClassName)}
      />
    </span>
  );
}

