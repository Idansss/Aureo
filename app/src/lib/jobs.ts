import { supabaseServer } from "@/lib/supabase/server";
import type { JobRecord } from "@/lib/types";
import type { PostgrestError } from "@supabase/supabase-js";

function filterJobsList(
  jobs: JobRecord[],
  options?: {
  query?: string;
  location?: string;
  remote?: boolean;
  employment?: string;
  salaryMin?: number;
  salaryMax?: number;
  },
) {
  if (!options) return jobs;
  return jobs.filter((job) => {
    const matchesQuery = options.query
      ? job.title?.toLowerCase().includes(options.query.toLowerCase())
      : true;
    const matchesLocation = options.location
      ? (job.location ?? "").toLowerCase().includes(options.location.toLowerCase())
      : true;
    const matchesRemote = options.remote ? Boolean(job.remote) : true;
    const matchesEmployment = options.employment
      ? job.employment_type === options.employment
      : true;
    const matchesSalaryMin =
      typeof options.salaryMin === "number"
        ? (job.salary_min ?? 0) >= options.salaryMin
        : true;
    const matchesSalaryMax =
      typeof options.salaryMax === "number"
        ? (job.salary_max ?? Number.MAX_SAFE_INTEGER) <= options.salaryMax
        : true;
    return (
      matchesQuery &&
      matchesLocation &&
      matchesRemote &&
      matchesEmployment &&
      matchesSalaryMin &&
      matchesSalaryMax
    );
  });
}

export async function fetchJobs(options?: {
  query?: string;
  location?: string;
  remote?: boolean;
  employment?: string;
  salaryMin?: number;
  salaryMax?: number;
}) {
  const supabase = await supabaseServer();

  let queryBuilder = supabase
    .from("jobs")
    .select(
      `id, title, description, requirements, employment_type, location, remote, salary_min, salary_max, created_at, companies:company_id ( name, verified, response_rate, trust_score )`,
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (options?.query) {
    queryBuilder = queryBuilder.ilike("title", `%${options.query}%`) as typeof queryBuilder;
  }
  if (options?.location) {
    queryBuilder = queryBuilder.ilike("location", `%${options.location}%`) as typeof queryBuilder;
  }
  if (options?.remote) {
    queryBuilder = queryBuilder.eq("remote", true) as typeof queryBuilder;
  }
  if (options?.employment) {
    queryBuilder = queryBuilder.eq("employment_type", options.employment) as typeof queryBuilder;
  }
  if (typeof options?.salaryMin === "number") {
    queryBuilder = queryBuilder.gte("salary_min", options.salaryMin) as typeof queryBuilder;
  }
  if (typeof options?.salaryMax === "number") {
    queryBuilder = queryBuilder.lte("salary_max", options.salaryMax) as typeof queryBuilder;
  }

  const { data, error } = await queryBuilder;

  if (error) {
    const supabaseError = error as PostgrestError;
    console.error("[jobs] failed to fetch from supabase", {
      message: supabaseError.message,
      details: supabaseError.details,
      hint: supabaseError.hint,
      code: supabaseError.code,
    });
    return [];
  }

  return filterJobsList((data as JobRecord[]) ?? [], options);
}

export async function fetchJobById(id: string) {
  if (!id) return null;

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("jobs")
    .select(
      `id, title, description, requirements, employment_type, location, remote, salary_min, salary_max, created_at, companies:company_id ( name, verified, response_rate, trust_score )`,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    const supabaseError = error as PostgrestError;
    console.error("[jobs] failed to fetch job by id from supabase", {
      message: supabaseError.message,
      details: supabaseError.details,
      hint: supabaseError.hint,
      code: supabaseError.code,
      id,
    });
    return null;
  }

  return (data as JobRecord) ?? null;
}

export async function fetchSimilarJobs(currentJobId?: string) {
  const jobs = await fetchJobs();
  if (!currentJobId) return jobs.slice(0, 3);
  return jobs.filter((job) => job.id !== currentJobId).slice(0, 3);
}
