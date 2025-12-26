import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { getServerUser } from "@/lib/auth-server";

export default async function EmployerMessagingAnalyticsPage() {
  const user = await getServerUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Messaging analytics"
        description="Messaging analytics aren’t enabled yet."
        actions={
          <Button asChild>
            <Link href="/employer/messages">Messages</Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="p-12">
          <EmptyState
            icon="Inbox"
            title="No messaging analytics"
            description="Enable messaging + event tracking tables to see response metrics here."
            action={{ label: "Employer dashboard", href: "/dashboard/employer" }}
          />
        </CardContent>
      </Card>
    </div>
  );
}


