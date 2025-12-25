import { supabaseAdmin } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ReportRow = {
  id: string;
  type: "job" | "employer";
  targetLabel: string;
  reason: string;
  details: string | null;
  createdAt: string;
};

export default async function AdminReportsPage() {
  const admin = supabaseAdmin();

  const [{ data: jobReports }, { data: companyReports }] = await Promise.all([
    admin
      .from("job_reports")
      .select("id, reason, details, created_at, jobs:job_id(title)")
      .order("created_at", { ascending: false })
      .limit(200),
    admin
      .from("company_reports")
      .select("id, reason, details, created_at, companies:company_id(name)")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  type JobReportRow = {
    id: string;
    reason: string;
    details: string | null;
    created_at: string;
    jobs: { title: string | null } | null;
  };

  type CompanyReportRow = {
    id: string;
    reason: string;
    details: string | null;
    created_at: string;
    companies: { name: string | null } | null;
  };

  const reports: ReportRow[] = [
    ...(jobReports ?? []).map((r) => {
      const row = r as unknown as JobReportRow;
      return {
        id: row.id,
        type: "job" as const,
        targetLabel: row.jobs?.title ?? "Job",
        reason: row.reason,
        details: row.details ?? null,
        createdAt: row.created_at,
      };
    }),
    ...(companyReports ?? []).map((r) => {
      const row = r as unknown as CompanyReportRow;
      return {
        id: row.id,
        type: "employer" as const,
        targetLabel: row.companies?.name ?? "Company",
        reason: row.reason,
        details: row.details ?? null,
        createdAt: row.created_at,
      };
    }),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const grouped = reports.reduce<Record<string, number>>((acc, r) => {
    acc[r.type] = (acc[r.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        description="Safety reports submitted by users."
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Admin</Badge>
          </div>
        }
        actions={null}
      />

      {reports.length === 0 ? (
        <EmptyState
          title="No reports yet"
          description="User-submitted safety reports will show up here."
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {Object.entries(grouped).map(([type, count]) => (
              <Badge key={type} variant="outline">
                {type}: {count}
              </Badge>
            ))}
          </div>

          <div className="overflow-x-auto rounded-[var(--radius)] border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Target</th>
                  <th className="px-4 py-3 font-medium">Reason</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <Badge variant="outline">{report.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-foreground">{report.targetLabel}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="font-medium text-foreground">{report.reason}</div>
                      {report.details ? <div className="mt-1 line-clamp-2">{report.details}</div> : null}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(report.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

