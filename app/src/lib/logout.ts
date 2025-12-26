"use client";

import { supabaseBrowser } from "@/lib/supabase/client";
import { toast } from "sonner";

export interface LogoutOptions {
  router?: {
    refresh: () => void;
    replace: (path: string) => void;
  };
}

/**
 * Logout function that signs out from Supabase and updates UI immediately.
 */
export async function logout(options?: LogoutOptions): Promise<void> {
  const { router } = options || {};

  try {
    // Clear Supabase session
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    
    // Clear server-side auth cookies
    try {
      await fetch("/api/auth/signout", { method: "POST", credentials: "include" });
    } catch (error) {
      console.error("[logout] API signout failed:", error);
    }
    
    // Dispatch event to notify all components
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("aureo:session-change"));
    }

    // Show success message
    toast.success("Logged out");

    // Refresh router state and navigate
    if (router) {
      router.refresh();
      router.replace("/");
    } else if (typeof window !== "undefined") {
      // Backup to full reload if router not provided
      window.location.href = "/";
    }
  } catch (error) {
    console.error("[logout] Logout failed:", error);
    toast.error("Failed to log out. Please try again.");
    throw error;
  }
}
