"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bookmark, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { clearSavedJobs, listSavedJobs, toggleSavedJob, type SavedJobWithJob } from "@/app/app/saved/actions";
import { formatCurrencyRange } from "@/lib/format";

export function SavedJobsClient() {
  const [saved, setSaved] = useState<SavedJobWithJob[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listSavedJobs()
      .then((result) => {
        if (cancelled) return;
        if (result.ok) setSaved(result.data);
      })
      .finally(() => setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && saved.length === 0) {
    return (
      <EmptyState
        title="No saved jobs yet"
        description="Use the bookmark icon on a job card to save roles for later."
        icon="Bookmark"
        action={{ label: "Browse jobs", href: "/jobs" }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius)] border border-border bg-secondary px-4 py-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Bookmark className="h-4 w-4 text-primary" aria-hidden />
          <span>
            <span className="font-semibold text-foreground">{saved.length}</span> saved job
            {saved.length === 1 ? "" : "s"}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setLoading(true);
            clearSavedJobs()
              .then((res) => {
                if (!res.ok) {
                  toast.error(res.error || "Could not clear saved jobs.");
                  return;
                }
                setSaved([]);
                toast.success("Cleared saved jobs.");
              })
              .finally(() => setLoading(false));
          }}
          disabled={loading}
        >
          <Trash2 className="mr-2 h-4 w-4" aria-hidden />
          Clear all
        </Button>
      </div>

      <div className="grid gap-4">
        {saved.map(({ job }) => {
          const salary = formatCurrencyRange({
            currency: job.currency ?? undefined,
            min: job.salary_min ?? undefined,
            max: job.salary_max ?? undefined,
          });

          return (
            <article
              key={job.id}
              className="flex flex-col gap-4 rounded-[var(--radius)] border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold text-foreground">{job.title}</p>
                  {job.companies?.verified ? <Badge variant="accent">Verified</Badge> : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  {job.companies?.name ?? "Company"}, {job.location ?? "Remote"}
                </p>
                {salary ? (
                  <p className="text-sm font-semibold text-foreground">{salary}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="secondary">
                  <Link href={`/jobs/${job.id}`}>View job</Link>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setLoading(true);
                    toggleSavedJob(job.id)
                      .then((res) => {
                        if (!res.ok) {
                          toast.error(res.error || "Could not update saved jobs.");
                          return;
                        }
                        setSaved((prev) => prev.filter((j) => j.job.id !== job.id));
                        toast.success("Removed from saved.");
                      })
                      .finally(() => setLoading(false));
                  }}
                  disabled={loading}
                >
                  Remove
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

