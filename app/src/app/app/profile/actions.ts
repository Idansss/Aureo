"use server";

import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { getServerUser } from "@/lib/auth-server";

const ProfileSchema = z.object({
  fullName: z.string().min(2),
  headline: z.string().min(6),
  location: z.string().min(2),
  bio: z.string().optional(),
});

const PortfolioSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  link_url: z.string().url(),
});

export async function updateProfileDetails(input: z.infer<typeof ProfileSchema>) {
  const parsed = ProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Review the highlighted fields." };
  }
  const user = await getServerUser();
  if (!user) {
    return { ok: false, error: "Sign in to update your profile." };
  }
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      headline: parsed.data.headline,
      location: parsed.data.location,
      bio: parsed.data.bio ?? null,
    })
    .eq("id", user.id);
  if (error) {
    return { ok: false, error: "Could not update your profile." };
  }
  return { ok: true };
}

export async function addPortfolioItem(input: z.infer<typeof PortfolioSchema>) {
  const parsed = PortfolioSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Enter valid portfolio details." };
  }
  const user = await getServerUser();
  if (!user) {
    return { ok: false, error: "Sign in to add portfolio items." };
  }
  const supabase = await supabaseServer();
  const { error } = await supabase.from("portfolio_items").insert({
    user_id: user.id,
    title: parsed.data.title,
    description: parsed.data.description,
    link_url: parsed.data.link_url,
  });
  if (error) {
    return { ok: false, error: "Unable to add portfolio item." };
  }
  return { ok: true };
}

export async function deletePortfolioItem(id: string) {
  const user = await getServerUser();
  if (!user) {
    return { ok: false, error: "Sign in to delete portfolio items." };
  }
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("portfolio_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    return { ok: false, error: "Unable to delete item." };
  }
  return { ok: true };
}

export async function uploadAsset(formData: FormData) {
  const user = await getServerUser();
  if (!user) {
    return { ok: false, error: "Sign in to upload files." };
  }

  const file = formData.get("file");
  const type = formData.get("type");

  if (!(file instanceof File) || typeof type !== "string") {
    return { ok: false, error: "Upload a valid file." };
  }

  const bucket = type === "avatar" ? "avatars" : "cvs";
  const filePath = `${user.id}/${crypto.randomUUID()}-${file.name}`;
  const supabase = await supabaseServer();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    return { ok: false, error: "Storage upload failed." };
  }

  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(filePath);

  if (type === "avatar") {
    await supabase.from("profiles").update({ avatar_url: publicUrl.publicUrl }).eq("id", user.id);
  } else {
    await supabase.from("profiles").update({ cv_url: publicUrl.publicUrl }).eq("id", user.id);
  }

  return { ok: true, url: publicUrl.publicUrl };
}
