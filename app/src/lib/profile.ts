import { supabaseServer } from "@/lib/supabase/server";
import type { ProfileRecord } from "@/lib/types";

export async function fetchProfile(userId?: string | null) {
  if (!userId) return null;
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  return (data as ProfileRecord) ?? null;
}

export async function fetchPortfolioItems(userId?: string | null) {
  if (!userId) return [];

  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function fetchProfileByUsername(username: string) {
  if (!username) return null;

  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (data) return data as ProfileRecord;
  return null;
}
