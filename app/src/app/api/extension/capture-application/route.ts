import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";

const BodySchema = z.object({
  jobUrl: z.string().url().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;

  if (!user) {
    // In extension v1 we allow anonymous capture; later we can require auth.
    return NextResponse.json({ ok: true });
  }

  const { jobUrl, company, title } = parsed.data;

  // Best-effort insert of an external application shadow record
  await supabase.from("applications").insert({
    user_id: user.id,
    job_id: null,
    status: "applied",
    source: "extension",
    external_company: company,
    external_title: title,
    external_url: jobUrl,
  } satisfies Record<string, unknown>);

  return NextResponse.json({ ok: true });
}

