import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { RegisterForm } from "./view";
import { resolvePostAuthRedirect, resolveSafeNext } from "@/lib/safe-redirect";
import { AlreadySignedInBanner } from "../already-signed-in-banner";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; force?: string }>;
}) {
  const params = await searchParams;
  const force = params.force === "1";
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (data.user && !force) {
    redirect("/app");
  }

  const next = resolveSafeNext(params.next);
  const role = (data.user?.user_metadata?.role as string | undefined) ?? null;
  const continueHref = resolvePostAuthRedirect({ role, next });

  const showForm = !data.user || force;

  return (
    <div className="w-full">
      {data.user ? (
        <AlreadySignedInBanner
          email={data.user.email ?? null}
          role={role}
          continueHref={continueHref}
        />
      ) : null}
      {showForm ? <RegisterForm next={params.next} /> : null}
      {!showForm ? (
        <div className="mt-3 text-sm text-muted-foreground">
          Want to create a different account?{" "}
          <a className="font-semibold text-primary" href="/auth/register?force=1">
            Switch account
          </a>
          .
        </div>
      ) : null}
    </div>
  );
}
