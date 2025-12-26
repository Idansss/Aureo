"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/container"
import { PageHeader } from "@/components/page-header"
import { JobCard } from "@/components/job-card"
import { FilterSidebar, type JobsFilterSidebarValue } from "@/components/filter-sidebar"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Search, MapPin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { supabaseBrowser } from "@/lib/supabase/client"
import { jobRecordToManifest } from "@/lib/job-presenter"
import type { JobRecord, Job } from "@/lib/types"
import { formatSupabaseError, isSchemaMissingError } from "@/lib/supabase/error"

function formatCurrency(code?: string | null) {
  const c = (code ?? "USD").toUpperCase()
  if (c === "USD") return "$"
  if (c === "EUR") return "€"
  if (c === "GBP") return "£"
  if (c === "NGN") return "₦"
  return c ? `${c} ` : ""
}

function formatSalary(min?: number | null, max?: number | null, currency?: string | null) {
  const symbol = formatCurrency(currency)
  if (typeof min === "number" && typeof max === "number") return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`
  if (typeof min === "number") return `${symbol}${min.toLocaleString()}+`
  if (typeof max === "number") return `Up to ${symbol}${max.toLocaleString()}`
  return "Not disclosed"
}

function inferTagsFromTitle(title: string) {
  const t = title.toLowerCase()
  if (t.includes("designer") || t.includes("design")) return ["Design"]
  if (t.includes("engineer") || t.includes("frontend") || t.includes("backend")) return ["Engineering"]
  if (t.includes("product")) return ["Product"]
  if (t.includes("ops") || t.includes("operations")) return ["Operations"]
  return []
}

function hoursToDaysString(hours: number | null) {
  if (!hours || !Number.isFinite(hours)) return ""
  return String(Math.max(0.5, Math.round((hours / 24) * 10) / 10))
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [draftQuery, setDraftQuery] = useState("")
  const [draftLocation, setDraftLocation] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [locationQuery, setLocationQuery] = useState("")
  const [sortBy, setSortBy] = useState("relevant")
  const [page, setPage] = useState(1)
  const [sidebarFilters, setSidebarFilters] = useState<JobsFilterSidebarValue>({
    salaryRange: [50],
    selectedLocations: [],
    selectedEmploymentTypes: [],
    selectedWorkModes: [],
    selectedCategories: [],
    hideLowTrust: true,
    minTrustScore: [70],
    minResponseRate: [50],
    maxResponseTime: [7],
  })

  const pageSize = 6

  useEffect(() => {
    const supabase = supabaseBrowser()
    ;(async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select(
          "id,title,description,requirements,employment_type,location,remote,salary_min,salary_max,currency,created_at,companies:company_id(name,verified,response_rate,trust_score,logo_url)",
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) {
        const meta = formatSupabaseError(error)
        console.error("Failed to load jobs:", meta, error)
        toast.error(
          isSchemaMissingError(error)
            ? "Database tables are missing. Apply Supabase migrations, then refresh."
            : meta.message || "Could not load jobs",
        )
        return
      }

      setJobs(((data as any) ?? []).map((r: JobRecord) => jobRecordToManifest(r)))
    })()
  }, [])

  const filteredJobs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const location = locationQuery.trim().toLowerCase()
    const minSalary = (sidebarFilters.salaryRange[0] || 0) * 1000
    const selectedEmploymentTypes = sidebarFilters.selectedEmploymentTypes.map((item) => item.toLowerCase())
    const selectedLocations = sidebarFilters.selectedLocations.map((item) => item.toLowerCase())
    const selectedWorkModes = sidebarFilters.selectedWorkModes.map((item) => item.toLowerCase())
    const selectedCategories = sidebarFilters.selectedCategories.map((item) => item.toLowerCase())

    const parseSalaryMin = (salary: string) => {
      const matches = salary.match(/(\d[\d,]*)/g)
      if (!matches?.length) return null
      const numeric = Number(matches[0].replace(/,/g, ""))
      return Number.isFinite(numeric) ? numeric : null
    }

    const result = jobs.filter((job) => {
      if (query) {
        const haystack = `${job.title} ${job.company} ${job.description} ${job.tags.join(" ")}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }

      if (location) {
        const locationHaystack = `${job.location}`.toLowerCase()
        if (!locationHaystack.includes(location)) return false
      }

      if (selectedLocations.length) {
        const jobLocation = job.location.toLowerCase()
        if (!selectedLocations.some((value) => jobLocation.includes(value))) return false
      }

      if (selectedEmploymentTypes.length) {
        const jobType = job.type.toLowerCase()
        if (!selectedEmploymentTypes.some((value) => jobType.includes(value))) return false
      }

      if (selectedWorkModes.length) {
        const jobLocation = job.location.toLowerCase()
        const jobType = job.type.toLowerCase()
        const isRemote = jobLocation.includes("remote")
        const isHybrid = jobType.includes("hybrid")
        const isOnSite = !isRemote && !isHybrid

        const match =
          (selectedWorkModes.includes("remote") && isRemote) ||
          (selectedWorkModes.includes("hybrid") && isHybrid) ||
          (selectedWorkModes.includes("on-site") && isOnSite)

        if (!match) return false
      }

      if (selectedCategories.length) {
        const jobTags = job.tags.map((tag) => tag.toLowerCase())
        if (!selectedCategories.some((category) => jobTags.includes(category))) return false
      }

      const salaryMin = parseSalaryMin(job.salary)
      if (salaryMin !== null && salaryMin < minSalary) return false

      if (sidebarFilters.hideLowTrust && job.trustScore < sidebarFilters.minTrustScore[0]) return false
      if (job.responseRate < sidebarFilters.minResponseRate[0]) return false

      const responseTimeDays = job.avgResponseTime ? parseFloat(job.avgResponseTime) : 999
      if (Number.isFinite(responseTimeDays) && responseTimeDays > sidebarFilters.maxResponseTime[0]) return false

      return true
    })

    const sorted = [...result]
    if (sortBy === "trust") {
      sorted.sort((a, b) => b.trustScore - a.trustScore)
    } else if (sortBy === "salary-high") {
      sorted.sort((a, b) => (parseSalaryMin(b.salary) ?? 0) - (parseSalaryMin(a.salary) ?? 0))
    } else if (sortBy === "salary-low") {
      sorted.sort((a, b) => (parseSalaryMin(a.salary) ?? 0) - (parseSalaryMin(b.salary) ?? 0))
    }

    return sorted
  }, [
    jobs,
    locationQuery,
    searchQuery,
    sidebarFilters.salaryRange,
    sidebarFilters.selectedCategories,
    sidebarFilters.selectedEmploymentTypes,
    sidebarFilters.selectedLocations,
    sidebarFilters.selectedWorkModes,
    sidebarFilters.hideLowTrust,
    sidebarFilters.minTrustScore,
    sidebarFilters.minResponseRate,
    sidebarFilters.maxResponseTime,
    sortBy,
  ])

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pagedJobs = filteredJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleResetAll = () => {
    setDraftQuery("")
    setDraftLocation("")
    setSearchQuery("")
    setLocationQuery("")
    setSortBy("relevant")
    setPage(1)

    setSidebarFilters({
      salaryRange: [50],
      selectedLocations: [],
      selectedEmploymentTypes: [],
      selectedWorkModes: [],
      selectedCategories: [],
      hideLowTrust: true,
      minTrustScore: [70],
      minResponseRate: [50],
      maxResponseTime: [7],
    })

    toast.success("Filters reset")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <Container className="py-8 flex-1">
        {/* Search Bar */}
        <div className="mb-8 space-y-4">
          <PageHeader
            title="Find Your Next Role"
            description="Browse verified job opportunities from trusted employers"
          />

          <form
            className="flex flex-col sm:flex-row gap-3"
            onSubmit={(event) => {
              event.preventDefault()
              setSearchQuery(draftQuery.trim())
              setLocationQuery(draftLocation.trim())
              setPage(1)
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, company, or keyword..."
                value={draftQuery}
                onChange={(e) => setDraftQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative sm:w-64">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                placeholder="Location"
                className="pl-10"
                value={draftLocation}
                onChange={(e) => setDraftLocation(e.target.value)}
              />
            </div>
            <Button type="submit" variant="primary" className="sm:w-auto">
              Search
            </Button>
          </form>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto overscroll-contain pr-2 space-y-6">
            <FilterSidebar
              value={sidebarFilters}
              onChange={(next) => {
                setSidebarFilters(next)
                setPage(1)
              }}
              onReset={handleResetAll}
            />
          </aside>

          {/* Jobs List */}
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{filteredJobs.length}</span> jobs found
              </p>
              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <div className="lg:hidden">
                  <FilterSidebar
                    mobile
                    value={sidebarFilters}
                    onChange={(next) => {
                      setSidebarFilters(next)
                      setPage(1)
                    }}
                    onReset={handleResetAll}
                  />
                </div>
                <Select
                  value={sortBy}
                  onValueChange={(value) => {
                    setSortBy(value)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevant">Most Relevant</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="salary-high">Salary: High to Low</SelectItem>
                    <SelectItem value="salary-low">Salary: Low to High</SelectItem>
                    <SelectItem value="trust">Trust Score</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

                  {/* Jobs Grid */}
                  <div className="grid gap-6">
                    {pagedJobs.map((job) => {
                      return <JobCard key={job.id} job={job} />
                    })}
                  </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={currentPage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <Button
                  key={pageNumber}
                  type="button"
                  variant={pageNumber === currentPage ? "secondary" : "outline"}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </Container>

      <Footer />
    </div>
  )
}
