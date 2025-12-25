import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/lib/env";

type SupabaseServerClient = ReturnType<typeof createServerClient>;

export async function supabaseServer(): Promise<SupabaseServerClient> {
  const cookieStore = await cookies();
  const { url: supabaseUrl, anonKey: supabaseKey } = getSupabasePublicEnv();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}

