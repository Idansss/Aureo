import * as React from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { isDemoMode } from "@/lib/demo-mode";

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

export type AuthState = AuthSnapshot & {
  ready: boolean;
};

const DEMO_SNAPSHOT: AuthSnapshot = {
  isAuthenticated: true,
  user: {
    id: "seeker_demo",
    email: "demo@seeker.com",
    role: "seeker",
    fullName: "Demo Seeker",
  },
};

export function useAuth(): AuthState {
  const [snapshot, setSnapshot] = React.useState<AuthSnapshot>(serverSnapshot);
  const [ready, setReady] = React.useState(false);
  const demo = isDemoMode();

  React.useEffect(() => {
    let active = true;
    setReady(false);

    const finalize = () => {
      if (!active) return;
      setReady(true);
    };

    if (demo) {
      setSnapshot(DEMO_SNAPSHOT);
      finalize();
      return;
    }

    const supabase = supabaseBrowser();

    const sync = async () => {
      if (!active) return;
      let next: AuthSnapshot = serverSnapshot;

      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        if (session?.user) {
          const metaRole = session.user.user_metadata?.role as "seeker" | "employer" | "admin" | undefined;
          const metaName = session.user.user_metadata?.full_name as string | undefined;

          const { data: profile } = await supabase
            .from("profiles")
            .select("role, full_name")
            .eq("id", session.user.id)
            .maybeSingle();

          next = {
            isAuthenticated: true,
            user: {
              id: session.user.id,
              email: session.user.email ?? null,
              role: (profile?.role ?? metaRole ?? null) as any,
              fullName: (profile?.full_name ?? metaName ?? null) as any,
            },
          };
        } else {
          try {
            const res = await fetch("/api/auth/me", { credentials: "include" });
            const json = (await res.json()) as any;
            if (json?.ok && json?.user?.id) {
              next = {
                isAuthenticated: true,
                user: {
                  id: String(json.user.id),
                  email: json.user.email ?? null,
                  role: (json.user.role ?? null) as any,
                  fullName: json.user.fullName ?? null,
                },
              };
            }
          } catch {
            // ignore
          }
        }
      } catch {
        next = serverSnapshot;
      } finally {
        if (!active) return;
        setSnapshot(next);
        finalize();
      }
    };

    sync();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      if (!active) return;
      sync();
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    }
  }, [demo]);

  return { ...snapshot, ready };
}

export async function signOut() {
  // Clear both localStorage session (browser) and auth cookies (server).
  try {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
  try {
    await fetch("/api/auth/signout", { method: "POST", credentials: "include" });
  } catch {
    // ignore
  }
}
