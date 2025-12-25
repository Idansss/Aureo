import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { JobCard } from "@/components/job-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { fetchJobs } from "@/lib/jobs";
import { routes } from "@/lib/routes";
import type { JobRecord } from "@/lib/types";

export async function HomeFeaturedJobs() {
  let jobs: JobRecord[] = [];
  try {
    jobs = await fetchJobs();
  } catch {
    jobs = [];
  }

  const featured = jobs.slice(0, 6);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          title="High-signal roles from trusted teams"
          description="Browse roles with transparent compensation and active hiring managers."
        />
        <Button asChild variant="outline" className="w-full gap-2 md:w-auto">
          <Link href={routes.jobs}>
            View all jobs
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>

      {featured.length === 0 ? (
        <EmptyState
          title="No featured jobs yet"
          description="Roles will appear here when teams publish verified opportunities."
          action={{ label: "Browse jobs", href: routes.jobs }}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {featured.map((jobRecord) => {
            // Convert JobRecord to Job format for JobCard
            const company: any = jobRecord.companies ?? null
            const avgHours =
              typeof company?.avg_response_time_hours === "number" ? company.avg_response_time_hours : null
            const avgResponseTime =
              avgHours != null ? `${(avgHours / 24).toFixed(1)} days` : ""

            const job: any = {
              id: jobRecord.id,
              title: jobRecord.title,
              company: company?.name ?? "Unknown Company",
              companyLogo: company?.logo_url || undefined,
              verified: Boolean(company?.verified ?? false),
              location: jobRecord.location ?? "Remote",
              type: jobRecord.employment_type ?? "Full-time",
              salary: jobRecord.salary_min && jobRecord.salary_max
                ? `${jobRecord.currency ?? "USD"} ${jobRecord.salary_min.toLocaleString()} - ${jobRecord.salary_max.toLocaleString()}`
                : "Competitive",
              postedAt: jobRecord.created_at
                ? new Date(jobRecord.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "Recently",
              description: jobRecord.description || "",
              responsibilities: [] as string[],
              requirements: jobRecord.requirements ? jobRecord.requirements.split(". ").filter((r: string) => r.trim()) : [] as string[],
              benefits: [] as string[],
              tags: [
                jobRecord.employment_type ?? "Flexible",
                jobRecord.remote ? "Remote friendly" : "Location shared",
                "Trust signals included",
              ],
              trustScore: Number(company?.trust_score ?? 0),
              responseRate: Number(company?.response_rate ?? 0),
              avgResponseTime,
              applicants: undefined,
            }
            return <JobCard key={job.id} job={job} />
          })}
        </div>
      )}
    </section>
  );
}
