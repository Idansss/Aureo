import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { getServerUser } from "@/lib/auth-server";

export default async function EmployerOffersPage() {
  const user = await getServerUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Offers"
        description="Offer management isn’t enabled yet."
        actions={
          <Button asChild>
            <Link href="/employer/applicants">Applicants</Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="p-12">
          <EmptyState
            icon="Inbox"
            title="No offers"
            description="Add offers tables and workflows to enable this page."
            action={{ label: "Open applicants", href: "/employer/applicants" }}
          />
        </CardContent>
      </Card>
    </div>
  );
}


