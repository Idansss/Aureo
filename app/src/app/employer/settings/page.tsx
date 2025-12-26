import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { getServerUser } from "@/lib/auth-server";

export default async function EmployerSettingsPage() {
  const user = await getServerUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Settings"
        description="Employer settings aren’t enabled yet."
        actions={
          <Button asChild>
            <Link href="/settings">Account settings</Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="p-12">
          <EmptyState
            icon="Inbox"
            title="No employer settings"
            description="Use account settings for now. Add employer-specific settings tables to enable this page."
            action={{ label: "Account settings", href: "/settings" }}
          />
        </CardContent>
      </Card>
    </div>
  );
}


