type Role = "seeker" | "employer" | "admin" | string;

const SAFE_NEXT_PREFIXES = ["/app", "/employer", "/jobs", "/onboarding", "/u/"] as const;

export function resolveSafeNext(next: string | null | undefined): string | null {
  if (!next) return null;
  const candidate = (() => {
    try {
      return next.includes("%") ? decodeURIComponent(next) : next;
    } catch {
      return next;
    }
  })().trim();

  if (!candidate.startsWith("/")) return null;
  if (candidate.startsWith("//")) return null;
  if (candidate.startsWith("/auth")) return null;
  if (candidate.startsWith("/api")) return null;
  if (candidate.startsWith("/_next")) return null;
  if (candidate.includes("://")) return null;
  if (candidate.includes("\\")) return null;
  if (candidate.includes("\n") || candidate.includes("\r") || candidate.includes("\0")) return null;

  const allowed = SAFE_NEXT_PREFIXES.some((prefix) => candidate.startsWith(prefix));
  return allowed ? candidate : null;
}

export function defaultRouteForRole(role: Role | null | undefined): string {
  if (role === "employer") return "/employer";
  if (role === "seeker") return "/app";
  return "/onboarding";
}

function isNextCompatibleWithRole(next: string, role: Role | null | undefined) {
  if (next.startsWith("/employer") && role !== "employer") return false;
  if (next.startsWith("/app") && role === "employer") return false;
  return true;
}

export function resolvePostAuthRedirect(options: {
  role: Role | null | undefined;
  next: string | null | undefined;
}): string {
  const safeNext = resolveSafeNext(options.next);
  const defaultRoute = defaultRouteForRole(options.role);
  if (!safeNext) return defaultRoute;
  return isNextCompatibleWithRole(safeNext, options.role) ? safeNext : defaultRoute;
}

