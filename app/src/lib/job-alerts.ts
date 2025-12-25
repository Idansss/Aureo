import type { SupabaseClient } from "@supabase/supabase-js";

export type JobAlertCriteria = {
  keywords?: string | null;
  location?: string | null;
  remoteOnly?: boolean | null;
  employmentType?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
};

export type AlertFrequency = "instant" | "daily" | "weekly";

const DAY_MS = 24 * 60 * 60 * 1000;

export function shouldRunAlert(frequency: AlertFrequency, lastRunAt?: string | null) {
  if (!lastRunAt) return true;
  const lastRun = new Date(lastRunAt).getTime();
  const now = Date.now();

  if (frequency === "instant") return true;
  if (frequency === "daily") return now - lastRun >= DAY_MS;
  return now - lastRun >= DAY_MS * 7;
}

export function normalizeCriteria(criteria: JobAlertCriteria) {
  return {
    keywords: criteria.keywords?.trim() || null,
    location: criteria.location?.trim() || null,
    remoteOnly: criteria.remoteOnly ?? null,
    employmentType: criteria.employmentType?.trim() || null,
    salaryMin: typeof criteria.salaryMin === "number" ? criteria.salaryMin : null,
    salaryMax: typeof criteria.salaryMax === "number" ? criteria.salaryMax : null,
  } satisfies JobAlertCriteria;
}

export async function findMatchingJobs(
  client: SupabaseClient,
  criteria: JobAlertCriteria,
  since?: string | null,
) {
  const normalized = normalizeCriteria(criteria);
  let query = client
    .from("jobs")
    .select(
      "id, title, location, remote, employment_type, salary_min, salary_max, currency, created_at, companies (name, verified)",
    )
    .eq("is_active", true);

  if (since) {
    query = query.gt("created_at", since);
  }

  if (normalized.location) {
    query = query.ilike("location", `%${normalized.location}%`);
  }

  if (normalized.remoteOnly) {
    query = query.eq("remote", true);
  }

  if (normalized.employmentType) {
    query = query.eq("employment_type", normalized.employmentType);
  }

  if (typeof normalized.salaryMin === "number") {
    query = query.gte("salary_min", normalized.salaryMin);
  }

  if (typeof normalized.salaryMax === "number") {
    query = query.lte("salary_max", normalized.salaryMax);
  }

  if (normalized.keywords) {
    const term = normalized.keywords.replace(/\s+/g, " ").trim();
    if (term.length > 0) {
      query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
    }
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return data ?? [];
}
