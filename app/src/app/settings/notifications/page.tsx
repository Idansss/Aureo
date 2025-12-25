"use client";

import { Bell, Clock } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { SettingsRow } from "@/components/settings/settings-row";
import { useSettings } from "@/components/settings/settings-provider";
import { routes } from "@/lib/routes";

export default function NotificationSettingsPage() {
  const { settings, update } = useSettings();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Settings", href: routes.settings.root }, { label: "Notifications" }]} />
      <PageHeader
        title="Notifications"
        description="Control what Aureo emails you about, plus quiet hours."
        meta={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-2">
              <Bell className="h-4 w-4 text-primary" aria-hidden />
              Email
            </Badge>
            <Badge variant="outline">On this device</Badge>
          </div>
        }
      />

      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-lg">Email notifications</CardTitle>
          <CardDescription>Keep alerts calm, relevant, and high signal.</CardDescription>
        </CardHeader>
        <CardContent className="gap-0">
          <SettingsRow title="Product updates" description="Major improvements, trust and safety changes.">
            <div className="flex items-center justify-end">
              <Switch
                checked={settings.notifications.productUpdates}
                onCheckedChange={(checked) => update("notifications", { productUpdates: checked })}
              />
            </div>
          </SettingsRow>
          <SettingsRow title="Job matches" description="New roles that match your preferences.">
            <div className="flex items-center justify-end">
              <Switch
                checked={settings.notifications.jobMatches}
                onCheckedChange={(checked) => update("notifications", { jobMatches: checked })}
              />
            </div>
          </SettingsRow>
          <SettingsRow title="Messages" description="Hiring conversations and responses.">
            <div className="flex items-center justify-end">
              <Switch
                checked={settings.notifications.messages}
                onCheckedChange={(checked) => update("notifications", { messages: checked })}
              />
            </div>
          </SettingsRow>
          <SettingsRow title="Digest frequency" description="Bundle notifications into a calm summary.">
            <Select
              value={settings.notifications.digest}
              onValueChange={(value) => update("notifications", { digest: value as any })}
            >
              <SelectTrigger className="rounded-[var(--radius)]">
                <SelectValue placeholder="Choose frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="off">Off</SelectItem>
              </SelectContent>
            </Select>
          </SettingsRow>
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-lg">Quiet hours</CardTitle>
          <CardDescription>Pause non-urgent notifications during focused time.</CardDescription>
        </CardHeader>
        <CardContent className="gap-0">
          <SettingsRow title="Enable quiet hours" description="Applies to product and job match emails.">
            <div className="flex items-center justify-end">
              <Switch
                checked={settings.notifications.quietHoursEnabled}
                onCheckedChange={(checked) => update("notifications", { quietHoursEnabled: checked })}
              />
            </div>
          </SettingsRow>
          <SettingsRow title="Time range" description="Local time range for quiet hours.">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" aria-hidden />
                Quiet hours window
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="time"
                  value={settings.notifications.quietStart}
                  onChange={(event) => update("notifications", { quietStart: event.target.value })}
                  disabled={!settings.notifications.quietHoursEnabled}
                />
                <Input
                  type="time"
                  value={settings.notifications.quietEnd}
                  onChange={(event) => update("notifications", { quietEnd: event.target.value })}
                  disabled={!settings.notifications.quietHoursEnabled}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Push notifications will be added once messaging is connected.
              </p>
            </div>
          </SettingsRow>
        </CardContent>
      </Card>
    </div>
  );
}

