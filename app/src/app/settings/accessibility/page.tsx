"use client";

import { Keyboard } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SettingsRow } from "@/components/settings/settings-row";
import { useSettings } from "@/components/settings/settings-provider";
import { routes } from "@/lib/routes";

const shortcuts = [
  { keys: ["/"], description: "Open global search" },
  { keys: ["Esc"], description: "Close dialogs and sheets" },
  { keys: ["Tab"], description: "Move focus to the next control" },
  { keys: ["Shift", "Tab"], description: "Move focus to the previous control" },
  { keys: ["Enter"], description: "Activate focused button or link" },
] as const;

function Key({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-background px-2 py-1 text-xs font-semibold text-foreground shadow-sm">
      {children}
    </span>
  );
}

export default function AccessibilitySettingsPage() {
  const { settings, update } = useSettings();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Settings", href: routes.settings.root }, { label: "Accessibility" }]} />
      <PageHeader
        title="Accessibility"
        description="Keyboard, focus, and screen reader preferences."
        meta={<Badge variant="outline" className="gap-2"><Keyboard className="h-4 w-4 text-primary" aria-hidden />Keyboard</Badge>}
      />

      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-lg">Assistive preferences</CardTitle>
          <CardDescription>Settings that support clarity and usability.</CardDescription>
        </CardHeader>
        <CardContent className="gap-0">
          <SettingsRow
            title="Screen reader hints"
            description="Adds extra assistive labels for complex controls."
          >
            <div className="flex items-center justify-end">
              <Switch
                checked={settings.accessibility.screenReaderHints}
                onCheckedChange={(checked) => update("accessibility", { screenReaderHints: checked })}
              />
            </div>
          </SettingsRow>

          <SettingsRow
            title="Focus ring style"
            description="Strong focus rings improve navigation in bright conditions."
          >
            <Select
              value={settings.accessibility.focusRing}
              onValueChange={(value) => update("accessibility", { focusRing: value as any })}
            >
              <SelectTrigger className="rounded-[var(--radius)]">
                <SelectValue placeholder="Choose focus ring" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="strong">Strong</SelectItem>
              </SelectContent>
            </Select>
          </SettingsRow>

          <SettingsRow
            title="Keyboard shortcuts"
            description="View the shortcuts available throughout Aureo."
          >
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" className="w-full justify-between">
                  <span>View shortcuts</span>
                  <span className="text-xs text-muted-foreground">/</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Keyboard shortcuts</DialogTitle>
                  <DialogDescription>Designed to keep navigation fast and predictable.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  {shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.description}
                      className="flex items-center justify-between rounded-[var(--radius)] border border-border bg-background px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-foreground">{shortcut.description}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {shortcut.keys.map((key) => (
                          <Key key={key}>{key}</Key>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </SettingsRow>
        </CardContent>
      </Card>
    </div>
  );
}

