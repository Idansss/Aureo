import type { Job, JobRecord } from "@/lib/types"

function currencySymbol(code?: string | null) {
  const c = (code ?? "").toUpperCase()
  if (c === "USD") return "$"
  if (c === "EUR") return "€"
  if (c === "GBP") return "£"
  if (c === "NGN") return "₦"
  return c ? `${c} ` : ""
}

function formatSalary(min?: number | null, max?: number | null, currency?: string | null) {
  const symbol = currencySymbol(currency)
  if (typeof min === "number" && typeof max === "number") {
    return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`
  }
  if (typeof min === "number") return `${symbol}${min.toLocaleString()}+`
  if (typeof max === "number") return `Up to ${symbol}${max.toLocaleString()}`
  return "Not disclosed"
}

function asList(text?: string | null) {
  if (!text) return []
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length >= 2) return lines
  return text
    .split(".")
    .map((x) => x.trim())
    .filter((x) => x.length >= 3)
    .slice(0, 8)
}

export function jobRecordToManifest(job: JobRecord): Job {
  const company = job.companies
  const postedAt = job.created_at ? new Date(job.created_at).toLocaleDateString() : ""

  return {
    id: String(job.id),
    title: String(job.title ?? ""),
    company: String(company?.name ?? ""),
    companyLogo: company?.logo_url ?? undefined,
    verified: Boolean(company?.verified ?? false),
    location: String(job.location ?? (job.remote ? "Remote" : "")),
    type: String(job.employment_type ?? ""),
    salary: formatSalary(job.salary_min ?? null, job.salary_max ?? null, job.currency ?? null),
    salaryMin: job.salary_min ?? null,
    salaryMax: job.salary_max ?? null,
    currency: job.currency ?? null,
    postedAt,
    description: String(job.description ?? ""),
    responsibilities: [],
    requirements: asList(job.requirements ?? null),
    benefits: [],
    tags: [],
    trustScore: Number(company?.trust_score ?? 0),
    responseRate: Number(company?.response_rate ?? 0),
    avgResponseTime: "",
    applicants: undefined,
  }
}


