import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2, Filter, SearchX } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { EmployerCard } from "@/components/employers/employer-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabaseServer } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Employers, Aureo",
  description: "Browse verified employers and transparent hiring teams on Aureo.",
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function EmployersDirectoryPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const query = typeof params.q === "string" ? params.q.trim() : ""
  const verifiedOnly = params.verified === "true"
  const minTrust = typeof params.minTrust === "string" ? Number(params.minTrust) : 0

  const supabase = await supabaseServer()
  const { data: companies } = await supabase
    .from("companies")
    .select("id,name,slug,verified,trust_score,response_rate,location")
    .order("trust_score", { ascending: false })

  const { data: activeJobs } = await supabase.from("jobs").select("company_id").eq("is_active", true)
  const openRolesByCompanyId = new Map<string, number>()
  for (const row of activeJobs ?? []) {
    const companyId = String((row as any).company_id ?? "")
    if (!companyId) continue
    openRolesByCompanyId.set(companyId, (openRolesByCompanyId.get(companyId) ?? 0) + 1)
  }

  const filtered = (companies ?? []).filter((c: any) => {
    if (verifiedOnly && !c.verified) return false
    if (minTrust && (c.trust_score ?? 0) < minTrust) return false
    if (!query) return true
    const haystack = [c.name, c.location ?? ""].join(" ").toLowerCase()
    return haystack.includes(query.toLowerCase())
  })

  return (
    <div className="space-y-8">
      <PageHeader
        title="Employers"
        description="Browse verified teams, compare trust signals, and explore open roles."
        actions={
          <form action="/employers" className="flex gap-2">
            <Input name="q" placeholder="Search companies" defaultValue={query} className="w-full sm:w-64" />
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[280px,1fr]">
        <form action="/employers" method="get" className="space-y-4">
          {query ? <input type="hidden" name="q" value={query} /> : null}
          <div className="rounded-[var(--radius)] border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" aria-hidden />
              <h2 className="text-sm font-semibold text-foreground">Filters</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Focus on verified teams and minimum trust scores.
            </p>

            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-2">
                <input id="verified" name="verified" value="true" type="checkbox" defaultChecked={verifiedOnly} />
                <Label htmlFor="verified">Verified only</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minTrust">Minimum trust score</Label>
                <Input id="minTrust" name="minTrust" type="number" min={0} max={100} defaultValue={minTrust || ""} />
              </div>
              <Button type="submit" className="w-full">
                Apply filters
              </Button>
              <Button type="button" variant="outline" className="w-full" asChild>
                <Link href="/employers">Reset</Link>
              </Button>
            </div>
          </div>
        </form>

        <div>
          {filtered.length === 0 ? (
            <div className="rounded-[var(--radius)] border border-border bg-muted p-10">
              <EmptyState
                icon={SearchX}
                title="No employers match these filters"
                description="Try adjusting filters or reset to see all employers."
                action={{ label: "Reset", href: "/employers" }}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius)] border border-border bg-secondary px-4 py-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                  <span>
                    Showing <span className="font-semibold text-foreground">{filtered.length}</span> teams
                  </span>
                </div>
                <span className="text-muted-foreground">
                  Tip: open an employer profile to see trust breakdown and open roles.
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {filtered.map((company: any) => (
                  <EmployerCard
                    key={company.slug}
                    employer={company}
                    openRoles={openRolesByCompanyId.get(String(company.id ?? "")) ?? 0}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



