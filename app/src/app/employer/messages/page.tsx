import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { getServerUser } from "@/lib/auth-server";

export default async function EmployerMessagesPage() {
  const user = await getServerUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Messages"
        description="Candidate messaging is not configured for this project yet."
        actions={
          <Button asChild>
            <Link href="/employer/applicants">View applicants</Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="p-12">
          <EmptyState
            icon="Inbox"
            title="No messaging inbox"
            description="Messaging tables and UI aren’t enabled yet. You can still manage applicants from the pipeline."
            action={{ label: "Open pipeline", href: "/dashboard/employer/jobs" }}
          />
        </CardContent>
      </Card>
    </div>
  );
}


