"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";
import { useSettings } from "./settings-provider";

type SettingsLink = { href: string; label: string; description: string };

const settingsLinks: SettingsLink[] = [
  { href: routes.settings.account, label: "Account", description: "Identity and security" },
  { href: routes.settings.profile, label: "Profile", description: "Public profile and proof" },
  { href: routes.settings.appearance, label: "Appearance", description: "Theme and density" },
  { href: routes.settings.notifications, label: "Notifications", description: "Email and quiet hours" },
  { href: routes.settings.privacy, label: "Privacy and safety", description: "Visibility and blocklist" },
  { href: routes.settings.jobPreferences, label: "Job preferences", description: "Roles and salary signals" },
  { href: routes.settings.accessibility, label: "Accessibility", description: "Keyboard and focus" },
  { href: routes.settings.billing, label: "Billing", description: "Plan and invoices" },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-2">
      {settingsLinks.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "block rounded-[var(--radius)] border border-transparent px-3 py-2 transition",
              active ? "border-border bg-muted" : "hover:bg-muted",
            )}
          >
            <p className="text-sm font-semibold text-foreground">{link.label}</p>
            <p className="text-xs text-muted-foreground">{link.description}</p>
          </Link>
        );
      })}
    </nav>
  );
}

export function SettingsShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { settings } = useSettings();

  return (
    <div className="grid gap-8 md:grid-cols-[280px,1fr]">
      <aside className="hidden md:block">
        <div className="sticky top-24 rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Settings
          </p>
          <div className="mt-4">
            <NavList />
          </div>
        </div>
      </aside>

      <div className="space-y-8">
        <div className="flex items-center justify-between gap-3 md:hidden">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="justify-start gap-2">
                <Menu className="h-4 w-4" aria-hidden />
                Settings menu
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <NavList onNavigate={() => setMenuOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <Link
            href={routes.publicProfile(settings.account.username)}
            className="text-sm font-semibold text-primary underline underline-offset-4"
          >
            View public profile
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}
