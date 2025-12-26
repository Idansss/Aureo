"use client";

import * as React from "react";
import type { Viewer } from "@/lib/viewer";

const DEFAULT_VIEWER: Viewer = {
  isAuthenticated: false,
  user: null,
  canLogout: false,
};

/**
 * Client-side hook that reads viewer state and stays in sync.
 * Uses the /api/viewer endpoint for server-side truth.
 */
export function useViewer(): Viewer & { ready: boolean } {
  const [viewer, setViewer] = React.useState<Viewer>(DEFAULT_VIEWER);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    setReady(false);

    const sync = async () => {
      if (!active) return;

      try {
        // Fetch from API
        const res = await fetch("/api/viewer", { credentials: "include" });
        if (res.ok) {
          const data = await res.json() as Viewer;
          if (active) {
            setViewer(data);
          }
        }
      } catch (error) {
        console.error("[useViewer] Failed to fetch viewer:", error);
        if (active) {
          setViewer(DEFAULT_VIEWER);
        }
      } finally {
        if (active) {
          setReady(true);
        }
      }
    };

    sync();

    // Listen for session changes (logout/login)
    const handleSessionChange = () => {
      if (active) {
        sync();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("aureo:session-change", handleSessionChange);
    }

    return () => {
      active = false;
      if (typeof window !== "undefined") {
        window.removeEventListener("aureo:session-change", handleSessionChange);
      }
    };
  }, []);

  return { ...viewer, ready };
}
