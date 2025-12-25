"use client";

import * as React from "react";
import { BadgeCheck, MapPin } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SettingsRow } from "@/components/settings/settings-row";
import { TagsInput } from "@/components/settings/tags-input";
import { useSettings } from "@/components/settings/settings-provider";
import { routes } from "@/lib/routes";
import { UiIcon } from "@/components/ui/icon-client";

const employmentOptions = [
  "Full-time",
  "Contract",
  "Part-time",
  "Hybrid",
] as const;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function JobPreferencesSettingsPage() {
  const { settings, update } = useSettings();
  const salaryMin = settings.jobPreferences.salaryMin;
  const salaryMax = settings.jobPreferences.salaryMax;

  const minBound = 30000;
  const maxBound = 250000;

  const safeSetSalary = React.useCallback(
    (nextMin: number, nextMax: number) => {
      const minValue = clamp(nextMin, minBound, maxBound);
      const maxValue = clamp(nextMax, minBound, maxBound);
      update("jobPreferences", {
        salaryMin: Math.min(minValue, maxValue),
        salaryMax: Math.max(minValue, maxValue),
      });
    },
    [update],
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Settings", href: routes.settings.root }, { label: "Job preferences" }]} />
      <PageHeader
        title="Job preferences"
        description="Tell Aureo what roles and conditions are worth your attention."
        meta={
          <Badge variant="outline" className="gap-2">
            <UiIcon icon={BadgeCheck} size="sm" tone="brand" />
            Matching signals
          </Badge>
        }
      />

      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-lg">Roles and skills</CardTitle>
          <CardDescription>Used for recommendations and alerts.</CardDescription>
        </CardHeader>
        <CardContent className="gap-0">
          <SettingsRow title="Roles interested in" description="Add roles, specialties, or keywords.">
            <TagsInput
              value={settings.jobPreferences.roles}
              onChange={(roles) => update("jobPreferences", { roles })}
              placeholder="e.g. Staff Product Designer"
            />
          </SettingsRow>
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-lg">Location</CardTitle>
          <CardDescription>Filter roles by work mode.</CardDescription>
        </CardHeader>
        <CardContent className="gap-0">
          <SettingsRow title="Work modes" description="Toggle where you can work.">
            <div className="space-y-3">
              {[
                { key: "remote", label: "Remote", helper: "Work from anywhere." },
                { key: "hybrid", label: "Hybrid", helper: "Mix remote and office time." },
                { key: "onsite", label: "On-site", helper: "In person roles." },
              ].map((item) => {
                const checked = (settings.jobPreferences.locations as any)[item.key] as boolean;
                return (
                  <label
                    key={item.key}
                    className="flex cursor-pointer items-start gap-3 rounded-[var(--radius)] border border-border bg-background p-3 hover:bg-muted"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) =>
                        update("jobPreferences", {
                          locations: {
                            ...settings.jobPreferences.locations,
                            [item.key]: Boolean(value),
                          },
                        })
                      }
                      aria-label={item.label}
                    />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.helper}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </SettingsRow>
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-lg">Compensation</CardTitle>
          <CardDescription>Set a range so Aureo highlights high-signal roles.</CardDescription>
        </CardHeader>
        <CardContent className="gap-0">
          <SettingsRow title="Salary range" description="Annual USD estimate for your next role.">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Min: ${salaryMin.toLocaleString()}</span>
                <span className="text-muted-foreground">Max: ${salaryMax.toLocaleString()}</span>
              </div>
              <div className="space-y-2">
                <input
                  type="range"
                  min={minBound}
                  max={maxBound}
                  step={5000}
                  value={salaryMin}
                  onChange={(event) => safeSetSalary(Number(event.target.value), salaryMax)}
                  className="w-full accent-[hsl(var(--primary))]"
                  aria-label="Minimum salary"
                />
                <input
                  type="range"
                  min={minBound}
                  max={maxBound}
                  step={5000}
                  value={salaryMax}
                  onChange={(event) => safeSetSalary(salaryMin, Number(event.target.value))}
                  className="w-full accent-[hsl(var(--primary))]"
                  aria-label="Maximum salary"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="salaryMin">Minimum</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    value={salaryMin}
                    onChange={(event) => safeSetSalary(Number(event.target.value), salaryMax)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryMax">Maximum</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    value={salaryMax}
                    onChange={(event) => safeSetSalary(salaryMin, Number(event.target.value))}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Aureo uses this to prioritize jobs with clear compensation data.
              </p>
            </div>
          </SettingsRow>
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-lg">Work details</CardTitle>
          <CardDescription>Additional signals for matching.</CardDescription>
        </CardHeader>
        <CardContent className="gap-0">
          <SettingsRow title="Employment types" description="Select one or more.">
            <div className="grid gap-2 sm:grid-cols-2">
              {employmentOptions.map((type) => {
                const checked = settings.jobPreferences.employmentTypes.includes(type);
                return (
                  <label
                    key={type}
                    className="flex cursor-pointer items-center justify-between rounded-[var(--radius)] border border-border bg-background px-3 py-2 hover:bg-muted"
                  >
                    <span className="text-sm font-semibold text-foreground">{type}</span>
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) => {
                        const nextChecked = Boolean(value);
                        const next = nextChecked
                          ? [...settings.jobPreferences.employmentTypes, type]
                          : settings.jobPreferences.employmentTypes.filter((t) => t !== type);
                        update("jobPreferences", { employmentTypes: next });
                      }}
                      aria-label={`Toggle ${type}`}
                    />
                  </label>
                );
              })}
            </div>
          </SettingsRow>

          <SettingsRow title="Open to work" description="Highlights you for verified employers.">
            <div className="flex items-center justify-end">
              <Switch
                checked={settings.jobPreferences.openToWork}
                onCheckedChange={(checked) => update("jobPreferences", { openToWork: checked })}
              />
            </div>
          </SettingsRow>

          <SettingsRow title="Work authorization" description="Show that you can legally work in your target region.">
            <div className="flex items-center justify-end">
              <Switch
                checked={settings.jobPreferences.workAuthorization}
                onCheckedChange={(checked) => update("jobPreferences", { workAuthorization: checked })}
              />
            </div>
          </SettingsRow>
        </CardContent>
      </Card>

      <div className="rounded-[var(--radius)] border border-border bg-secondary p-4">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Tip</p>
            <p className="text-sm text-muted-foreground">
              Combine job preferences with alerts to build a calm pipeline. Explore alerts on the main navigation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
