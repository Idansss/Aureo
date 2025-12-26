"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { EmptyState } from "@/components/empty-state"
import { AuthGuard } from "@/lib/auth-guard"
import { ExternalLink, Bookmark, Send, CheckCircle2, XCircle } from "lucide-react"
import type { DigestItem, DigestRow } from "@/lib/types-extended"
import { JobTrackerModal } from "@/components/job-tracker-modal"
import { supabaseBrowser } from "@/lib/supabase/client"
import { formatSupabaseError, isSchemaMissingError } from "@/lib/supabase/error"

export default function InboxPage() {
  return (
    <AuthGuard requiredRole="seeker">
      <InboxPageContent />
    </AuthGuard>
  )
}

function InboxPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [digests, setDigests] = useState<DigestItem[]>([])
  const [selectedDigest, setSelectedDigest] = useState<DigestItem | null>(null)
  const [trackerModalOpen, setTrackerModalOpen] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [trackerStatusByJobId, setTrackerStatusByJobId] = useState<Record<string, string>>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    ;(async () => {
      await loadDigests()
      await loadTrackerStatuses()
    })()
  }, [router, searchParams])

  const loadDigests = async () => {
    const supabase = supabaseBrowser()
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return

    const { data, error } = await supabase
      .from("search_digests")
      .select("id,created_at,saved_search_id,summary_rows,saved_searches(name)")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      const meta = formatSupabaseError(error)
      console.error("Failed to load digests:", meta, error)
      setDigests([])
      setSelectedDigest(null)
      return
    }

    const mapped: DigestItem[] = (data ?? []).map((d: any) => ({
      id: String(d.id),
      searchId: String(d.saved_search_id),
      searchName: String(d.saved_searches?.name ?? "Saved search"),
      createdAt: String(d.created_at),
      jobIds: Array.isArray(d.summary_rows) ? d.summary_rows.map((r: any) => String(r.jobId ?? r.job_id ?? "")) : [],
      summaryRows: (d.summary_rows ?? []) as any,
    }))

    setDigests(mapped)

    const digestId = searchParams.get("digest")
    if (digestId) {
      const wanted = mapped.find((x) => x.id === digestId)
      if (wanted) {
        setSelectedDigest(wanted)
        return
      }
    }

    if (mapped.length > 0) {
      setSelectedDigest((prev) => prev ?? mapped[0])
    } else {
      setSelectedDigest(null)
    }
  }

  const loadTrackerStatuses = async () => {
    const supabase = supabaseBrowser()
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return

    const { data, error } = await supabase
      .from("job_tracker_items")
      .select("job_id,status")
      .eq("user_id", auth.user.id)

    if (error) {
      const meta = formatSupabaseError(error)
      console.error("Failed to load tracker statuses:", meta, error)
      if (isSchemaMissingError(error)) {
        // This is actionable and common when the Supabase project hasn't had migrations applied yet.
        // Keep other errors quiet to avoid toast spam.
        // eslint-disable-next-line no-console
        console.info("Hint: apply Supabase migrations (tables missing).")
      }
      return
    }

    const next: Record<string, string> = {}
    for (const row of data ?? []) {
      next[String((row as any).job_id)] = String((row as any).status)
    }
    setTrackerStatusByJobId(next)
  }

  const handleTrackJob = (jobId: string) => {
    setSelectedJobId(jobId)
    setTrackerModalOpen(true)
  }

  const getJobStatus = (jobId: string): string | null => {
    return trackerStatusByJobId[jobId] || null
  }

  const groupedDigests = digests.reduce((acc, digest) => {
    const date = new Date(digest.createdAt).toLocaleDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(digest)
    return acc
  }, {} as Record<string, DigestItem[]>)

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <Container className="py-8 flex-1">
        <PageHeader
          title="Inbox"
          description="Your job search digests and alerts"
          className="mb-8"
        />

        {digests.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <EmptyState
                icon="Inbox"
                title="No digests yet"
                description="Create a saved search and run it to generate your first digest"
                action={{
                  label: "Create Search",
                  href: "/app/saved-searches/new",
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            {/* Digest List */}
            <Card>
              <CardHeader>
                <CardTitle>Digests</CardTitle>
                <CardDescription>{digests.length} total</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {Object.entries(groupedDigests).map(([date, dateDigests]) => (
                    <div key={date}>
                      <div className="px-4 py-2 text-xs font-medium text-muted-foreground border-b">
                        {date}
                      </div>
                      {dateDigests.map((digest) => (
                        <button
                          key={digest.id}
                          onClick={() => setSelectedDigest(digest)}
                          className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors ${
                            selectedDigest?.id === digest.id ? "bg-muted" : ""
                          }`}
                        >
                          <p className="font-medium text-sm">{digest.searchName}</p>
                          <p className="text-xs text-muted-foreground">
                            {digest.summaryRows.length} jobs
                          </p>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Digest Content */}
            {selectedDigest && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedDigest.searchName}</CardTitle>
                      <CardDescription>
                        {new Date(selectedDigest.createdAt).toLocaleString()} •{" "}
                        {selectedDigest.summaryRows.length} jobs found
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/app/saved-searches/${selectedDigest.searchId}`}>
                        View Search
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Job</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Skills</TableHead>
                          <TableHead>Match</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedDigest.summaryRows.map((row) => {
                          const status = getJobStatus(row.jobId)
                          return (
                            <TableRow key={row.jobId}>
                              <TableCell>
                                <Link
                                  href={row.url}
                                  className="font-medium hover:text-primary transition-colors"
                                >
                                  {row.title}
                                </Link>
                              </TableCell>
                              <TableCell>{row.company}</TableCell>
                              <TableCell>{row.location}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {row.matchedSkills.slice(0, 3).map((skill) => (
                                    <Badge key={skill} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {row.matchedSkills.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{row.matchedSkills.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    row.matchScore >= 70
                                      ? "default"
                                      : row.matchScore >= 50
                                        ? "outline"
                                        : "outline"
                                  }
                                >
                                  {row.matchScore}%
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {status && (
                                    <Badge variant="outline" className="capitalize">
                                      {status === "saved" && <Bookmark className="h-3 w-3 mr-1" />}
                                      {status === "applied" && <Send className="h-3 w-3 mr-1" />}
                                      {status === "interview" && (
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                      )}
                                      {status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                                      {status}
                                    </Badge>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleTrackJob(row.jobId)}
                                  >
                                    Track
                                  </Button>
                                  <Button variant="ghost" size="sm" asChild>
                                    <Link href={row.url} target="_blank">
                                      <ExternalLink className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </Container>

      <JobTrackerModal
        open={trackerModalOpen}
        onOpenChange={setTrackerModalOpen}
        jobId={selectedJobId || ""}
        onSuccess={() => {
          setTrackerModalOpen(false)
          loadTrackerStatuses()
        }}
      />

      <Footer />
    </div>
  )
}



