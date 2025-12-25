import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { resolvePostAuthRedirect, resolveSafeNext } from "@/lib/safe-redirect";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = url.searchParams.get("next");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(new URL("/auth/login", url.origin));
  }

  const res = NextResponse.redirect(new URL("/onboarding", url.origin));
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => {
        cookies.forEach((c) => res.cookies.set(c.name, c.value, c.options));
      },
    },
  });

  try {
    if (code) {
      await supabase.auth.exchangeCodeForSession(code);
    } else if (tokenHash && type) {
      const otpType = type as EmailOtpType;
      const allowed: EmailOtpType[] = [
        "signup",
        "recovery",
        "invite",
        "magiclink",
        "email_change",
      ];
      if (allowed.includes(otpType)) {
        await supabase.auth.verifyOtp({ token_hash: tokenHash, type: otpType });
      }
    }
  } catch {
    return NextResponse.redirect(new URL("/auth/login", url.origin));
  }

  const { data } = await supabase.auth.getUser();
  const role = data.user?.user_metadata?.role as string | undefined;

  const destination = resolvePostAuthRedirect({
    role,
    next: resolveSafeNext(next),
  });

  res.headers.set("location", new URL(destination, url.origin).toString());
  return res;
}
