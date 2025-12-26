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

export type AuthState = AuthSnapshot & {
  ready: boolean;
};

/**
 * @deprecated Use useViewer() from @/lib/use-viewer instead.
 * This hook is kept for backwards compatibility but will be removed in the future.
 */
export function useAuth(): AuthState {
  const [snapshot, setSnapshot] = React.useState<AuthSnapshot>(serverSnapshot);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    setReady(false);

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
        setReady(true);
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
    };
  }, []);

  return { ...snapshot, ready };
}
