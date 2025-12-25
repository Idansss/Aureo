import { supabaseServer } from "@/lib/supabase/server";
import type { ApplicationRecord } from "@/lib/types";
import type { PostgrestError } from "@supabase/supabase-js";

export async function fetchApplications(userId?: string | null) {
  if (!userId) return [];

  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("applications")
    .select(
      `id, status, created_at, updated_at, notes, withdrawn_at, jobs:job_id ( id, title, location, remote, employment_type, salary_min, salary_max, currency, companies:company_id ( name, verified, trust_score, response_rate ) )`,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    const supabaseError = error as PostgrestError;
    console.error("[applications] failed to load from supabase", {
      message: supabaseError.message,
      details: supabaseError.details,
      hint: supabaseError.hint,
      code: supabaseError.code,
    });
    return [];
  }

  return (data as ApplicationRecord[]) ?? [];
}
