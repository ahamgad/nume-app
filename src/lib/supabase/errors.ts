/** Extract a readable message from Supabase/PostgREST errors. */
export function getSupabaseErrorMessage(error: unknown): string {
  if (!error) return "Unknown error";

  if (typeof error === "object" && error !== null) {
    const record = error as Record<string, unknown>;
    if (typeof record.message === "string" && record.message.length > 0) {
      const parts = [record.message];
      if (typeof record.code === "string") parts.push(`(${record.code})`);
      if (typeof record.details === "string" && record.details.length > 0) {
        parts.push(`— ${record.details}`);
      }
      return parts.join(" ");
    }
  }

  if (error instanceof Error) return error.message;
  return String(error);
}

export function logSupabaseError(scope: string, error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.error(`[${scope}]`, error);
  }
}
