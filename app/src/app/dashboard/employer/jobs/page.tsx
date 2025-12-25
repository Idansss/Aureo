"use client"

import * as React from "react"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/page-header"
import { supabaseBrowser } from "@/lib/supabase/client"
import { duplicateJob, setJobActive } from "./actions"

type JobRow = {
  id: string
  title: string
  companyName: string
  location: string | null
  remote: boolean
  employmentType: string | null
  isActive: boolean
}

type Filters = {
  status: "all" | "live" | "paused"
  location: string
  remote: "all" | "yes" | "no"
}

export default function EmployerJobsDashboardPage() {
  const [jobs, setJobs] = React.useState<JobRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filters, setFilters] = React.useState<Filters>({
    status: "all",
    location: "",
    remote: "all",
  })

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const supabase = supabaseBrowser()
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) {
        setJobs([])
        return
      }

      const { data: membership } = await supabase
        .from("company_members")
        .select("company_id, companies(name)")
        .eq("user_id", auth.user.id)
        .maybeSingle()

      const companyId = (membership as any)?.company_id as string | undefined
      const companyName = String((membership as any)?.companies?.name ?? "")
      if (!companyId) {
        setJobs([])
        return
      }

      const { data, error } = await supabase
        .from("jobs")
        .select("id,title,location,remote,employment_type,is_active,companies:company_id(name)")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Failed to load employer jobs:", error)
        toast.error("Could not load jobs")
        setJobs([])
        return
      }

      setJobs(
        (data ?? []).map((row: any) => ({
          id: String(row.id),
          title: String(row.title ?? ""),
          companyName: String(row.companies?.name ?? companyName),
          location: row.location ?? null,
          remote: Boolean(row.remote ?? false),
          employmentType: row.employment_type ?? null,
          isActive: Boolean(row.is_active ?? false),
        })),
      )
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const filtered = jobs.filter((job) => {
    if (filters.status === "live" && !job.isActive) return false
    if (filters.status === "paused" && job.isActive) return false
    if (
      filters.location &&
      !`${job.location ?? ""}`.toLowerCase().includes(filters.location.toLowerCase())
    ) {
      return false
    }
    if (filters.remote === "yes" && !job.remote) return false
    if (filters.remote === "no" && job.remote) return false
    return true
  })

  const handleDuplicate = async (id: string) => {
    const result = await duplicateJob(id)
    if (!result.ok) {
      toast.error(result.error ?? "Could not duplicate job.")
      return
    }
    toast.success("Job duplicated.")
    await load()
  }

  const handleStatusChange = async (id: string, active: boolean) => {
    const result = await setJobActive(id, active)
    if (!result.ok) {
      toast.error(result.error ?? "Could not update job.")
      return
    }
    await load()
  }

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Jobs overview"
        description="Review every posting, then jump into the pipeline as needed."
        actions={
          <Button asChild>
            <Link href="/dashboard/employer/jobs/new">Add job</Link>
          </Button>
        }
      />

      <section className="space-y-4 rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value as Filters["status"] }))
              }
            >
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location-filter">Location</Label>
            <Input
              id="location-filter"
              placeholder="City or region"
              value={filters.location}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, location: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remote-filter">Remote</Label>
            <Select
              value={filters.remote}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, remote: value as Filters["remote"] }))
              }
            >
              <SelectTrigger id="remote-filter">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                <SelectItem value="yes">Remote</SelectItem>
                <SelectItem value="no">On site</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="rounded-[var(--radius)] border border-border bg-muted p-10 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-border bg-muted p-10 text-center text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">No jobs match these filters.</p>
          <p className="mt-1">
            Adjust filters or{" "}
            <Link href="/dashboard/employer/jobs/new" className="font-semibold text-primary">
              create a new role
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius)] border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Employment</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((job) => (
                <tr key={job.id} className="border-t border-border">
                  <td className="max-w-[260px] px-4 py-3 align-top">
                    <div className="font-semibold text-foreground">{job.title}</div>
                    <p className="mt-1 text-xs text-muted-foreground">{job.companyName}</p>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <JobStatusBadge active={job.isActive} />
                  </td>
                  <td className="px-4 py-3 align-top text-muted-foreground">
                    {job.location ?? "—"}
                  </td>
                  <td className="px-4 py-3 align-top text-muted-foreground">
                    {job.remote ? "Remote" : job.employmentType ?? "—"}
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/dashboard/employer/jobs/${job.id}`}>View</Link>
                      </Button>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/dashboard/employer/jobs/${job.id}/edit`}>Edit</Link>
                      </Button>
                      <Button size="sm" variant="ghost" type="button" onClick={() => handleDuplicate(job.id)}>
                        Duplicate
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => handleStatusChange(job.id, !job.isActive)}
                      >
                        {job.isActive ? "Pause" : "Resume"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function JobStatusBadge({ active }: { active: boolean }) {
  if (active) {
    return (
      <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
        Live
      </span>
    )
  }

  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
      Paused
    </span>
  )
}



