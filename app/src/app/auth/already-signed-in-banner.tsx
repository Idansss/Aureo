"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { logout } from "@/lib/logout";

export function AlreadySignedInBanner({
  email,
  role,
  continueHref,
}: {
  email: string | null;
  role: string | null;
  continueHref: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  return (
    <div className="mb-4 rounded-[var(--radius)] border border-border bg-secondary p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">You’re already signed in.</p>
          <p className="text-sm text-muted-foreground truncate">
            {email ?? "Unknown email"}{" "}
            {role ? (
              <Badge variant="outline" className="ml-2 align-middle">
                {role}
              </Badge>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={continueHref}>Continue</Link>
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={() => {
              setLoading(true);
              logout({ router })
                .finally(() => setLoading(false));
            }}
          >
            {loading ? "Signing out..." : "Sign out"}
          </Button>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Want to sign in with a different account? Use the form below after signing out (or just sign in again to switch).
      </p>
    </div>
  );
}





