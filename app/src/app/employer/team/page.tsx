import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { getServerUser } from "@/lib/auth-server";

export default async function EmployerTeamPage() {
  const user = await getServerUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Team"
        description="Team management isn’t enabled yet."
        actions={
          <Button asChild>
            <Link href="/employer/company">Company</Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="p-12">
          <EmptyState
            icon="Inbox"
            title="No team management"
            description="Add invites and roles to manage your team."
            action={{ label: "Employer dashboard", href: "/dashboard/employer" }}
          />
        </CardContent>
      </Card>
    </div>
  );
}


