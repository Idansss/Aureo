"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, Briefcase, Building2, FileText, Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { stories } from "@/lib/stories"
import { routes } from "@/lib/routes"
import { consumeFocusRequest, focusPageSearch, isTypingTarget, requestFocus, tryFocusById } from "@/lib/shortcuts"
import type { LucideIcon } from "lucide-react"
import { IconBadge } from "@/components/ui/icon-badge"
import { supabaseBrowser } from "@/lib/supabase/client"

type SearchResult = {
  key: string
  kind: "result"
  type: "Job" | "Employer" | "Story"
  title: string
  description: string
  href: string
  icon: LucideIcon
}

type CommandItem = {
  key: string
  kind: "command"
  title: string
  description: string
  icon: LucideIcon
  run: () => void
}

type PaletteItem = SearchResult | CommandItem

type PaletteJob = { id: string; title: string; location: string | null; companyName: string | null }
type PaletteCompany = { slug: string; name: string; location: string | null; trustScore: number | null }

export function CommandPalette({ trigger }: { trigger: React.ReactElement }) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [activeIndex, setActiveIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const [jobs, setJobs] = React.useState<PaletteJob[]>([])
  const [companies, setCompanies] = React.useState<PaletteCompany[]>([])

  React.useEffect(() => {
    if (!open) return
    const supabase = supabaseBrowser()
    ;(async () => {
      const [{ data: jobsData }, { data: companiesData }] = await Promise.all([
        supabase
          .from("jobs")
          .select("id,title,location,companies:company_id(name)")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("companies")
          .select("slug,name,location,trust_score")
          .order("trust_score", { ascending: false })
          .limit(50),
      ])

      setJobs(
        (jobsData ?? []).map((j: any) => ({
          id: String(j.id),
          title: String(j.title ?? ""),
          location: j.location ?? null,
          companyName: j.companies?.name ?? null,
        })),
      )
      setCompanies(
        (companiesData ?? []).map((c: any) => ({
          slug: String(c.slug ?? ""),
          name: String(c.name ?? ""),
          location: c.location ?? null,
          trustScore: c.trust_score ?? null,
        })),
      )
    })()
  }, [open])

  const commands = React.useMemo<CommandItem[]>(() => {
    const dashboardHref =
      pathname.startsWith(routes.employer.dashboard) || pathname.startsWith("/dashboard/employer")
        ? routes.employer.dashboard
        : routes.app.dashboard

    return [
      {
        key: "cmd:jobs",
        kind: "command",
        title: "Go to Jobs",
        description: "Browse roles with trust signals.",
        icon: Briefcase,
        run: () => router.push(routes.jobs),
      },
      {
        key: "cmd:employers",
        kind: "command",
        title: "Go to Employers",
        description: "Explore verified teams and open roles.",
        icon: Building2,
        run: () => router.push(routes.employers.directory),
      },
      {
        key: "cmd:pricing",
        kind: "command",
        title: "Go to Pricing",
        description: "Compare plans and features.",
        icon: BarChart3,
        run: () => router.push(routes.pricing),
      },
      {
        key: "cmd:stories",
        kind: "command",
        title: "Go to Stories",
        description: "Read hiring playbooks and real outcomes.",
        icon: FileText,
        run: () => router.push(routes.stories),
      },
      {
        key: "cmd:dashboard",
        kind: "command",
        title: "Go to Dashboard",
        description: "Open your application and hiring overview.",
        icon: BarChart3,
        run: () => router.push(dashboardHref),
      },
      {
        key: "cmd:search-jobs",
        kind: "command",
        title: "Search jobs",
        description: "Focus the role input for fast filtering.",
        icon: Search,
        run: () => {
          if (!tryFocusById("jobs-q")) {
            requestFocus("jobs-q")
            router.push(routes.jobs)
          }
        },
      },
    ]
  }, [pathname, router])

  const results = React.useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []

    const jobResults: SearchResult[] = jobs
      .filter((job) => `${job.title} ${job.location ?? ""} ${job.companyName ?? ""}`.toLowerCase().includes(q))
      .slice(0, 6)
      .map((job) => ({
        key: `job:${job.id}`,
        kind: "result",
        type: "Job",
        title: job.title,
        description: `${job.companyName ?? "Company"}, ${job.location ?? "Remote"}`,
        href: `${routes.jobs}/${job.id}`,
        icon: Briefcase,
      }))

    const employerResults: SearchResult[] = companies
      .filter((c) => `${c.name} ${c.location ?? ""}`.toLowerCase().includes(q))
      .slice(0, 6)
      .map((c) => ({
        key: `employer:${c.slug}`,
        kind: "result",
        type: "Employer",
        title: c.name,
        description: `Trust ${c.trustScore ?? 0}`,
        href: routes.employers.profile(c.slug),
        icon: Building2,
      }))

    const storyResults: SearchResult[] = stories
      .filter((story) => `${story.title} ${story.category} ${story.summary}`.toLowerCase().includes(q))
      .slice(0, 6)
      .map((story) => ({
        key: `story:${story.slug}`,
        kind: "result",
        type: "Story",
        title: story.title,
        description: `${story.category}, ${story.readingTime}`,
        href: `${routes.stories}/${story.slug}`,
        icon: FileText,
      }))

    return [...jobResults, ...employerResults, ...storyResults].slice(0, 12)
  }, [query, jobs, companies])

  const items: PaletteItem[] = query.trim() ? results : commands

  React.useEffect(() => {
    if (!open) return
    const t = setTimeout(() => inputRef.current?.focus(), 0)
    return () => clearTimeout(t)
  }, [open])

  React.useEffect(() => {
    setActiveIndex(0)
  }, [query, open])

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen(true)
        return
      }

      if (event.key === "/" && !open && !event.metaKey && !event.ctrlKey && !event.altKey && !isTypingTarget(event.target)) {
        if (focusPageSearch()) {
          event.preventDefault()
        }
        return
      }

      if (event.key === "Escape" && open) {
        setOpen(false)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  React.useEffect(() => {
    const requested = consumeFocusRequest()
    if (!requested) return
    tryFocusById(requested)
  }, [pathname])

  const go = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  const runItem = (item: PaletteItem) => {
    if (item.kind === "command") {
      setOpen(false)
      item.run()
      return
    }
    go(item.href)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jobs, employers, or stories…"
          />

          <div className="max-h-[420px] overflow-auto rounded-[var(--radius)] border border-border">
            {items.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">No results.</div>
            ) : (
              <div className="divide-y divide-border">
                {items.map((item, idx) => {
                  const active = idx === activeIndex
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => runItem(item)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition",
                        active ? "bg-muted" : "bg-background hover:bg-muted",
                      )}
                    >
                      <IconBadge
                        icon={item.icon}
                        tone={item.kind === "command" ? "neutral" : "gold"}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-semibold text-foreground">{item.title}</p>
                          {item.kind === "result" ? (
                            <Badge variant="outline" className="shrink-0">
                              {item.type}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


