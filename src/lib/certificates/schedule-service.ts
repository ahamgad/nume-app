import type { SupabaseClient } from "@supabase/supabase-js";

import {
  mapCertificateSchedule,
  type DbCertificateSchedule,
} from "@/lib/certificates/mappers";
import {
  certificateInputFromCertificate,
  generateValidatedScheduleEntries,
  mergeScheduleRegeneration,
} from "@/lib/certificates/schedule-generator";
import { deriveNextInterestDate } from "@/lib/certificates/schedule-generator";
import { ScheduleValidationError } from "@/lib/certificates/schedule-validation";
import type { Certificate, CertificateScheduleEntry } from "@/lib/certificates/types";
import { getSupabaseErrorMessage } from "@/lib/supabase/errors";

export async function fetchCertificateSchedules(
  supabase: SupabaseClient,
  userId: string,
  certificateId?: string,
): Promise<CertificateScheduleEntry[]> {
  let query = supabase
    .from("certificate_interest_schedules")
    .select("*")
    .eq("user_id", userId)
    .order("due_date", { ascending: true });

  if (certificateId) {
    query = query.eq("certificate_id", certificateId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data as DbCertificateSchedule[]).map(mapCertificateSchedule);
}

export async function fetchAllCertificateSchedules(
  supabase: SupabaseClient,
  userId: string,
): Promise<CertificateScheduleEntry[]> {
  return fetchCertificateSchedules(supabase, userId);
}

export async function generateAndPersistSchedule(
  supabase: SupabaseClient,
  userId: string,
  certificate: Certificate,
  existingSchedules?: CertificateScheduleEntry[],
): Promise<CertificateScheduleEntry[]> {
  const existing =
    existingSchedules ??
    (await fetchCertificateSchedules(supabase, userId, certificate.id));

  const input = certificateInputFromCertificate(certificate);
  let regenerated;
  try {
    regenerated = generateValidatedScheduleEntries(input);
  } catch (error) {
    if (error instanceof ScheduleValidationError) {
      console.error(
        "generateAndPersistSchedule: invalid schedule",
        certificate.id,
        error.message,
      );
      throw error;
    }
    throw error;
  }
  const pendingEntries = mergeScheduleRegeneration(existing, regenerated);

  const lockedIds = existing
    .filter((entry) => entry.status !== "pending")
    .map((entry) => entry.id);

  if (existing.some((entry) => entry.status === "pending")) {
    const { error: deleteError } = await supabase
      .from("certificate_interest_schedules")
      .delete()
      .eq("certificate_id", certificate.id)
      .eq("user_id", userId)
      .eq("status", "pending");

    if (deleteError) throw deleteError;
  }

  if (pendingEntries.length > 0) {
    const { error: insertError } = await supabase
      .from("certificate_interest_schedules")
      .insert(
        pendingEntries.map((entry) => ({
          user_id: userId,
          certificate_id: certificate.id,
          due_date: entry.dueDate,
          interest_amount: entry.interestAmount,
          status: "pending",
        })),
      );

    if (insertError) throw insertError;
  }

  const allSchedules = await fetchCertificateSchedules(
    supabase,
    userId,
    certificate.id,
  );

  const nextInterestDate = deriveNextInterestDate(allSchedules, new Date().toISOString().slice(0, 10));

  const { error: updateError } = await supabase
    .from("certificates")
    .update({ next_interest_date: nextInterestDate })
    .eq("id", certificate.id)
    .eq("user_id", userId);

  if (updateError) throw updateError;

  void lockedIds;
  return allSchedules;
}

export async function claimScheduleEntryForProcessing(
  supabase: SupabaseClient,
  userId: string,
  scheduleEntryId: string,
): Promise<CertificateScheduleEntry | null> {
  const { data, error } = await supabase
    .from("certificate_interest_schedules")
    .update({
      status: "processed",
      processed_at: new Date().toISOString(),
    })
    .eq("id", scheduleEntryId)
    .eq("user_id", userId)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();

  if (error) throw new Error(getSupabaseErrorMessage(error));
  if (!data) return null;

  return mapCertificateSchedule(data as DbCertificateSchedule);
}

export async function finalizeScheduleEntryProcessing(
  supabase: SupabaseClient,
  userId: string,
  scheduleEntryId: string,
  patch: {
    interestRecordId: string;
    transferFailed?: boolean;
    transferRecordId?: string | null;
  },
): Promise<void> {
  const { error } = await supabase
    .from("certificate_interest_schedules")
    .update({
      interest_record_id: patch.interestRecordId,
      transfer_failed: patch.transferFailed ?? false,
      transfer_record_id: patch.transferRecordId ?? null,
    })
    .eq("id", scheduleEntryId)
    .eq("user_id", userId)
    .eq("status", "processed");

  if (error) throw new Error(getSupabaseErrorMessage(error));
}

export async function revertScheduleEntryToPending(
  supabase: SupabaseClient,
  userId: string,
  scheduleEntryId: string,
): Promise<void> {
  const { error } = await supabase
    .from("certificate_interest_schedules")
    .update({
      status: "pending",
      processed_at: null,
      interest_record_id: null,
      transfer_failed: false,
      transfer_record_id: null,
    })
    .eq("id", scheduleEntryId)
    .eq("user_id", userId)
    .eq("status", "processed")
    .is("interest_record_id", null);

  if (error) throw new Error(getSupabaseErrorMessage(error));
}

/** @deprecated Prefer claimScheduleEntryForProcessing + finalizeScheduleEntryProcessing */
export async function markScheduleEntryProcessed(
  supabase: SupabaseClient,
  userId: string,
  scheduleEntryId: string,
  patch: {
    interestRecordId: string;
    transferFailed?: boolean;
    transferRecordId?: string | null;
    processedAt?: string;
  },
): Promise<boolean> {
  const claimed = await claimScheduleEntryForProcessing(
    supabase,
    userId,
    scheduleEntryId,
  );
  if (!claimed) return false;

  await finalizeScheduleEntryProcessing(supabase, userId, scheduleEntryId, {
    interestRecordId: patch.interestRecordId,
    transferFailed: patch.transferFailed,
    transferRecordId: patch.transferRecordId,
  });

  return true;
}


export async function updateCertificateProcessingMetadata(
  supabase: SupabaseClient,
  userId: string,
  certificateId: string,
  patch: {
    nextInterestDate?: string | null;
    lastInterestProcessedAt?: string | null;
    status?: Certificate["status"];
    renewalProcessedAt?: string | null;
  },
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (patch.nextInterestDate !== undefined) {
    payload.next_interest_date = patch.nextInterestDate;
  }
  if (patch.lastInterestProcessedAt !== undefined) {
    payload.last_interest_processed_at = patch.lastInterestProcessedAt;
  }
  if (patch.status !== undefined) payload.status = patch.status;
  if (patch.renewalProcessedAt !== undefined) {
    payload.renewal_processed_at = patch.renewalProcessedAt;
  }

  const { error } = await supabase
    .from("certificates")
    .update(payload)
    .eq("id", certificateId)
    .eq("user_id", userId);

  if (error) throw new Error(getSupabaseErrorMessage(error));
}

export async function ensureCertificateSchedule(
  supabase: SupabaseClient,
  userId: string,
  certificate: Certificate,
): Promise<CertificateScheduleEntry[]> {
  const existing = await fetchCertificateSchedules(supabase, userId, certificate.id);
  if (existing.length > 0) return existing;
  return generateAndPersistSchedule(supabase, userId, certificate);
}
