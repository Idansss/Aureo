import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { supabaseServer } from "@/lib/supabase/server";
import { getServerUser } from "@/lib/auth-server";

type Row = {
  id: string;
  status: string;
  createdAt: string;
  jobId: string;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
};

export default async function EmployerApplicantsPage() {
  const user = await getServerUser();
  if (!user) redirect("/auth/login");

  const supabase = await supabaseServer();

  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id, companies(name)")
    .eq("user_id", user.id)
    .maybeSingle();

  const companyId = (membership as any)?.company_id as string | undefined;
  const companyName = String((membership as any)?.companies?.name ?? "");

  if (!companyId) {
    return (
      <div className="space-y-6 pb-16">
        <PageHeader
          title="Applicants"
          description="You’ll see applications here after you set up a company and publish jobs."
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
              description="Create your company workspace to start receiving applications."
              action={{ label: "Set up company", href: "/dashboard/employer" }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data, error } = await supabase
    .from("applications")
    .select(
      "id,status,created_at,jobs:job_id!inner(id,title,company_id),profiles:user_id(full_name,email)",
    )
    .eq("jobs.company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="space-y-6 pb-16">
        <PageHeader title="Applicants" description="Could not load applications." />
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            {error.message || "Unexpected error."}
          </CardContent>
        </Card>
      </div>
    );
  }

  const rows: Row[] = (data ?? []).map((r: any) => ({
    id: String(r.id),
    status: String(r.status ?? "applied"),
    createdAt: String(r.created_at ?? new Date().toISOString()),
    jobId: String(r.jobs?.id ?? ""),
    jobTitle: String(r.jobs?.title ?? "Job"),
    candidateName: String(r.profiles?.full_name ?? "Candidate"),
    candidateEmail: String(r.profiles?.email ?? ""),
  }));

  if (rows.length === 0) {
    return (
      <div className="space-y-6 pb-16">
        <PageHeader
          title="Applicants"
          description={companyName ? `Workspace: ${companyName}` : "Applications across your roles"}
          actions={
            <Button asChild>
              <Link href="/dashboard/employer/jobs/new">Create job</Link>
            </Button>
          }
        />
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon="Inbox"
              title="No applicants yet"
              description="Publish a job to start receiving applications."
              action={{ label: "Manage jobs", href: "/dashboard/employer/jobs" }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Applicants"
        description={companyName ? `Workspace: ${companyName}` : "Applications across your roles"}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href="/dashboard/employer/jobs">Manage jobs</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/employer/jobs/new">Create job</Link>
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    <div className="min-w-0">
                      <p className="truncate">{r.candidateName}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.candidateEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/employer/jobs/${r.jobId}`} className="hover:text-primary">
                      {r.jobTitle}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/employer/applicants/${r.id}`}>Open</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


