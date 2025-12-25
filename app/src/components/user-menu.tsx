"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, Settings, UserCircle2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type UserMenuProfile = {
  fullName?: string | null;
  role?: string | null;
  username?: string | null;
};

export function UserMenu({
  profile,
  dashboardHref,
  className,
}: {
  profile?: UserMenuProfile | null;
  dashboardHref: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const username = profile?.username ?? "";
  const displayName = profile?.fullName ?? "Account";
  const roleLabel = (profile?.role ?? "seeker") === "employer" ? "Employer" : "Seeker";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            className,
          )}
          aria-label="Open user menu"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {displayName.trim().slice(0, 1).toUpperCase()}
          </span>
          <span className="hidden sm:block">{displayName}</span>
          <Badge variant="outline" className="hidden sm:inline-flex">
            {roleLabel}
          </Badge>
        </button>
      </SheetTrigger>

      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Account</SheetTitle>
          <SheetDescription>Manage your profile, preferences, and appearance.</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="rounded-[var(--radius)] border border-border bg-secondary p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{displayName}</p>
                {username ? <p className="text-sm text-muted-foreground">@{username}</p> : null}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href={routes.publicProfile(username || "me")} onClick={() => setOpen(false)}>
                <span className="inline-flex items-center gap-2">
                  <UserCircle2 className="h-4 w-4" aria-hidden />
                  Public profile
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href={routes.settings.root} onClick={() => setOpen(false)}>
                <span className="inline-flex items-center gap-2">
                  <Settings className="h-4 w-4" aria-hidden />
                  Settings
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
              </Link>
            </Button>
            <Button asChild className="w-full justify-between">
              <Link href={dashboardHref} onClick={() => setOpen(false)}>
                <span>Go to dashboard</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
              </Link>
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Theme
            </p>
            <ThemeToggle triggerClassName="h-11 rounded-[var(--radius)]" className="min-w-0" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
