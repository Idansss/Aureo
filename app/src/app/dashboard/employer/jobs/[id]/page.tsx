"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { supabaseBrowser } from "@/lib/supabase/client"
import { setJobActive } from "../actions"

type Stage = "applied" | "screening" | "interview" | "offer" | "rejected"

const STAGES: { key: Stage; label: string }[] = [
  { key: "applied", label: "Applied" },
  { key: "screening", label: "Screening" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
  { key: "rejected", label: "Rejected" },
]

type JobRow = {
  id: string
  title: string
  location: string | null
  remote: boolean
  isActive: boolean
  companyName: string
}

type ApplicantRow = {
  id: string
  status: Stage
  createdAt: string
  name: string
  email: string
  headline?: string | null
  location?: string | null
  cvUrl?: string | null
}

export default function EmployerJobDetailPage({ params }: { params: { id: string } }) {
  const id = params.id
  const [job, setJob] = React.useState<JobRow | null>(null)
  const [apps, setApps] = React.useState<ApplicantRow[]>([])
  const [loading, setLoading] = React.useState(true)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const supabase = supabaseBrowser()

      const { data: jobRow, error: jobErr } = await supabase
        .from("jobs")
        .select("id,title,location,remote,is_active,companies:company_id(name)")
        .eq("id", id)
        .maybeSingle()

      if (jobErr || !jobRow) {
        setJob(null)
        setApps([])
        return
      }

      setJob({
        id: String(jobRow.id),
        title: String((jobRow as any).title ?? ""),
        location: (jobRow as any).location ?? null,
        remote: Boolean((jobRow as any).remote ?? false),
        isActive: Boolean((jobRow as any).is_active ?? false),
        companyName: String((jobRow as any).companies?.name ?? ""),
      })

      const { data: applications, error: appsErr } = await supabase
        .from("applications")
        .select("id,status,created_at,profiles:user_id(full_name,email,headline,location,cv_url)")
        .eq("job_id", id)
        .order("created_at", { ascending: false })

      if (appsErr) {
        console.error("Failed to load applications:", appsErr)
        setApps([])
        return
      }

      setApps(
        (applications ?? [])
          .filter((a: any) => ["applied", "screening", "interview", "offer", "rejected"].includes(a.status))
          .map((a: any) => ({
            id: String(a.id),
            status: a.status as Stage,
            createdAt: String(a.created_at),
            name: String(a.profiles?.full_name ?? "Candidate"),
            email: String(a.profiles?.email ?? ""),
            headline: a.profiles?.headline ?? null,
            location: a.profiles?.location ?? null,
            cvUrl: a.profiles?.cv_url ?? null,
          })),
      )
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    load()
  }, [load])

  const grouped = STAGES.map((stage) => ({
    ...stage,
    items: apps.filter((a) => a.status === stage.key),
  }))

  const moveApplicant = async (appId: string, status: Stage) => {
    const supabase = supabaseBrowser()

    const current = apps.find((a) => a.id === appId)?.status ?? null

    const { error } = await supabase.from("applications").update({ status } as any).eq("id", appId)
    if (error) {
      console.error("Failed to move application:", error)
      toast.error("Could not update application status.")
      return
    }

    // Best-effort event for metrics/timeline (also powers response-time aggregation)
    try {
      const { data: auth } = await supabase.auth.getUser()
      const actorId = auth.user?.id
      if (actorId) {
        await supabase.from("application_events").insert({
          application_id: appId,
          actor_id: actorId,
          note: `Moved to ${status}`,
          from_status: current,
          to_status: status,
        } as any)
      }
    } catch (e) {
      console.warn("Failed to write application event", e)
    }

    await load()
  }

  if (loading) {
    return (
      <div className="space-y-6 pb-16">
        <PageHeader title="Job" description="Loading…" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="space-y-6 pb-16">
        <PageHeader
          title="Job not found"
          description="This job either does not exist or you don't have access."
          actions={
            <Button asChild>
              <Link href="/dashboard/employer/jobs">Back to jobs</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title={job.title}
        description={`${job.companyName}${job.location ? ` · ${job.location}` : ""}`}
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {job.isActive ? "Live" : "Paused"}
            </Badge>
            {job.remote ? (
              <Badge variant="outline" className="text-xs">
                Remote
              </Badge>
            ) : null}
          </div>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={`/dashboard/employer/jobs/${job.id}/edit`}>Edit</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                const result = await setJobActive(job.id, !job.isActive)
                if (!result.ok) {
                  toast.error(result.error ?? "Could not update job.")
                  return
                }
                await load()
              }}
            >
              {job.isActive ? "Pause" : "Resume"}
            </Button>
          </div>
        }
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Pipeline</h2>
          <p className="text-xs text-muted-foreground">{apps.length} applications</p>
        </div>

        {apps.length === 0 ? (
          <div className="rounded-[var(--radius)] border border-border bg-muted p-8 text-center text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">No applicants yet</p>
            <p className="mt-1">Applications will appear here as candidates apply to this role.</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-5">
            {grouped.map((column) => (
              <div key={column.key} className="rounded-[var(--radius)] border border-border bg-secondary p-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  <span>{column.label}</span>
                  <span>{column.items.length}</span>
                </div>
                <div className="mt-3 space-y-3">
                  {column.items.map((app) => (
                    <div key={app.id} className="rounded-[var(--radius)] border border-border bg-background p-3">
                      <p className="text-sm font-semibold text-foreground">{app.name}</p>
                      {app.headline ? (
                        <p className="mt-1 text-xs text-muted-foreground">{app.headline}</p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {STAGES.filter((s) => s.key !== app.status).map((s) => (
                          <Button
                            key={s.key}
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => moveApplicant(app.id, s.key)}
                          >
                            Move → {s.label}
                          </Button>
                        ))}
                        {app.cvUrl ? (
                          <Button asChild size="sm" variant="ghost">
                            <a href={app.cvUrl} target="_blank" rel="noreferrer">
                              CV
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                  {column.items.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Empty stage</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}



