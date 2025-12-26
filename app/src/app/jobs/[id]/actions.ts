"use server";

import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { getServerUser } from "@/lib/auth-server";

const ApplySchema = z.object({
  jobId: z.string().min(1),
  portfolioUrl: z.string().url().optional(),
  notes: z.string().max(5000).optional(),
});

const ReportSchema = z.object({
  jobId: z.string().min(1),
  reason: z.string().min(3),
  details: z.string().min(10),
});

export async function applyToJob(input: z.infer<typeof ApplySchema>) {
  const parsed = ApplySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid request." };
  }

  const user = await getServerUser();
  if (!user) return { ok: false, message: "Sign in to apply." };

  const supabase = await supabaseServer();
  const { error } = await supabase.from("applications").insert({
    job_id: parsed.data.jobId,
    user_id: user.id,
    resume_url: parsed.data.portfolioUrl ?? null,
    cover_letter: parsed.data.notes ?? null,
  });

  if (error) {
    return {
      ok: false,
      message: error.message.includes("duplicate")
        ? "You already applied to this role."
        : "Unable to submit your application right now.",
    };
  }

  return { ok: true, message: "Application sent." };
}

export async function reportJob(input: z.infer<typeof ReportSchema>) {
  const parsed = ReportSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Fill in both fields to continue." };
  }

  const user = await getServerUser();
  if (!user) return { ok: false, message: "Sign in to report suspicious jobs." };

  const supabase = await supabaseServer();
  const { error } = await supabase.from("job_reports").insert({
    job_id: parsed.data.jobId,
    reporter_id: user.id,
    reason: parsed.data.reason,
    details: parsed.data.details,
  });

  if (error) {
    return { ok: false, message: "Could not send report. Try again shortly." };
  }

  return { ok: true, message: "Thank you for keeping Aureo safe." };
}
