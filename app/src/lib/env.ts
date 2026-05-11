export const isSupabaseConfigured =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function getSupabaseUrlError(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "NEXT_PUBLIC_SUPABASE_URL must be a valid URL.";
  }

  if (parsed.protocol !== "https:" && parsed.hostname !== "localhost") {
    return "NEXT_PUBLIC_SUPABASE_URL must use https.";
  }

  if (parsed.hostname.endsWith(".supabase.co")) {
    const projectRef = parsed.hostname.replace(/\.supabase\.co$/, "");
    if (!/^[a-z0-9]{20}$/.test(projectRef)) {
      return "NEXT_PUBLIC_SUPABASE_URL has an invalid Supabase project ref. It should look like https://abcdefghijklmnopqrst.supabase.co.";
    }
  }

  return null;
}

export function getSupabasePublicEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      [
        "Supabase is not configured.",
        "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in app/.env.local (or your deployment env).",
      ].join(" "),
    );
  }

  const urlError = getSupabaseUrlError(url);
  if (urlError) {
    throw new Error(urlError);
  }

  return { url, anonKey };
}

export function getSupabaseAuthErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (message === "Failed to fetch" || message.includes("fetch")) {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const host = url ? new URL(url).hostname : "the configured Supabase host";
      return `Cannot reach Supabase at ${host}. Check NEXT_PUBLIC_SUPABASE_URL in the deployment environment.`;
    } catch {
      return "Cannot reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL in the deployment environment.";
    }
  }

  return message;
}
