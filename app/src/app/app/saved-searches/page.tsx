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
import { Plus, Clock, Bell, Edit, Trash2, Play } from "lucide-react"
import { toast } from "sonner"
import type { SavedSearch } from "@/lib/types-extended"
import { supabaseBrowser } from "@/lib/supabase/client"
import { formatSupabaseError, isSchemaMissingError } from "@/lib/supabase/error"

export default function SavedSearchesPage() {
  return (
    <AuthGuard requiredRole="seeker">
      <SavedSearchesPageContent />
    </AuthGuard>
  )
}

function SavedSearchesPageContent() {
  const router = useRouter()
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadSearches()
  }, [router])

  const loadSearches = async () => {
    const supabase = supabaseBrowser()
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return

    const { data, error } = await supabase
      .from("saved_searches")
      .select("id,user_id,name,query,filters,schedule,delivery,created_at,updated_at,last_run_at,active")
      .eq("user_id", auth.user.id)
      .eq("active", true)
      .order("created_at", { ascending: false })

    if (error) {
      const meta = formatSupabaseError(error)
      console.error("Failed to load saved searches:", meta, error)
      toast.error(
        isSchemaMissingError(error)
          ? "Database tables are missing. Apply Supabase migrations, then refresh."
          : meta.message || "Could not load searches",
      )
      return
    }

    setSearches(
      (data ?? []).map((row: any) => ({
        id: String(row.id),
        userId: String(row.user_id),
        name: String(row.name ?? ""),
        query: String(row.query ?? ""),
        filters: (row.filters ?? {}) as any,
        schedule: (row.schedule ?? { frequency: "daily" }) as any,
        delivery: (row.delivery ?? { inbox: true, email: false }) as any,
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at ?? row.created_at),
        lastRunAt: row.last_run_at ?? undefined,
        active: Boolean(row.active),
      }))
    )
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this saved search?")) {
      const supabase = supabaseBrowser()
      ;(async () => {
        const { data: auth } = await supabase.auth.getUser()
        if (!auth.user) return

        const { error } = await supabase
          .from("saved_searches")
          .update({ active: false, updated_at: new Date().toISOString() } as any)
          .eq("id", id)
          .eq("user_id", auth.user.id)

        if (error) {
          console.error("Failed to delete saved search:", error)
          toast.error("Could not delete search")
          return
        }

        toast.success("Search deleted")
        loadSearches()
      })()
    }
  }

  const handleRunNow = (search: SavedSearch) => {
    router.push(`/app/saved-searches/${search.id}?run=true`)
  }

  const checkDigestDue = (search: SavedSearch): boolean => {
    if (!search.lastRunAt) return true
    if (search.schedule.frequency === "instant") return false

    const lastRun = new Date(search.lastRunAt)
    const now = new Date()
    const daysSince = (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60 * 24)

    if (search.schedule.frequency === "daily") {
      return daysSince >= 1
    }
    if (search.schedule.frequency === "weekdays") {
      const dayOfWeek = now.getDay()
      const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5
      return isWeekday && daysSince >= 1
    }
    return false
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <Container className="py-8 flex-1">
        <PageHeader
          title="Saved Searches"
          description="Create and manage your job search alerts"
          actions={
            <Button variant="primary" asChild>
              <Link href="/app/saved-searches/new">
                <Plus className="h-4 w-4 mr-2" />
                New Search
              </Link>
            </Button>
          }
          className="mb-8"
        />

        {searches.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <EmptyState
                icon="Search"
                title="No saved searches"
                description="Create your first saved search to get job alerts delivered to your inbox"
                action={{
                  label: "Create Search",
                  href: "/app/saved-searches/new",
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {searches.map((search) => {
              const digestDue = checkDigestDue(search)
              return (
                <Card key={search.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle>{search.name}</CardTitle>
                          {digestDue && (
                            <Badge variant="outline" className="gap-1">
                              <Bell className="h-3 w-3" />
                              Digest Due
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="mb-3">
                          {search.query || "No keywords"}
                        </CardDescription>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          {search.filters.location && (
                            <Badge variant="outline">{search.filters.location}</Badge>
                          )}
                          {search.filters.remote && (
                            <Badge variant="outline">Remote</Badge>
                          )}
                          {search.filters.type && (
                            <Badge variant="outline">{search.filters.type}</Badge>
                          )}
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {search.schedule.frequency === "daily"
                              ? "Daily"
                              : search.schedule.frequency === "weekdays"
                                ? "Weekdays"
                                : "Instant"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {digestDue && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleRunNow(search)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Run Now
                          </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/app/saved-searches/${search.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(search.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        )}
      </Container>

      <Footer />
    </div>
  )
}



