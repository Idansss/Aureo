"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AuthGuard } from "@/lib/auth-guard"
import { generateDigest } from "@/lib/digest-generator"
import { ArrowLeft, Play, Clock, Edit, Trash2, Inbox } from "lucide-react"
import { toast } from "sonner"
import type { SavedSearch, DigestItem } from "@/lib/types-extended"
import { supabaseBrowser } from "@/lib/supabase/client"

export default function SavedSearchDetailPage() {
  return (
    <AuthGuard requiredRole="seeker">
      <SavedSearchDetailPageContent />
    </AuthGuard>
  )
}

function SavedSearchDetailPageContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const searchId = params.id as string
  const [search, setSearch] = useState<SavedSearch | null>(null)
  const [digests, setDigests] = useState<DigestItem[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const shouldRun = searchParams.get("run") === "true"

    ;(async () => {
      await loadData()
      if (shouldRun) {
        await handleRunNow(true)
      }
    })()
  }, [searchId, router, searchParams])

  const loadData = async () => {
    const supabase = supabaseBrowser()
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return

    const { data: found, error: searchError } = await supabase
      .from("saved_searches")
      .select("id,user_id,name,query,filters,schedule,delivery,created_at,updated_at,last_run_at,active")
      .eq("id", searchId)
      .eq("user_id", auth.user.id)
      .maybeSingle()

    if (searchError || !found) {
      toast.error("Search not found")
      router.push("/app/saved-searches")
      return
    }

    setSearch({
      id: String(found.id),
      userId: String(found.user_id),
      name: String(found.name ?? ""),
      query: String(found.query ?? ""),
      filters: (found.filters ?? {}) as any,
      schedule: (found.schedule ?? { frequency: "daily" }) as any,
      delivery: (found.delivery ?? { inbox: true, email: false }) as any,
      createdAt: String(found.created_at),
      updatedAt: String(found.updated_at ?? found.created_at),
      lastRunAt: found.last_run_at ?? undefined,
      active: Boolean(found.active),
    })

    const { data: digestRows, error: digestsError } = await supabase
      .from("search_digests")
      .select("id,created_at,saved_search_id,summary_rows,saved_searches(name)")
      .eq("saved_search_id", searchId)
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false })

    if (digestsError) {
      console.error("Failed to load digests:", digestsError)
      setDigests([])
      return
    }

    setDigests(
      (digestRows ?? []).map((d: any) => ({
        id: String(d.id),
        searchId: String(d.saved_search_id),
        searchName: String(d.saved_searches?.name ?? found.name ?? "Saved search"),
        createdAt: String(d.created_at),
        jobIds: Array.isArray(d.summary_rows) ? d.summary_rows.map((r: any) => String(r.jobId ?? r.job_id ?? "")) : [],
        summaryRows: (d.summary_rows ?? []) as any,
      }))
    )
  }

  const handleRunNow = async (skipLoad?: boolean) => {
    setIsGenerating(true)
    try {
      const digest = await generateDigest(searchId)
      if (digest) {
        toast.success(`Digest generated with ${digest.summaryRows.length} jobs`)
        if (!skipLoad) {
          await loadData()
        }
        router.push("/app/inbox")
      } else {
        toast.error("Failed to generate digest")
      }
    } catch (error) {
      console.error("Error generating digest:", error)
      toast.error("Failed to generate digest")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this saved search?")) {
      const supabase = supabaseBrowser()
      ;(async () => {
        const { data: auth } = await supabase.auth.getUser()
        if (!auth.user) return

        const { error } = await supabase
          .from("saved_searches")
          .update({ active: false, updated_at: new Date().toISOString() } as any)
          .eq("id", searchId)
          .eq("user_id", auth.user.id)

        if (error) {
          console.error("Failed to delete saved search:", error)
          toast.error("Could not delete search")
          return
        }

        toast.success("Search deleted")
        router.push("/app/saved-searches")
      })()
    }
  }

  if (!mounted || !search) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <Container className="py-8 flex-1">
        <Button variant="ghost" className="mb-4 gap-2" asChild>
          <Link href="/app/saved-searches">
            <ArrowLeft className="h-4 w-4" />
            Back to Searches
          </Link>
        </Button>

        <PageHeader
          title={search.name}
          description={search.query || "No keywords specified"}
          actions={
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={() => handleRunNow()}
                disabled={isGenerating}
              >
                <Play className="h-4 w-4 mr-2" />
                {isGenerating ? "Generating..." : "Run Now"}
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/app/saved-searches/${searchId}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button variant="outline" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          }
          className="mb-8"
        />

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Search Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Schedule</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {search.schedule.frequency === "daily"
                      ? "Daily"
                      : search.schedule.frequency === "weekdays"
                        ? "Weekdays"
                        : "Instant"}
                    {search.schedule.time && ` at ${search.schedule.time}`}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Delivery</p>
                <div className="flex flex-wrap gap-2">
                  {search.delivery.inbox && (
                    <Badge variant="outline" className="gap-1">
                      <Inbox className="h-3 w-3" />
                      Inbox
                    </Badge>
                  )}
                  {search.delivery.email && (
                    <Badge variant="outline">Email</Badge>
                  )}
                </div>
              </div>
              {search.lastRunAt && (
                <div>
                  <p className="text-sm font-medium mb-1">Last Run</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(search.lastRunAt).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {search.filters.location && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{search.filters.location}</span>
                  </div>
                )}
                {search.filters.remote !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remote:</span>
                    <span>{search.filters.remote ? "Yes" : "No"}</span>
                  </div>
                )}
                {search.filters.type && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span>{search.filters.type}</span>
                  </div>
                )}
                {(search.filters.salaryMin || search.filters.salaryMax) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Salary:</span>
                    <span>
                      {search.filters.salaryMin ? `$${search.filters.salaryMin.toLocaleString()}` : ""}
                      {search.filters.salaryMin && search.filters.salaryMax ? " - " : ""}
                      {search.filters.salaryMax ? `$${search.filters.salaryMax.toLocaleString()}` : ""}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Digests</CardTitle>
            <CardDescription>Digests generated from this search</CardDescription>
          </CardHeader>
          <CardContent>
            {digests.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No digests yet. Click "Run Now" to generate your first digest.
              </p>
            ) : (
              <div className="space-y-4">
                {digests.slice(0, 5).map((digest) => (
                  <div
                    key={digest.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">
                        {digest.summaryRows.length} jobs found
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(digest.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/app/inbox?digest=${digest.id}`}>
                        View Digest
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Container>

      <Footer />
    </div>
  )
}



