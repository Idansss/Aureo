import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { getServerUser } from "@/lib/auth-server";

export default async function EmployerAnalyticsPage() {
  const user = await getServerUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Analytics"
        description="Analytics views aren’t enabled yet for this project."
        actions={
          <Button asChild>
            <Link href="/dashboard/employer">Employer dashboard</Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="p-12">
          <EmptyState
            icon="Search"
            title="No analytics dashboard"
            description="Publish jobs and manage applicants from the dashboard. Add analytics tables to enable reporting."
            action={{ label: "Manage jobs", href: "/dashboard/employer/jobs" }}
          />
        </CardContent>
      </Card>
    </div>
  );
}


