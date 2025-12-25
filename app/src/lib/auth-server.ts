import { supabaseServer } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export async function getServerUser(): Promise<User | null> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user ?? null;
}

export async function requireServerUser(): Promise<User> {
  const user = await getServerUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}


