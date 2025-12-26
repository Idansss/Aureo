import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default: "border-transparent bg-secondary text-secondary-foreground",
        subtle: "border-border bg-muted text-foreground",
        outline: "border-border bg-background text-foreground",
        accent: "border-primary/20 bg-primary/15 text-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
      },
      size: {
        sm: "px-3 py-1 text-[11px]",
        md: "px-4 py-1.5 text-[12px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({
  className,
  variant,
  size,
  ...props
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}
