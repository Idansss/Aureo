"use client";

import * as React from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Lock } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SettingsRow } from "@/components/settings/settings-row";
import { useSettings } from "@/components/settings/settings-provider";
import { useAuth } from "@/lib/use-auth";
import { routes } from "@/lib/routes";
import { supabaseBrowser } from "@/lib/supabase/client";

function slugifyUsername(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AccountSettingsPage() {
  const { settings, update } = useSettings();
  const { user } = useAuth();
  const [pendingName, setPendingName] = React.useState(settings.account.fullName);
  const [pendingUsername, setPendingUsername] = React.useState(settings.account.username);
  const [pendingPassword, setPendingPassword] = React.useState("");
  const [pendingPasswordConfirm, setPendingPasswordConfirm] = React.useState("");
  const [savingPassword, setSavingPassword] = React.useState(false);

  const saveProfile = React.useCallback(
    async (input: { fullName?: string; username?: string }) => {
      const supabase = supabaseBrowser();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        toast.error("Sign in to update your account.");
        return;
      }

      const payload: any = {};
      if (typeof input.fullName === "string") payload.full_name = input.fullName || null;
      if (typeof input.username === "string") payload.username = input.username || null;
      if (!Object.keys(payload).length) return;

      const { error } = await supabase.from("profiles").update(payload).eq("id", auth.user.id);
      if (error) {
        console.error("Failed to update profile:", error);
        toast.error("Could not save changes.");
        return;
      }

      if (typeof input.fullName === "string") update("account", { fullName: input.fullName });
      if (typeof input.username === "string") update("account", { username: input.username });
      toast.success("Saved.");
    },
    [update],
  );

  // Sync with logged-in user data
  React.useEffect(() => {
    if (user) {
      // Update email from auth user
      if (settings.account.email !== user.email) {
        update("account", { email: user.email ?? "" });
      }

      // Initialize username from email if missing
      const emailUsername = (user.email ?? "").split("@")[0].toLowerCase().replace(/[^a-z0-9-_]/g, "-");
      if (!settings.account.username && emailUsername) {
        setPendingUsername(emailUsername);
        update("account", { username: emailUsername });
      }

      // Initialize name if missing
      if (!settings.account.fullName && user.fullName) {
        setPendingName(user.fullName);
        update("account", { fullName: user.fullName });
      }
    }
  }, [user, settings.account.email, settings.account.fullName, settings.account.username, update]);

  React.useEffect(() => {
    setPendingName(settings.account.fullName);
    setPendingUsername(settings.account.username);
  }, [settings.account.fullName, settings.account.username]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Settings", href: routes.settings.root }, { label: "Account" }]} />
      <PageHeader
        title="Account"
        description="Your identity, security, and connected accounts."
      />

      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-lg">Profile basics</CardTitle>
          <CardDescription>Update the name and username shown across Aureo.</CardDescription>
        </CardHeader>
        <CardContent className="gap-0">
          <SettingsRow
            title="Full name"
            description="Used on your public profile and application history."
          >
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={pendingName}
                onChange={(event) => setPendingName(event.target.value)}
                onBlur={() => saveProfile({ fullName: pendingName.trim() })}
              />
            </div>
          </SettingsRow>

          <SettingsRow
            title="Username"
            description="Used for your public profile URL."
          >
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={pendingUsername}
                onChange={(event) => setPendingUsername(event.target.value)}
                onBlur={() => {
                  const next = slugifyUsername(pendingUsername);
                  setPendingUsername(next);
                  saveProfile({ username: next });
                }}
              />
              <p className="text-xs text-muted-foreground">
                Public URL:{" "}
                <Link
                  href={routes.publicProfile(slugifyUsername(pendingUsername) || settings.account.username)}
                  className="font-semibold text-primary underline underline-offset-4"
                >
                  /u/{slugifyUsername(pendingUsername) || settings.account.username}
                </Link>
              </p>
            </div>
          </SettingsRow>

          <SettingsRow
            title="Email"
            description="Your account email."
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || settings.account.email} disabled />
            </div>
          </SettingsRow>
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-lg">Security</CardTitle>
          <CardDescription>Update your password.</CardDescription>
        </CardHeader>
        <CardContent className="gap-0">
          <SettingsRow title="Change password" description="Choose a strong password you'll remember.">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={pendingPassword}
                  onChange={(e) => setPendingPassword(e.target.value)}
                  placeholder="New password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={pendingPasswordConfirm}
                  onChange={(e) => setPendingPasswordConfirm(e.target.value)}
                  placeholder="Confirm password"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                className="gap-2"
                disabled={savingPassword}
                onClick={async () => {
                  if (!pendingPassword || pendingPassword.length < 8) {
                    toast.error("Password must be at least 8 characters.");
                    return;
                  }
                  if (pendingPassword !== pendingPasswordConfirm) {
                    toast.error("Passwords do not match.");
                    return;
                  }
                  setSavingPassword(true);
                  try {
                    const supabase = supabaseBrowser();
                    const { error } = await supabase.auth.updateUser({ password: pendingPassword });
                    if (error) {
                      console.error("Failed to update password:", error);
                      toast.error("Could not update password.");
                      return;
                    }
                    setPendingPassword("");
                    setPendingPasswordConfirm("");
                    toast.success("Password updated.");
                  } finally {
                    setSavingPassword(false);
                  }
                }}
              >
                <Lock className="h-4 w-4" aria-hidden />
                {savingPassword ? "Updating..." : "Update password"}
              </Button>
            </div>
          </SettingsRow>
        </CardContent>
      </Card>
    </div>
  );
}
