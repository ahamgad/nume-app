import type { SupabaseClient } from "@supabase/supabase-js";

import { mapCertificateSchedule, type DbCertificateSchedule } from "@/lib/certificates/mappers";
import type { CertificateScheduleEntry } from "@/lib/certificates/types";
import { logSupabaseError } from "@/lib/supabase/errors";

export function isMissingSchedulesTableError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const record = error as Record<string, unknown>;
  if (record.code === "PGRST205") return true;
  if (typeof record.message === "string") {
    return record.message.includes("certificate_interest_schedules");
  }
  return false;
}

export async function getCertificateSchedulesSafe(
  supabase: SupabaseClient,
  userId: string,
): Promise<CertificateScheduleEntry[]> {
  const { data, error } = await supabase
    .from("certificate_interest_schedules")
    .select("*")
    .eq("user_id", userId)
    .order("due_date", { ascending: true });

  if (error) {
    if (isMissingSchedulesTableError(error)) {
      logSupabaseError("getCertificateSchedules:migration-pending", error);
      return [];
    }
    throw error;
  }

  return (data as DbCertificateSchedule[]).map(mapCertificateSchedule);
}
