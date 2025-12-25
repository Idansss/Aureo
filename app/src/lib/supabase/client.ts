import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/lib/env";

type SupabaseBrowserClient = ReturnType<typeof createBrowserClient>;

export function supabaseBrowser() {
  const { url, anonKey } = getSupabasePublicEnv();
  return createBrowserClient(url, anonKey);
}
