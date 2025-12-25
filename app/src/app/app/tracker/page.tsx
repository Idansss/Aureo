"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { EmptyState } from "@/components/empty-state"
import { AuthGuard } from "@/lib/auth-guard"
import { Briefcase, Bookmark, Send, CheckCircle2, XCircle, Gift } from "lucide-react"
import { toast } from "sonner"
import type { JobTracker } from "@/lib/types-extended"
import { JobTrackerModal } from "@/components/job-tracker-modal"
import { supabaseBrowser } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"

const STATUSES: Array<{
  key: JobTracker["status"]
  label: string
  icon: typeof Bookmark
  color: string
}> = [
  { key: "saved", label: "Saved", icon: Bookmark, color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  { key: "applied", label: "Applied", icon: Send, color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  { key: "interview", label: "Interview", icon: CheckCircle2, color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  { key: "offer", label: "Offer", icon: Gift, color: "bg-green-500/10 text-green-600 border-green-500/20" },
  { key: "rejected", label: "Rejected", icon: XCircle, color: "bg-red-500/10 text-red-600 border-red-500/20" },
]

export default function TrackerPage() {
  return (
    <AuthGuard requiredRole="seeker">
      <TrackerPageContent />
    </AuthGuard>
  )
}

function TrackerPageContent() {
  const router = useRouter()
  const [trackers, setTrackers] = useState<JobTracker[]>([])
  const [trackerModalOpen, setTrackerModalOpen] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadTrackers()
  }, [router])

  const loadTrackers = async () => {
    const supabase = supabaseBrowser()
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return

    const { data, error } = await supabase
      .from("job_tracker_items")
      .select("id,user_id,job_id,status,notes,created_at,updated_at,jobs(title,companies(name))")
      .eq("user_id", auth.user.id)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Failed to load trackers:", error)
      toast.error("Could not load tracker")
      return
    }

    setTrackers(
      (data ?? []).map((row: any) => {
        const item: any = {
          id: String(row.id),
          userId: String(row.user_id),
          jobId: String(row.job_id),
          status: row.status as JobTracker["status"],
          notes: row.notes ?? undefined,
          createdAt: String(row.created_at),
          updatedAt: String(row.updated_at ?? row.created_at),
          jobs: row.jobs,
        }
        return item as JobTracker
      })
    )
  }

  const handleMoveStatus = (trackerId: string, newStatus: JobTracker["status"]) => {
    const supabase = supabaseBrowser()
    ;(async () => {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) return

      const { error } = await supabase
        .from("job_tracker_items")
        .update({ status: newStatus, updated_at: new Date().toISOString() } as any)
        .eq("id", trackerId)
        .eq("user_id", auth.user.id)

      if (error) {
        console.error("Failed to update tracker:", error)
        toast.error("Could not update tracker")
        return
      }

      toast.success(`Moved to ${newStatus}`)
      loadTrackers()
    })()
  }

  const handleDelete = (trackerId: string) => {
    if (confirm("Are you sure you want to remove this job from tracker?")) {
      const supabase = supabaseBrowser()
      ;(async () => {
        const { data: auth } = await supabase.auth.getUser()
        if (!auth.user) return

        const { error } = await supabase
          .from("job_tracker_items")
          .delete()
          .eq("id", trackerId)
          .eq("user_id", auth.user.id)

        if (error) {
          console.error("Failed to delete tracker:", error)
          toast.error("Could not remove job")
          return
        }

        toast.success("Removed from tracker")
        loadTrackers()
      })()
    }
  }

  const getJobsByStatus = (status: JobTracker["status"]) => {
    return trackers.filter((t) => t.status === status)
  }

  if (!mounted) {
    return null
  }

  const totalJobs = trackers.length

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <Container className="py-8 flex-1">
        <PageHeader
          title="Job Tracker"
          description={`Track ${totalJobs} job${totalJobs !== 1 ? "s" : ""} across different stages`}
          className="mb-8"
        />

        {totalJobs === 0 ? (
          <Card>
            <CardContent className="p-12">
              <EmptyState
                icon={Briefcase}
                title="No jobs tracked yet"
                description="Start tracking jobs from your inbox or job listings"
                action={{
                  label: "Browse Jobs",
                  href: "/jobs",
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {STATUSES.map((status) => {
              const jobs = getJobsByStatus(status.key)
              const Icon = status.icon
              return (
                <Card key={status.key}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        <CardTitle className="text-base">{status.label}</CardTitle>
                      </div>
                      <Badge variant="outline">{jobs.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {jobs.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No jobs
                      </p>
                    ) : (
                      jobs.map((tracker) => {
                        const anyTracker = tracker as any
                        const jobTitle = String(anyTracker?.jobs?.title ?? `Job #${tracker.jobId.slice(-6)}`)
                        const companyName = String(anyTracker?.jobs?.companies?.name ?? "")
                        return (
                        <div
                          key={tracker.id}
                          className="p-3 rounded-lg border hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <Link
                              href={`/jobs/${tracker.jobId}`}
                              className="font-medium text-sm hover:text-primary transition-colors flex-1"
                            >
                              {jobTitle}
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {STATUSES.filter((s) => s.key !== tracker.status).map((s) => (
                                  <DropdownMenuItem
                                    key={s.key}
                                    onClick={() => handleMoveStatus(tracker.id, s.key)}
                                  >
                                    Move to {s.label}
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuItem
                                  onClick={() => handleDelete(tracker.id)}
                                  className="text-destructive"
                                >
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          {tracker.notes && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {tracker.notes}
                            </p>
                          )}
                          {companyName && (
                            <p className="text-xs text-muted-foreground mt-1">{companyName}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Updated {new Date(tracker.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      )})
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </Container>

      <JobTrackerModal
        open={trackerModalOpen}
        onOpenChange={setTrackerModalOpen}
        jobId={selectedJobId || ""}
        onSuccess={() => {
          setTrackerModalOpen(false)
          loadTrackers()
        }}
      />

      <Footer />
    </div>
  )
}



