"use server";

import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { getServerUser } from "@/lib/auth-server";

const EmployerReportSchema = z.object({
  companyId: z.string().uuid(),
  reason: z.string().min(3),
  details: z.string().min(10),
});

export async function reportEmployer(input: z.infer<typeof EmployerReportSchema>) {
  const parsed = EmployerReportSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Fill in both fields to continue." };

  const user = await getServerUser();
  if (!user) return { ok: false, message: "Sign in to report employers." };

  const supabase = await supabaseServer();
  const { error } = await supabase.from("company_reports").insert({
    company_id: parsed.data.companyId,
    reporter_id: user.id,
    reason: parsed.data.reason,
    details: parsed.data.details,
  });

  if (error) {
    return { ok: false, message: "Could not send report. Try again shortly." };
  }

  return { ok: true, message: "Report submitted. Thank you for keeping Aureo safe." };
}


