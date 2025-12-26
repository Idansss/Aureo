import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { resolvePostAuthRedirect, resolveSafeNext } from "./src/lib/safe-redirect";

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Require Supabase configuration
  if (!supabaseUrl || !supabaseKey) {
    if (process.env.NODE_ENV === "development") {
      const errorHtml = `
        <!DOCTYPE html>
        <html>
          <head><title>Configuration Error</title></head>
          <body style="font-family: sans-serif; padding: 40px; max-width: 600px; margin: 0 auto;">
            <h1>Supabase Configuration Required</h1>
            <p>Please set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your <code>.env.local</code> file.</p>
            <p>Restart the dev server after updating environment variables.</p>
          </body>
        </html>
      `;
      return new NextResponse(errorHtml, {
        status: 500,
        headers: { "Content-Type": "text/html" },
      });
    }
    // In production, fail silently to avoid exposing configuration
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

  const isSeekerArea = pathname.startsWith("/app");
  const isEmployerArea = pathname.startsWith("/employer") || pathname.startsWith("/dashboard/employer");
  const isAdminArea = pathname.startsWith("/admin");

  // Protected areas require authentication
  const requiresAuth = isSeekerArea || isEmployerArea || isAdminArea;

  if (requiresAuth && !user) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", `${req.nextUrl.pathname}${req.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  const resolveRole = async (): Promise<string | null> => {
    if (!user) return null;
    const fromMeta = (user.user_metadata?.role as string | undefined) ?? null;
    if (fromMeta) return fromMeta;
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      const role = (profile as any)?.role as string | undefined;
      return role ?? null;
    } catch {
      return null;
    }
  };

  if (user && (isSeekerArea || isEmployerArea || isAdminArea)) {
    const role = await resolveRole();
    const normalized = role?.toLowerCase() ?? null;

    if (isAdminArea && normalized !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (isEmployerArea && normalized !== "employer" && normalized !== "admin") {
      return NextResponse.redirect(new URL("/app", req.url));
    }

    if (isSeekerArea && normalized !== "seeker" && normalized !== "admin") {
      return NextResponse.redirect(new URL("/employer", req.url));
    }
  }

  // Redirect authenticated users away from auth routes
  const isAuthRoute = pathname.startsWith("/auth");
  const forceAuth = req.nextUrl.searchParams.get("force") === "1";
  if (isAuthRoute && user && !forceAuth) {
    const role = (user.user_metadata?.role as string | undefined) ?? null;
    const safeNext = resolveSafeNext(req.nextUrl.searchParams.get("next"));
    const destination = resolvePostAuthRedirect({ role, next: safeNext });
    return NextResponse.redirect(new URL(destination, req.url));
  }

  return res;
}
