"use server";

import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { getServerUser } from "@/lib/auth-server";

const UpdateNotesSchema = z.object({
  applicationId: z.string().min(1),
  notes: z.string().max(20000).optional().nullable(),
});

export async function updateApplicationNotes(input: z.infer<typeof UpdateNotesSchema>) {
  const parsed = UpdateNotesSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid notes." };
  }

  const user = await getServerUser();
  if (!user) return { ok: false as const, error: "Unauthorized" };

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("applications")
    .update({ notes: parsed.data.notes ?? null } as any)
    .eq("id", parsed.data.applicationId)
    .eq("user_id", user.id)
    .select("id, notes, status, updated_at")
    .single();

  if (error) {
    console.error("Error updating application notes:", error);
    return { ok: false as const, error: "Could not save notes." };
  }

  // Best-effort event
  await supabase.from("application_events").insert({
    application_id: parsed.data.applicationId,
    actor_id: user.id,
    note: "Updated private notes",
    from_status: null,
    to_status: null,
  } as any);

  return { ok: true as const, data };
}

const WithdrawSchema = z.object({
  applicationId: z.string().min(1),
});

export async function withdrawApplication(input: z.infer<typeof WithdrawSchema>) {
  const parsed = WithdrawSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid request." };
  }

  const user = await getServerUser();
  if (!user) return { ok: false as const, error: "Unauthorized" };

  const supabase = await supabaseServer();

  const { data: existing, error: readError } = await supabase
    .from("applications")
    .select("id,status")
    .eq("id", parsed.data.applicationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (readError || !existing) {
    return { ok: false as const, error: "Application not found." };
  }

  const { data, error } = await supabase
    .from("applications")
    .update({ status: "withdrawn", withdrawn_at: new Date().toISOString() } as any)
    .eq("id", parsed.data.applicationId)
    .eq("user_id", user.id)
    .select("id,status,withdrawn_at,updated_at")
    .single();

  if (error) {
    console.error("Error withdrawing application:", error);
    return { ok: false as const, error: "Could not withdraw application." };
  }

  await supabase.from("application_events").insert({
    application_id: parsed.data.applicationId,
    actor_id: user.id,
    note: "Application withdrawn",
    from_status: existing.status,
    to_status: "withdrawn",
  } as any);

  return { ok: true as const, data };
}

export type ApplicationEventRow = {
  id: string;
  note: string | null;
  from_status: string | null;
  to_status: string | null;
  created_at: string;
};

export async function listApplicationEvents(applicationId: string) {
  const user = await getServerUser();
  if (!user) return { ok: false as const, error: "Unauthorized" };

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("application_events")
    .select("id,note,from_status,to_status,created_at")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error listing application events:", error);
    return { ok: false as const, error: "Could not load timeline." };
  }

  return { ok: true as const, data: (data as ApplicationEventRow[]) ?? [] };
}



