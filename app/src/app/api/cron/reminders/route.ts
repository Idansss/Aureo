import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// This endpoint should be protected with a CRON_SECRET header
// For Vercel, configure in vercel.json:
// {
//   "crons": [{
//     "path": "/api/cron/reminders",
//     "schedule": "* * * * *"
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
  const now = new Date().toISOString();

  // Get all scheduled reminders that are due
  const { data: reminders, error: remindersError } = await supabase
    .from("job_reminders")
    .select("*, saved_jobs:saved_job_id(*, jobs:job_id(*))")
    .eq("status", "scheduled")
    .lte("remind_at", now);

  if (remindersError) {
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 });
  }

  if (!reminders || reminders.length === 0) {
    return NextResponse.json({ processed: 0, results: [] });
  }

  type ReminderRow = {
    id: string;
    user_id: string;
    saved_job_id: string;
    note: string | null;
    saved_jobs: unknown;
  };

  const results: Array<{ reminder_id: string }> = [];
  const rows = reminders as unknown as ReminderRow[];

  for (const reminder of rows) {
    // Create notification
    const savedJob = reminder.saved_jobs as any;
    const job = savedJob?.jobs as any;

    const notification = {
      user_id: reminder.user_id,
      type: "reminder_due",
      title: "Reminder: Follow up on saved job",
      body: reminder.note || `Don't forget to follow up on ${job?.title || "this job"}`,
      data: {
        reminder_id: reminder.id,
        saved_job_id: reminder.saved_job_id,
        job_id: job?.id,
      },
    };

    await (supabase.from("notifications") as any).insert(notification);

    // Mark reminder as sent
    await (supabase.from("job_reminders") as any)
      .update({
        status: "sent",
        sent_at: now,
      })
      .eq("id", reminder.id);

    results.push({ reminder_id: reminder.id });
  }

  return NextResponse.json({ processed: rows.length, results });
}


