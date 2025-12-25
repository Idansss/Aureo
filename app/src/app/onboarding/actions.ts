"use server";

import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { getServerUser } from "@/lib/auth-server";

const OnboardingSchema = z.object({
  fullName: z.string().min(2),
  headline: z.string().min(10),
  location: z.string().min(2),
  interests: z.array(z.string()).min(1),
  cvUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
});

export type OnboardingPayload = z.infer<typeof OnboardingSchema>;

export async function completeOnboarding(values: OnboardingPayload) {
  const parsed = OnboardingSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: "Fill in the required steps." };
  }

  const user = await getServerUser();
  if (!user) {
    return { ok: false, error: "Sign in to complete onboarding." };
  }

  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      full_name: parsed.data.fullName,
      headline: parsed.data.headline,
      location: parsed.data.location,
      bio: parsed.data.interests.join(", "),
      cv_url: parsed.data.cvUrl || null,
    });

  if (error) {
    return { ok: false, error: "Unable to save onboarding data." };
  }

  return { ok: true };
}
