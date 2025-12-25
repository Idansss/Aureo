// Digest generation logic (real DB-backed)
"use server"

import { supabaseServer } from "@/lib/supabase/server"
import { getServerUser } from "@/lib/auth-server"
import type { DigestItem, DigestRow } from "./types-extended"

function extractKeywords(query: string): string[] {
  return query
    .split(/[,]/g)
    .flatMap((part) => part.split(/\s+/g))
    .map((x) => x.trim())
    .filter((x) => x.length >= 2)
    .slice(0, 10)
}

function computeMatch(title: string, description: string, keywords: string[]) {
  if (keywords.length === 0) return { matchedSkills: [] as string[], matchScore: 50 }
  const hay = `${title} ${description}`.toLowerCase()
  const matchedSkills = keywords.filter((k) => hay.includes(k.toLowerCase()))
  const base = 40
  const score = Math.min(95, base + matchedSkills.length * 12)
  return { matchedSkills, matchScore: score }
}

export async function generateDigest(searchId: string): Promise<DigestItem | null> {
  const user = await getServerUser()
  if (!user) return null

  const supabase = await supabaseServer()

  const { data: search, error: searchError } = await supabase
    .from("saved_searches")
    .select("*")
    .eq("id", searchId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (searchError || !search) {
    console.error("generateDigest: could not load saved_search", searchError)
    return null
  }

  const query = String((search as any).query ?? "")
  const filters = ((search as any).filters ?? {}) as any
  const keywords = extractKeywords(query)

  let jobsQuery = supabase
    .from("jobs")
    .select("id,title,location,description,remote,employment_type,companies(name)")
    .eq("is_active", true)
    .limit(50)

  if (query.trim()) {
    const q = query.trim().replace(/%/g, "\\%").replace(/_/g, "\\_")
    jobsQuery = jobsQuery.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
  }
  if (filters?.location) {
    const loc = String(filters.location).trim().replace(/%/g, "\\%").replace(/_/g, "\\_")
    if (loc) jobsQuery = jobsQuery.ilike("location", `%${loc}%`)
  }
  if (typeof filters?.remote === "boolean") {
    jobsQuery = jobsQuery.eq("remote", filters.remote)
  }
  if (filters?.type) {
    jobsQuery = jobsQuery.eq("employment_type", filters.type)
  }

  const { data: jobs, error: jobsError } = await jobsQuery
  if (jobsError) {
    console.error("generateDigest: jobs query failed", jobsError)
    return null
  }

  const summaryRows: DigestRow[] = (jobs ?? []).map((job: any) => {
    const match = computeMatch(String(job.title ?? ""), String(job.description ?? ""), keywords)
    return {
      jobId: String(job.id),
      title: String(job.title ?? ""),
      company: String(job.companies?.name ?? ""),
      location: String(job.location ?? ""),
      url: `/jobs/${job.id}`,
      matchedSkills: match.matchedSkills,
      matchScore: match.matchScore,
    }
  })

  const { data: digestRow, error: digestError } = await supabase
    .from("search_digests")
    .insert({
      user_id: user.id,
      saved_search_id: searchId,
      summary_rows: summaryRows as any,
    } as any)
    .select("id,created_at")
    .single()

  if (digestError || !digestRow) {
    console.error("generateDigest: insert digest failed", digestError)
    return null
  }

  await supabase
    .from("saved_searches")
    .update({ last_run_at: new Date().toISOString(), updated_at: new Date().toISOString() } as any)
    .eq("id", searchId)
    .eq("user_id", user.id)

  const digest: DigestItem = {
    id: String(digestRow.id),
    searchId: String(searchId),
    searchName: String((search as any).name ?? "Saved search"),
    createdAt: String(digestRow.created_at ?? new Date().toISOString()),
    jobIds: summaryRows.map((r) => r.jobId),
    summaryRows,
  }

  return digest
}

