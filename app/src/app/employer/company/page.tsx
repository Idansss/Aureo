import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { supabaseServer } from "@/lib/supabase/server";
import { getServerUser } from "@/lib/auth-server";

export default async function EmployerCompanyPage() {
  const user = await getServerUser();
  if (!user) redirect("/auth/login");

  const supabase = await supabaseServer();
  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id, companies(id,name,slug,website,location,verified,response_rate,flagged_count)")
    .eq("user_id", user.id)
    .maybeSingle();

  const company = (membership as any)?.companies ?? null;
  const companyId = (membership as any)?.company_id as string | undefined;

  if (!companyId || !company) {
    return (
      <div className="space-y-6 pb-16">
        <PageHeader
          title="Company"
          description="Set up your company workspace to publish jobs."
          actions={
            <Button asChild>
              <Link href="/dashboard/employer">Set up company</Link>
            </Button>
          }
        />
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon="Briefcase"
              title="No company yet"
              description="Create your company workspace to start posting jobs."
              action={{ label: "Set up company", href: "/dashboard/employer" }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Company"
        description="Company details for your workspace."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href="/dashboard/employer">Employer dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/employer/jobs">Manage jobs</Link>
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate">{String(company.name ?? "")}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground truncate">
              {String(company.website ?? "") || "—"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={company.verified ? "default" : "outline"}>
              {company.verified ? "Verified" : "Unverified"}
            </Badge>
            <Badge variant="outline">{String(company.response_rate ?? 0)}% response</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="font-medium">{String(company.location ?? "—")}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Flag reports</p>
            <p className="font-medium">{String(company.flagged_count ?? 0)}</p>
          </div>
          {company.slug ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/employers/${company.slug}`}>View public company page</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}


