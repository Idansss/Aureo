"use server";

import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { fetchJobs } from "@/lib/jobs";
import type { JobRecord } from "@/lib/types";
import { getServerUser } from "@/lib/auth-server";

// ============================================================================
// SAVED JOBS
// ============================================================================

export async function listSavedJobIds() {
  const user = await getServerUser();
  if (!user) return { ok: true as const, data: [] as string[] };

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("saved_jobs")
    .select("job_id")
    .eq("user_id", user.id);

  if (error) return { ok: false as const, error: "Could not load saved jobs." };

  return { ok: true as const, data: (data ?? []).map((r: any) => r.job_id as string) };
}

export async function isJobSaved(jobId: string) {
  const user = await getServerUser();
  if (!user) return { ok: true as const, data: false };

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("saved_jobs")
    .select("id")
    .eq("user_id", user.id)
    .eq("job_id", jobId)
    .maybeSingle();

  if (error) return { ok: false as const, error: "Could not check saved job." };
  return { ok: true as const, data: Boolean(data) };
}

export async function toggleSavedJob(jobId: string) {
  const user = await getServerUser();
  if (!user) return { ok: false as const, error: "Sign in to save jobs." };

  const supabase = await supabaseServer();
  const { data: existing, error: existingError } = await supabase
    .from("saved_jobs")
    .select("id")
    .eq("user_id", user.id)
    .eq("job_id", jobId)
    .maybeSingle();

  if (existingError) return { ok: false as const, error: "Could not update saved jobs." };

  if (existing?.id) {
    const { error } = await supabase.from("saved_jobs").delete().eq("id", existing.id).eq("user_id", user.id);
    if (error) return { ok: false as const, error: "Could not remove saved job." };
    return { ok: true as const, data: { saved: false } };
  }

  const { error } = await supabase.from("saved_jobs").insert({ user_id: user.id, job_id: jobId });
  if (error) return { ok: false as const, error: "Could not save job." };

  return { ok: true as const, data: { saved: true } };
}

export async function clearSavedJobs() {
  const user = await getServerUser();
  if (!user) return { ok: false as const, error: "Sign in to manage saved jobs." };

  const supabase = await supabaseServer();
  const { error } = await supabase.from("saved_jobs").delete().eq("user_id", user.id);
  if (error) return { ok: false as const, error: "Could not clear saved jobs." };
  return { ok: true as const };
}

export type SavedJobWithJob = {
  id: string;
  folder_id: string | null;
  job: JobRecord;
};

export async function listSavedJobs() {
  const user = await getServerUser();
  if (!user) return { ok: true as const, data: [] as SavedJobWithJob[] };

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("saved_jobs")
    .select(
      "id, folder_id, jobs:job_id(id, title, description, requirements, employment_type, location, remote, salary_min, salary_max, currency, created_at, companies:company_id(name, verified, response_rate, trust_score))",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { ok: false as const, error: "Could not load saved jobs." };

  const rows = (data ?? [])
    .map((row: any) => {
      const job = row.jobs as JobRecord | null;
      if (!job) return null;
      return { id: row.id as string, folder_id: row.folder_id ?? null, job } satisfies SavedJobWithJob;
    })
    .filter(Boolean) as SavedJobWithJob[];

  return { ok: true as const, data: rows };
}

// ============================================================================
// FOLDERS
// ============================================================================

const FolderSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().optional(),
});

export async function createFolder(input: z.infer<typeof FolderSchema>) {
  const parsed = FolderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Folder name is required." };
  }

  const user = await getServerUser();
  if (!user) {
    return { ok: false, error: "Sign in to create folders." };
  }

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("job_folders")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      color: parsed.data.color ?? null,
    })
    .select()
    .single();

  if (error) {
    return {
      ok: false,
      error: error.message.includes("duplicate") ? "Folder name already exists." : "Could not create folder.",
    };
  }

  return { ok: true, data };
}

export async function updateFolder(id: string, input: z.infer<typeof FolderSchema>) {
  const parsed = FolderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid folder data." };
  }

  const user = await getServerUser();
  if (!user) {
    return { ok: false, error: "Sign in to update folders." };
  }

  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("job_folders")
    .update({
      name: parsed.data.name,
      color: parsed.data.color ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: "Could not update folder." };
  }

  return { ok: true };
}

export async function deleteFolder(id: string) {
  const user = await getServerUser();
  if (!user) {
    return { ok: false, error: "Sign in to delete folders." };
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.from("job_folders").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    return { ok: false, error: "Could not delete folder." };
  }

  return { ok: true };
}

export async function listFolders() {
  const user = await getServerUser();
  if (!user) {
    return { ok: true, data: [] };
  }

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("job_folders")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) {
    return { ok: false, error: "Could not load folders." };
  }

  return { ok: true, data: data ?? [] };
}

export async function assignJobToFolder(savedJobId: string, folderId: string | null) {
  const user = await getServerUser();
  if (!user) {
    return { ok: false, error: "Sign in to assign jobs to folders." };
  }

  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("saved_jobs")
    .update({ folder_id: folderId, updated_at: new Date().toISOString() })
    .eq("id", savedJobId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: "Could not assign job to folder." };
  }

  return { ok: true };
}

// ============================================================================
// JOB ALERTS
// ============================================================================

const AlertCriteriaSchema = z.object({
  keywords: z.string().optional(),
  location: z.string().optional(),
  remote: z.boolean().optional(),
  employment_type: z.string().optional(),
  salary_min: z.number().optional(),
  salary_max: z.number().optional(),
  experience_level: z.string().optional(),
});

const AlertSchema = z.object({
  name: z.string().min(1).max(100),
  criteria: AlertCriteriaSchema,
  frequency: z.enum(["instant", "daily", "weekly"]).default("daily"),
});

export async function createAlert(input: z.infer<typeof AlertSchema>) {
  const parsed = AlertSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid alert data." };
  }

  const user = await getServerUser();
  if (!user) {
    return { ok: false, error: "Sign in to create alerts." };
  }

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("job_alerts")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      criteria: parsed.data.criteria,
      frequency: parsed.data.frequency,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return { ok: false, error: "Could not create alert." };
  }

  return { ok: true, data };
}

export async function updateAlert(id: string, input: z.infer<typeof AlertSchema>) {
  const parsed = AlertSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid alert data." };
  }

  const user = await getServerUser();
  if (!user) {
    return { ok: false, error: "Sign in to update alerts." };
  }

  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("job_alerts")
    .update({
      name: parsed.data.name,
      criteria: parsed.data.criteria,
      frequency: parsed.data.frequency,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: "Could not update alert." };
  }

  return { ok: true };
}

export async function toggleAlert(id: string, isActive: boolean) {
  const user = await getServerUser();
  if (!user) {
    return { ok: false, error: "Sign in to toggle alerts." };
  }

  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("job_alerts")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: "Could not toggle alert." };
  }

  return { ok: true };
}

export async function deleteAlert(id: string) {
  const user = await getServerUser();
  if (!user) {
    return { ok: false, error: "Sign in to delete alerts." };
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.from("job_alerts").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    return { ok: false, error: "Could not delete alert." };
  }

  return { ok: true };
}

export async function listAlerts() {
  const user = await getServerUser();
  if (!user) {
    return { ok: true, data: [] };
  }

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("job_alerts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { ok: false, error: "Could not load alerts." };
  }

  return { ok: true, data: data ?? [] };
}

export async function runAlertNow(id: string) {
  const user = await getServerUser();
  if (!user) {
    return { ok: false, error: "Sign in to run alerts." };
  }

  const supabase = await supabaseServer();
  const { data: alert, error: alertError } = await supabase
    .from("job_alerts")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (alertError || !alert) {
    return { ok: false, error: "Alert not found or inactive." };
  }

  // Fetch jobs matching criteria
  const jobs = await fetchJobs({
    query: alert.criteria.keywords,
    location: alert.criteria.location,
    remote: alert.criteria.remote,
    employment: alert.criteria.employment_type,
    salaryMin: alert.criteria.salary_min,
    salaryMax: alert.criteria.salary_max,
  });

  // Get last run time to only notify on new jobs
  const lastRunAt = alert.last_run_at ? new Date(alert.last_run_at) : new Date(0);
  const newJobs = jobs.filter((job) => {
    const jobDate = job.created_at ? new Date(job.created_at) : new Date(0);
    return jobDate > lastRunAt;
  });

  // Create notifications for new matches
  if (newJobs.length > 0) {
    const notifications = newJobs.slice(0, 10).map((job) => ({
      user_id: user.id,
      type: "alert_match",
      title: `${newJobs.length} new job${newJobs.length > 1 ? "s" : ""} match your alert`,
      body: `${job.title} at ${(job as any).company?.name || "Company"}`,
      data: { job_id: job.id, alert_id: id },
    }));
    await supabase.from("notifications").insert(notifications);
  }

  // Always update last_run_at
  await supabase
    .from("job_alerts")
    .update({ last_run_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  return { ok: true, data: { matches: newJobs.length } };
}

// ============================================================================
// REMINDERS
// ============================================================================

const ReminderSchema = z.object({
  saved_job_id: z.string().min(1),
  remind_at: z.string().datetime(),
  note: z.string().optional(),
});

export async function createReminder(input: z.infer<typeof ReminderSchema>) {
  const parsed = ReminderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid reminder data." };
  }

  const user = await getServerUser();
  if (!user) {
    return { ok: false, error: "Sign in to create reminders." };
  }

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("job_reminders")
    .insert({
      user_id: user.id,
      saved_job_id: parsed.data.saved_job_id,
      remind_at: parsed.data.remind_at,
      note: parsed.data.note ?? null,
      status: "scheduled",
    })
    .select()
    .single();

  if (error) {
    return { ok: false, error: "Could not create reminder." };
  }

  return { ok: true, data };
}

export async function updateReminder(id: string, input: Partial<z.infer<typeof ReminderSchema>>) {
  const user = await getServerUser();
  if (!user) {
    return { ok: false, error: "Sign in to update reminders." };
  }

  const supabase = await supabaseServer();
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.remind_at) updateData.remind_at = input.remind_at;
  if (input.note !== undefined) updateData.note = input.note ?? null;

  const { error } = await supabase
    .from("job_reminders")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: "Could not update reminder." };
  }

  return { ok: true };
}

export async function cancelReminder(id: string) {
  const user = await getServerUser();
  if (!user) {
    return { ok: false, error: "Sign in to cancel reminders." };
  }

  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("job_reminders")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: "Could not cancel reminder." };
  }

  return { ok: true };
}

export async function listReminders() {
  const user = await getServerUser();
  if (!user) {
    return { ok: true, data: [] };
  }

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("job_reminders")
    .select("*, saved_jobs:saved_job_id(*, jobs:job_id(*))")
    .eq("user_id", user.id)
    .eq("status", "scheduled")
    .order("remind_at", { ascending: true });

  if (error) {
    return { ok: false, error: "Could not load reminders." };
  }

  return { ok: true, data: data ?? [] };
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export async function listNotifications() {
  const user = await getServerUser();
  if (!user) {
    return { ok: true, data: [] };
  }

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return { ok: false, error: "Could not load notifications." };
  }

  return { ok: true, data: data ?? [] };
}

export async function markNotificationRead(id: string) {
  const user = await getServerUser();
  if (!user) {
    return { ok: false, error: "Sign in to mark notifications as read." };
  }

  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: "Could not mark notification as read." };
  }

  return { ok: true };
}

export async function getUnreadNotificationCount() {
  const user = await getServerUser();
  if (!user) {
    return { ok: true, count: 0 };
  }

  const supabase = await supabaseServer();
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  if (error) {
    return { ok: false, error: "Could not get notification count." };
  }

  return { ok: true, count: count ?? 0 };
}

