import { supabaseServer } from "@/lib/supabase/server";

export type Viewer = {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string | null;
    role: "seeker" | "employer" | "admin" | null;
    fullName: string | null;
  } | null;
  canLogout: boolean;
};

/**
 * Single source of truth for viewer/session state on the server.
 * Uses Supabase Auth as the only source of authentication.
 */
export async function getViewer(): Promise<Viewer> {
  try {
    const supabase = await supabaseServer();
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data.user) {
      return {
        isAuthenticated: false,
        user: null,
        canLogout: false,
      };
    }

    // Fetch profile for role and fullName
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", data.user.id)
      .maybeSingle();

    const metaRole = data.user.user_metadata?.role as "seeker" | "employer" | "admin" | undefined;
    const metaName = data.user.user_metadata?.full_name as string | undefined;

    return {
      isAuthenticated: true,
      user: {
        id: data.user.id,
        email: data.user.email ?? null,
        role: (profile?.role ?? metaRole ?? null) as "seeker" | "employer" | "admin" | null,
        fullName: (profile?.full_name ?? metaName ?? null),
      },
      canLogout: true,
    };
  } catch (error) {
    console.error("[getViewer] Error fetching viewer:", error);
    return {
      isAuthenticated: false,
      user: null,
      canLogout: false,
    };
  }
}
