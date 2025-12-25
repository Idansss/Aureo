import Link from "next/link"
import { redirect } from "next/navigation"
import { BarChart3, BriefcaseBusiness, Users } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { supabaseServer } from "@/lib/supabase/server"
import { getServerUser } from "@/lib/auth-server"

export default async function EmployerDashboardPage() {
  const user = await getServerUser()
  if (!user) redirect("/auth/login")

  const supabase = await supabaseServer()

  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id, companies(name)")
    .eq("user_id", user.id)
    .maybeSingle()

  const companyId = (membership as any)?.company_id as string | undefined
  const companyName = String((membership as any)?.companies?.name ?? "")

  if (!companyId) {
    return (
      <div className="space-y-10 pb-16">
        <PageHeader
          title="Employer dashboard"
          description="Post jobs and manage applications from one workspace."
          actions={
            <Button asChild>
              <Link href="/employers">Browse companies</Link>
            </Button>
          }
        />
        <div className="rounded-[var(--radius)] border border-border bg-muted p-8 text-sm text-muted-foreground">
          You don’t have a company workspace yet. Join or create a company before posting jobs.
        </div>
      </div>
    )
  }

  const { count: jobsCount } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)

  const { count: liveJobsCount } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("is_active", true)

  const { count: applicationsCount } = await supabase
    .from("applications")
    .select("id,jobs!inner(company_id)", { count: "exact", head: true })
    .eq("jobs.company_id", companyId)

  return (
    <div className="space-y-10 pb-16">
      <PageHeader
        title="Employer dashboard"
        description={companyName ? `Workspace: ${companyName}` : "Post jobs and manage applications from one workspace."}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href="/dashboard/employer/jobs">Manage jobs</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/employer/jobs/new">Add job</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Jobs"
          value={String(jobsCount ?? 0)}
          description="Total roles in your workspace"
          icon={BriefcaseBusiness}
        />
        <StatCard
          title="Live jobs"
          value={String(liveJobsCount ?? 0)}
          description="Visible to candidates"
          icon={BriefcaseBusiness}
        />
        <StatCard
          title="Applications"
          value={String(applicationsCount ?? 0)}
          description="Across all your roles"
          icon={Users}
        />
        <StatCard
          title="Response health"
          value="—"
          description="Coming from real metrics soon"
          icon={BarChart3}
        />
      </div>
    </div>
  )
}



