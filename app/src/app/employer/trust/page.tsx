import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { getServerUser } from "@/lib/auth-server";

export default async function EmployerTrustPage() {
  const user = await getServerUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Trust"
        description="Trust configuration isn’t enabled yet."
        actions={
          <Button asChild>
            <Link href="/employer/company">Company</Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="p-12">
          <EmptyState
            icon="ExternalLink"
            title="No trust settings"
            description="Add verification workflows and metrics to configure trust here."
            action={{ label: "Employer dashboard", href: "/dashboard/employer" }}
          />
        </CardContent>
      </Card>
    </div>
  );
}


