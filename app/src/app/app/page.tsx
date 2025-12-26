import Link from "next/link"
import { redirect } from "next/navigation"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { OnboardingChecklist } from "@/components/onboarding-checklist"
import { JobCard } from "@/components/job-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Briefcase, Bookmark, Bell, Clock } from "lucide-react"
import { AuthGuard } from "@/lib/auth-guard"
import { supabaseServer } from "@/lib/supabase/server"
import { getServerUser } from "@/lib/auth-server"
import { jobRecordToManifest } from "@/lib/job-presenter"
import type { Job, JobRecord } from "@/lib/types"
export default async function DashboardPage() {
  const user = await getServerUser()
  if (!user) redirect("/auth/login")

  const supabase = await supabaseServer()
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (profile?.role === "employer") redirect("/employer")

  const [{ count: applicationsCount }, { count: savedCount }, { count: alertsCount }, { count: remindersCount }] =
    await Promise.all([
      supabase.from("applications").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("saved_jobs").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("job_alerts").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_active", true),
      supabase.from("job_reminders").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "scheduled"),
    ])

  const { data: jobs } = await supabase
    .from("jobs")
    .select(
      "id,title,description,requirements,employment_type,location,remote,salary_min,salary_max,currency,created_at,companies:company_id(name,verified,response_rate,trust_score,logo_url)",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(3)

  const recommendedJobs: Job[] = ((jobs as any) ?? []).map((r: JobRecord) => jobRecordToManifest(r))

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id,title,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3)

  return (
    <AuthGuard requiredRole="seeker">
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <Container className="py-8 flex-1">
          <PageHeader title="Welcome back!" description="Here's what's happening with your job search" className="mb-8" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Applications" value={String(applicationsCount ?? 0)} icon={Briefcase} />
            <StatCard title="Saved jobs" value={String(savedCount ?? 0)} icon={Bookmark} />
            <StatCard title="Active alerts" value={String(alertsCount ?? 0)} icon={Bell} />
            <StatCard title="Reminders" value={String(remindersCount ?? 0)} icon={Clock} />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <OnboardingChecklist />

              <div>
                <div className="mb-6 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Recommended for you</h2>
                    <p className="text-sm text-muted-foreground">Fresh roles from trusted teams.</p>
                  </div>
                  <Link href="/jobs" className="text-sm font-semibold text-primary">
                    View all
                  </Link>
                </div>
                <div className="grid gap-6">
                  {recommendedJobs.map((job: Job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent activity</CardTitle>
                  <CardDescription>Latest notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(notifications ?? []).length ? (
                    (notifications ?? []).map((n: any) => (
                      <div key={n.id} className="flex gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(n.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No activity yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>

        <Footer />
      </div>
    </AuthGuard>
  )
}


