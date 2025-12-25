"use server"

import { z } from "zod"
import { supabaseServer } from "@/lib/supabase/server"
import { getServerUser } from "@/lib/auth-server"

const JobSchema = z.object({
  title: z.string().min(4),
  description: z.string().min(20),
  requirements: z.string().optional(),
  employment_type: z.string().optional(),
  location: z.string().optional(),
  remote: z.boolean().optional(),
  salary_min: z.number().optional(),
  salary_max: z.number().optional(),
  currency: z.string().optional(),
})

export async function createEmployerJob(input: z.infer<typeof JobSchema>) {
  const parsed = JobSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Fill in the highlighted fields." }
  }

  const user = await getServerUser()
  if (!user) {
    return { ok: false, error: "Sign in to post jobs." }
  }

  const supabase = await supabaseServer()
  const { data: company } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!company?.company_id) {
    return { ok: false, error: "Assign yourself to a company before posting." }
  }

  const { data: inserted, error } = await supabase
    .from("jobs")
    .insert({
      company_id: company.company_id,
      title: parsed.data.title,
      description: parsed.data.description,
      requirements: parsed.data.requirements,
      employment_type: parsed.data.employment_type,
      location: parsed.data.location,
      remote: parsed.data.remote ?? false,
      salary_min: parsed.data.salary_min,
      salary_max: parsed.data.salary_max,
      currency: parsed.data.currency,
      created_by: user.id,
      is_active: true,
    } as any)
    .select("id")
    .single()

  if (error || !inserted) {
    return { ok: false, error: "Unable to create the job. Check your permissions." }
  }

  return { ok: true, id: inserted.id as string }
}



