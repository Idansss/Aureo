import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { fetchJobs } from "@/lib/jobs";

// This endpoint should be protected with a CRON_SECRET header
// For Vercel, configure in vercel.json:
// {
//   "crons": [{
//     "path": "/api/cron/alerts",
//     "schedule": "*/15 * * * *"
//   }]
// }

export async function GET(request: NextRequest) {
  // Verify CRON_SECRET if provided
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = supabaseAdmin();

  // Get all active alerts
  const { data: alerts, error: alertsError } = await supabase
    .from("job_alerts")
    .select("*")
    .eq("is_active", true);

  if (alertsError || !alerts) {
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }

  type JobAlertRow = {
    id: string;
    user_id: string;
    name: string;
    criteria: Record<string, unknown>;
    frequency: "instant" | "daily" | "weekly";
    last_run_at: string | null;
  };

  const now = new Date();
  const results: Array<{ alert_id: string; matches: number }> = [];
  const rows = (alerts ?? []) as unknown as JobAlertRow[];

  for (const alert of rows) {
    // Check if alert should run based on frequency
    const lastRunAt = alert.last_run_at ? new Date(alert.last_run_at) : new Date(0);
    const shouldRun = (() => {
      if (alert.frequency === "instant") {
        // Instant alerts run every time (but we still check for new jobs since last_run_at)
        return true;
      } else if (alert.frequency === "daily") {
        const hoursSinceLastRun = (now.getTime() - lastRunAt.getTime()) / (1000 * 60 * 60);
        return hoursSinceLastRun >= 24;
      } else if (alert.frequency === "weekly") {
        const daysSinceLastRun = (now.getTime() - lastRunAt.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceLastRun >= 7;
      }
      return false;
    })();

    if (!shouldRun) continue;

    // Fetch jobs matching criteria
    const jobs = await fetchJobs({
      query: (alert.criteria as any).keywords,
      location: (alert.criteria as any).location,
      remote: (alert.criteria as any).remote,
      employment: (alert.criteria as any).employment_type,
      salaryMin: (alert.criteria as any).salary_min,
      salaryMax: (alert.criteria as any).salary_max,
    });

    // Filter to only new jobs since last_run_at
    const newJobs = jobs.filter((job) => {
      const jobDate = job.created_at ? new Date(job.created_at) : new Date(0);
      return jobDate > lastRunAt;
    });

    if (newJobs.length > 0) {
      // Create notifications (limit to 10 per alert to avoid spam)
      const notifications = newJobs.slice(0, 10).map((job) => ({
        user_id: alert.user_id,
        type: "alert_match",
        title: `${newJobs.length} new job${newJobs.length > 1 ? "s" : ""} match "${alert.name}"`,
        body: `${job.title} at ${(job as any).company?.name || "Company"}`,
        data: { job_id: job.id, alert_id: alert.id },
      }));

      await (supabase.from("notifications") as any).insert(notifications);

      // Update last_run_at
      await (supabase.from("job_alerts") as any)
        .update({ last_run_at: now.toISOString() })
        .eq("id", alert.id);

      results.push({ alert_id: alert.id, matches: newJobs.length });
    } else {
      // Still update last_run_at even if no matches
      await (supabase.from("job_alerts") as any)
        .update({ last_run_at: now.toISOString() })
        .eq("id", alert.id);
    }
  }

  return NextResponse.json({ processed: rows.length, results });
}

