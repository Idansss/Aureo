"use client";

import Link from "next/link";
import * as React from "react";
import { ApplyFlowDialog } from "./apply-flow-dialog";
import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/lib/supabase/client";

export function ApplyButton({ jobId }: { jobId: string }) {
  const [isActive, setIsActive] = React.useState(true);

  React.useEffect(() => {
    const supabase = supabaseBrowser();
    (async () => {
      const { data } = await supabase.from("jobs").select("is_active").eq("id", jobId).maybeSingle();
      if (typeof (data as any)?.is_active === "boolean") {
        setIsActive(Boolean((data as any).is_active));
      }
    })();
  }, [jobId]);

  if (!isActive) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled
          className="cursor-not-allowed"
        >
          Not accepting applications
        </Button>
        <Button type="button" variant="ghost" asChild>
          <Link href="/jobs">Browse other roles</Link>
        </Button>
      </div>
    );
  }

  return <ApplyFlowDialog jobId={jobId} />;
}
