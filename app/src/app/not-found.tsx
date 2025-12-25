"use client"

import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export default function NotFound() {
  return (
    <div className="py-12">
      <EmptyState
        title="Page not found"
        description="This route does not exist. Use the navigation to get back to a known page."
        icon={SearchX}
        action={{ label: "Go home", href: "/" }}
      />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Or browse <Link href="/jobs" className="font-semibold text-primary underline underline-offset-4">jobs</Link> and{" "}
        <Link href="/stories" className="font-semibold text-primary underline underline-offset-4">stories</Link>.
      </p>
    </div>
  );
}

