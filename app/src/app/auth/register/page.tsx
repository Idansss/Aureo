import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { RegisterForm } from "./view";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    redirect("/app");
  }
  return <RegisterForm next={params.next} />;
}
