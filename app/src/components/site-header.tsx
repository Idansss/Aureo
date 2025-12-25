"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";
import { CommandPalette } from "@/components/command-palette";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";

interface SiteHeaderProps {
  isAuthenticated: boolean;
  profile?: {
    fullName?: string | null;
    role?: string | null;
    username?: string | null;
  } | null;
}

const links = [
  { href: routes.jobs, label: "Jobs" },
  { href: routes.employers.directory, label: "Employers" },
  { href: routes.pricing, label: "Pricing" },
  { href: routes.stories, label: "Stories" },
];

export function SiteHeader({ isAuthenticated, profile }: SiteHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const role = profile?.role ?? "seeker";
  const dashboardHref = role === "employer" ? routes.employer.dashboard : routes.app.dashboard;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Go to homepage" className="flex items-center gap-2 text-xl font-semibold">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            A
          </div>
          <span>Aureo</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                pathname.startsWith(link.href) && "text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <CommandPalette
            trigger={
              <Button type="button" variant="outline" className="gap-2">
                <Search className="h-4 w-4" aria-hidden />
                Search
                <span className="ml-2 rounded-full border border-border bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  Ctrl K
                </span>
              </Button>
            }
          />
          <ThemeToggle className="hidden lg:block" />
          {isAuthenticated ? (
            <>
              <Button variant="ghost" asChild>
                <Link href={routes.jobs}>Find jobs</Link>
              </Button>
              {role !== "employer" ? (
                <Button variant="ghost" asChild>
                  <Link href={routes.app.saved}>Saved</Link>
                </Button>
              ) : null}
              <UserMenu profile={profile} dashboardHref={dashboardHref} />
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href={routes.auth.login}>Sign in</Link>
              </Button>
              <Button asChild>
                <Link href={routes.auth.register}>Create account</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="lg:hidden text-foreground"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-background px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Navigate</span>
            <button
              type="button"
              className="rounded-full border border-border p-2 text-foreground"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-6 flex flex-col gap-4 text-lg">
            <CommandPalette
              trigger={
                <Button type="button" variant="outline" className="justify-start gap-2">
                  <Search className="h-4 w-4" aria-hidden />
                  Search
                </Button>
              }
            />
            <div className="rounded-[var(--radius)] border border-border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Theme
              </p>
              <div className="mt-3">
                <ThemeToggle triggerClassName="h-11 w-full rounded-[var(--radius)]" className="min-w-0" />
              </div>
            </div>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-[var(--radius)] px-3 py-2 text-foreground",
                  pathname.startsWith(link.href) &&
                    "bg-muted",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-border pt-4">
              {isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  <Link
                    href={routes.settings.root}
                    onClick={() => setOpen(false)}
                    className="text-base font-semibold"
                  >
                    Settings
                  </Link>
                  <Link
                    href={routes.publicProfile(profile?.username || "me")}
                    onClick={() => setOpen(false)}
                    className="text-sm text-muted-foreground"
                  >
                    Public profile
                  </Link>
                  <Link
                    href={dashboardHref}
                    onClick={() => setOpen(false)}
                    className="text-base font-semibold"
                  >
                    Go to dashboard
                  </Link>
                  <Link
                    href="/jobs"
                    onClick={() => setOpen(false)}
                    className="text-sm text-muted-foreground"
                  >
                    Continue browsing jobs
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Button asChild onClick={() => setOpen(false)}>
                    <Link href={routes.auth.register}>Create account</Link>
                  </Button>
                  <Button variant="ghost" asChild onClick={() => setOpen(false)}>
                    <Link href={routes.auth.login}>Sign in</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
