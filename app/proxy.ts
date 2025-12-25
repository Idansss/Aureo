import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { resolvePostAuthRedirect, resolveSafeNext } from "./src/lib/safe-redirect";

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase isn't configured, we can't enforce auth redirects here.
  if (!supabaseUrl || !supabaseKey) {
    return res;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (cookies) => {
        cookies.forEach((c) => res.cookies.set(c.name, c.value, c.options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  const pathname = req.nextUrl.pathname;

  const isAppArea =
    pathname.startsWith("/app") || pathname.startsWith("/employer");

  if (isAppArea && !user) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", `${req.nextUrl.pathname}${req.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  const isAuthRoute = pathname.startsWith("/auth");
  if (isAuthRoute && user) {
    const role = (user.user_metadata?.role as string | undefined) ?? null;
    const safeNext = resolveSafeNext(req.nextUrl.searchParams.get("next"));
    const destination = resolvePostAuthRedirect({ role, next: safeNext });
    return NextResponse.redirect(new URL(destination, req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
