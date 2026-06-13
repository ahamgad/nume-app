import type { SupabaseClient } from "@supabase/supabase-js";

import { mapCertificate, type DbCertificate } from "@/lib/certificates/mappers";
import type { Certificate } from "@/lib/certificates/types";
import { logSupabaseError } from "@/lib/supabase/errors";

/** PostgREST error when a table has not been migrated yet. */
export function isMissingCertificatesTableError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const record = error as Record<string, unknown>;
  if (record.code === "PGRST205") return true;
  if (typeof record.message === "string") {
    return record.message.includes("public.certificates");
  }
  return false;
}

/**
 * Loads certificates without failing core finance data when migration 004
 * has not been applied yet.
 */
export async function getCertificatesSafe(
  supabase: SupabaseClient,
  userId: string,
): Promise<Certificate[]> {
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingCertificatesTableError(error)) {
      logSupabaseError("getCertificates:migration-pending", error);
      return [];
    }
    throw error;
  }

  return (data as DbCertificate[]).map(mapCertificate);
}

export async function getCertificates(
  supabase: SupabaseClient,
  userId: string,
): Promise<Certificate[]> {
  return getCertificatesSafe(supabase, userId);
}
