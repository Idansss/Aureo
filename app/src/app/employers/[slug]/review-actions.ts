"use server";

import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { getServerUser } from "@/lib/auth-server";

const CreateReviewSchema = z.object({
  companyId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  title: z.string().max(80).optional(),
  body: z.string().min(10).max(2000),
});

export async function listCompanyReviews(companyId: string) {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("company_reviews")
    .select("id, rating, title, body, created_at, profiles:user_id(full_name, username)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return { ok: false as const, error: "Could not load reviews." };
  return { ok: true as const, data: (data ?? []) as any[] };
}

export async function upsertCompanyReview(input: z.infer<typeof CreateReviewSchema>) {
  const parsed = CreateReviewSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Please fill in all required fields." };

  const user = await getServerUser();
  if (!user) return { ok: false as const, error: "Sign in to leave a review." };

  const supabase = await supabaseServer();
  const { error } = await supabase.from("company_reviews").upsert({
    company_id: parsed.data.companyId,
    user_id: user.id,
    rating: parsed.data.rating,
    title: parsed.data.title ?? null,
    body: parsed.data.body,
    updated_at: new Date().toISOString(),
  });

  if (error) return { ok: false as const, error: "Could not submit review." };
  return { ok: true as const };
}


