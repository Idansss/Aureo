"use server"

import { z } from "zod"
import { supabaseServer } from "@/lib/supabase/server"
import { getServerUser } from "@/lib/auth-server"

async function requireEmployerCompanyId(userId: string): Promise<string | null> {
  const supabase = await supabaseServer()
  const { data } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", userId)
    .maybeSingle()
  return (data?.company_id as string | undefined) ?? null
}

export async function setJobActive(jobId: string, active: boolean) {
  const user = await getServerUser()
  if (!user) return { ok: false, error: "Sign in to manage jobs." }

  const companyId = await requireEmployerCompanyId(user.id)
  if (!companyId) return { ok: false, error: "Assign yourself to a company first." }

  const supabase = await supabaseServer()
  const { error } = await supabase
    .from("jobs")
    .update({ is_active: active, updated_at: new Date().toISOString() } as any)
    .eq("id", jobId)
    .eq("company_id", companyId)

  if (error) return { ok: false, error: "Could not update job status." }
  return { ok: true }
}

export async function duplicateJob(jobId: string) {
  const user = await getServerUser()
  if (!user) return { ok: false, error: "Sign in to manage jobs." }

  const companyId = await requireEmployerCompanyId(user.id)
  if (!companyId) return { ok: false, error: "Assign yourself to a company first." }

  const supabase = await supabaseServer()
  const { data: existing, error: loadError } = await supabase
    .from("jobs")
    .select("title,description,requirements,employment_type,location,remote,salary_min,salary_max,currency")
    .eq("id", jobId)
    .eq("company_id", companyId)
    .maybeSingle()

  if (loadError || !existing) return { ok: false, error: "Job not found." }

  const { data: inserted, error: insertError } = await supabase
    .from("jobs")
    .insert({
      company_id: companyId,
      created_by: user.id,
      title: existing.title,
      description: existing.description,
      requirements: existing.requirements,
      employment_type: existing.employment_type,
      location: existing.location,
      remote: existing.remote ?? false,
      salary_min: existing.salary_min,
      salary_max: existing.salary_max,
      currency: existing.currency,
      is_active: false,
    } as any)
    .select("id")
    .single()

  if (insertError || !inserted) return { ok: false, error: "Could not duplicate job." }
  return { ok: true, id: inserted.id as string }
}

const UpdateJobSchema = z.object({
  title: z.string().min(4),
  description: z.string().min(20),
  requirements: z.string().optional(),
  employment_type: z.string().optional(),
  location: z.string().optional(),
  remote: z.boolean().optional(),
  salary_min: z.number().nullable().optional(),
  salary_max: z.number().nullable().optional(),
  currency: z.string().optional(),
  is_active: z.boolean().optional(),
})

export async function updateJob(jobId: string, input: z.infer<typeof UpdateJobSchema>) {
  const parsed = UpdateJobSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Check the highlighted fields." }

  const user = await getServerUser()
  if (!user) return { ok: false, error: "Sign in to manage jobs." }

  const companyId = await requireEmployerCompanyId(user.id)
  if (!companyId) return { ok: false, error: "Assign yourself to a company first." }

  const supabase = await supabaseServer()
  const { error } = await supabase
    .from("jobs")
    .update({ ...parsed.data, updated_at: new Date().toISOString() } as any)
    .eq("id", jobId)
    .eq("company_id", companyId)

  if (error) return { ok: false, error: "Could not save changes." }
  return { ok: true }
}



