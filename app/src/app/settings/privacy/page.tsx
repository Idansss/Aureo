"use client";

import * as React from "react";
import { Shield, UserX } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SettingsRow } from "@/components/settings/settings-row";
import { useSettings } from "@/components/settings/settings-provider";
import { routes } from "@/lib/routes";

export default function PrivacySettingsPage() {
  const { settings, update } = useSettings();
  const [blockDraft, setBlockDraft] = React.useState("");

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Settings", href: routes.settings.root }, { label: "Privacy and safety" }]} />
      <PageHeader
        title="Privacy and safety"
        description="Control profile visibility, reporting preferences, and blocklists."
        meta={<Badge variant="outline" className="gap-2"><Shield className="h-4 w-4 text-primary" aria-hidden />Safety</Badge>}
      />

      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-lg">Visibility</CardTitle>
          <CardDescription>Decide who can view your profile details.</CardDescription>
        </CardHeader>
        <CardContent className="gap-0">
          <SettingsRow title="Profile visibility" description="Public is recommended for proof-based hiring.">
            <Select
              value={settings.privacy.visibility}
              onValueChange={(value) => update("privacy", { visibility: value as any })}
            >
              <SelectTrigger className="rounded-[var(--radius)]">
                <SelectValue placeholder="Choose visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="employers">Only employers</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </SettingsRow>
          <SettingsRow title="Show email on profile" description="Helps employers contact you faster.">
            <div className="flex items-center justify-end">
              <Switch
                checked={settings.privacy.showEmail}
                onCheckedChange={(checked) => update("privacy", { showEmail: checked })}
              />
            </div>
          </SettingsRow>
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-lg">Blocklist</CardTitle>
          <CardDescription>Prevent specific companies or domains from contacting you.</CardDescription>
        </CardHeader>
        <CardContent className="gap-0">
          <SettingsRow title="Blocked entries" description="Add email domains or company names.">
            <div className="space-y-3">
              {settings.privacy.blocklist.length ? (
                <div className="space-y-2">
                  {settings.privacy.blocklist.map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-[var(--radius)] border border-border bg-muted px-3 py-2"
                    >
                      <span className="text-sm font-medium text-foreground">{item}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          update("privacy", {
                            blocklist: settings.privacy.blocklist.filter((x) => x !== item),
                          })
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[var(--radius)] border border-border bg-secondary p-4 text-sm text-muted-foreground">
                  Nothing blocked yet. Add a company name or email domain to keep outreach clean.
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={blockDraft}
                  onChange={(event) => setBlockDraft(event.target.value)}
                  placeholder="Add company or domain"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    const next = blockDraft.trim();
                    if (!next) return;
                    if (settings.privacy.blocklist.includes(next)) return;
                    update("privacy", { blocklist: [...settings.privacy.blocklist, next] });
                    setBlockDraft("");
                    toast.success("Added to blocklist.");
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          </SettingsRow>
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-lg">Reporting preferences</CardTitle>
          <CardDescription>How Aureo handles safety reports and suspicious listings.</CardDescription>
        </CardHeader>
        <CardContent className="gap-0">
          <SettingsRow
            title="Report handling"
            description="Strict mode prioritizes removing suspicious listings quickly."
          >
            <Select
              value={settings.privacy.reporting}
              onValueChange={(value) => update("privacy", { reporting: value as any })}
            >
              <SelectTrigger className="rounded-[var(--radius)]">
                <SelectValue placeholder="Choose reporting mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="strict">Strict</SelectItem>
              </SelectContent>
            </Select>
          </SettingsRow>
          <SettingsRow
            title="Report inbox"
            description="Review reports you have submitted."
          >
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href={routes.admin.reports}>
                <span className="inline-flex items-center gap-2">
                  <UserX className="h-4 w-4" aria-hidden />
                  View reports
                </span>
                <span className="text-xs text-muted-foreground">/admin/reports</span>
              </Link>
            </Button>
          </SettingsRow>
        </CardContent>
      </Card>
    </div>
  );
}
