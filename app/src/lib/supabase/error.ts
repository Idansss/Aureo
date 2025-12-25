import type { PostgrestError } from "@supabase/supabase-js";

export function formatSupabaseError(err: unknown): { message: string; code?: string } {
  const anyErr = err as Partial<PostgrestError> & { message?: unknown; code?: unknown };
  const message = typeof anyErr?.message === "string" ? anyErr.message : "Request failed.";
  const code = typeof anyErr?.code === "string" ? anyErr.code : undefined;
  return { message, code };
}

export function isSchemaMissingError(err: unknown) {
  const { code, message } = formatSupabaseError(err);
  return code === "PGRST205" || message.toLowerCase().includes("schema cache");
}



