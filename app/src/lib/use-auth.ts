import * as React from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export type AuthSnapshot = {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string | null;
    role: "seeker" | "employer" | "admin" | null;
    fullName: string | null;
  } | null;
};

const serverSnapshot: AuthSnapshot = { isAuthenticated: false, user: null };

export function useAuth(): AuthSnapshot {
  const [snapshot, setSnapshot] = React.useState<AuthSnapshot>(serverSnapshot);

  React.useEffect(() => {
    const supabase = supabaseBrowser();

    const sync = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session?.user) {
        setSnapshot({ isAuthenticated: false, user: null });
        return;
      }

      const metaRole = session.user.user_metadata?.role as "seeker" | "employer" | "admin" | undefined;
      const metaName = session.user.user_metadata?.full_name as string | undefined;

      // Prefer profile row role/name if available
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", session.user.id)
        .maybeSingle();

      setSnapshot({
        isAuthenticated: true,
        user: {
          id: session.user.id,
          email: session.user.email ?? null,
          role: (profile?.role ?? metaRole ?? null) as any,
          fullName: (profile?.full_name ?? metaName ?? null) as any,
        },
      });
    };

    sync();
    const { data: sub } = supabase.auth.onAuthStateChange(() => sync());
    return () => sub.subscription.unsubscribe();
  }, []);

  return snapshot;
}

export async function signOut() {
  const supabase = supabaseBrowser();
  await supabase.auth.signOut();
}

