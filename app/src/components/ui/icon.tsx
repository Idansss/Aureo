import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconBadge } from "@/components/ui/icon-badge";

const ICON_SIZES = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 22,
  xl: 28,
} as const;

export type IconSize = keyof typeof ICON_SIZES;
export type IconTone = "default" | "muted" | "brand";

export function UiIcon({
  icon: Icon,
  size = "md",
  tone = "default",
  label,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"svg"> & {
  icon: LucideIcon;
  size?: IconSize;
  tone?: IconTone;
  label?: string;
}) {
  const px = ICON_SIZES[size];
  const toneClass =
    tone === "brand" ? "text-primary" : tone === "muted" ? "text-muted-foreground" : "text-foreground";
  const a11y =
    typeof label === "string" && label.trim().length > 0
      ? { role: "img" as const, "aria-label": label.trim() }
      : { "aria-hidden": true as const };

  return (
    <Icon
      {...a11y}
      strokeWidth={2.25}
      className={cn(toneClass, className)}
      style={{ width: px, height: px }}
      {...props}
    />
  );
}

export function IconCircle({
  icon,
  size = "md",
  tone = "brand",
  className,
}: {
  icon: LucideIcon;
  size?: IconSize;
  tone?: IconTone;
  className?: string;
}) {
  const badgeSize = size === "lg" || size === "xl" ? "lg" : size === "xs" || size === "sm" ? "sm" : "md";
  const badgeTone = tone === "brand" ? "gold" : tone === "muted" ? "neutral" : "neutral";
  const iconClassName = tone === "default" ? "text-foreground" : undefined;

  return (
    <IconBadge icon={icon} size={badgeSize} tone={badgeTone} iconClassName={iconClassName} className={className} />
  );
}
