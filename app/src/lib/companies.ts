import { supabaseServer } from "@/lib/supabase/server";
import type { CompanyRecord, JobRecord } from "@/lib/types";

export async function fetchCompanyBySlug(slug: string): Promise<CompanyRecord | null> {
  if (!slug) return null;
  const supabase = await supabaseServer();
  const { data } = await supabase.from("companies").select("*").eq("slug", slug).maybeSingle();
  return (data as CompanyRecord) ?? null;
}

export async function fetchJobsForCompany(companyId: string): Promise<JobRecord[]> {
  if (!companyId) return [];
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("jobs")
    .select("id, title, employment_type, location, remote, salary_min, salary_max, currency, created_at, companies:company_id(name, verified, response_rate, trust_score)")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (data as JobRecord[]) ?? [];
}


