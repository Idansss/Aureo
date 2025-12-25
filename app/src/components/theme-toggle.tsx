"use client";

import * as React from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const iconByTheme: Record<string, React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  system: Laptop,
  light: Sun,
  dark: Moon,
};

export function ThemeToggle({
  className,
  triggerClassName,
}: {
  className?: string;
  triggerClassName?: string;
}) {
  const { theme, setTheme } = useTheme();
  const value = theme ?? "system";
  const Icon = iconByTheme[value] ?? Laptop;

  return (
    <div className={cn("min-w-[140px]", className)}>
      <Select value={value} onValueChange={setTheme}>
        <SelectTrigger
          aria-label="Theme"
          className={cn("h-[var(--control-h)] rounded-full", triggerClassName)}
        >
          <span className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
            <SelectValue placeholder="Theme" />
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="system">System</SelectItem>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
