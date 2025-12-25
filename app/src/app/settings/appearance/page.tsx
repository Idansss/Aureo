"use client";

import { PageHeader } from "@/components/page-header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsRow } from "@/components/settings/settings-row";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeSamples } from "@/components/settings/theme-samples";
import { useSettings } from "@/components/settings/settings-provider";
import { routes } from "@/lib/routes";

export default function AppearanceSettingsPage() {
  const { settings, update } = useSettings();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Settings", href: routes.settings.root }, { label: "Appearance" }]} />
      <PageHeader
        title="Appearance"
        description="Theme, density, and comfort settings that persist on this device."
        meta={<Badge variant="outline">Applies instantly</Badge>}
      />

      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-lg">Theme</CardTitle>
          <CardDescription>Switch between system, light, and dark mode.</CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <div className="max-w-sm">
            <ThemeToggle triggerClassName="h-[var(--control-h)] rounded-[var(--radius)]" className="min-w-0" />
          </div>
          <ThemeSamples />
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-lg">Comfort</CardTitle>
          <CardDescription>Dial in spacing, text size, and motion.</CardDescription>
        </CardHeader>
        <CardContent className="gap-0">
          <SettingsRow
            title="Density"
            description="Compact density reduces control height and page spacing."
          >
            <Select
              value={settings.appearance.density}
              onValueChange={(value) => update("appearance", { density: value as any })}
            >
              <SelectTrigger className="rounded-[var(--radius)]">
                <SelectValue placeholder="Choose density" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comfortable">Comfortable</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
              </SelectContent>
            </Select>
          </SettingsRow>

          <SettingsRow
            title="Font size"
            description="Adjusts the base font size for all pages."
          >
            <Select
              value={settings.appearance.fontSize}
              onValueChange={(value) => update("appearance", { fontSize: value as any })}
            >
              <SelectTrigger className="rounded-[var(--radius)]">
                <SelectValue placeholder="Choose size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </SettingsRow>

          <SettingsRow
            title="Reduce motion"
            description="Minimizes animation and transitions across the UI."
          >
            <div className="flex items-center justify-end">
              <Switch
                checked={settings.appearance.reduceMotion}
                onCheckedChange={(checked) => update("appearance", { reduceMotion: checked })}
              />
            </div>
          </SettingsRow>

          <SettingsRow
            title="High contrast"
            description="Boosts muted text and border contrast for clarity."
          >
            <div className="flex items-center justify-end">
              <Switch
                checked={settings.appearance.highContrast}
                onCheckedChange={(checked) => update("appearance", { highContrast: checked })}
              />
            </div>
          </SettingsRow>
        </CardContent>
      </Card>
    </div>
  );
}

