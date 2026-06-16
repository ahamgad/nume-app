import type { SupabaseClient } from "@supabase/supabase-js";

import { calculateMaturityDate } from "@/lib/certificates/certificate-engine";
import { INTEREST_RECORD_DESCRIPTION } from "@/lib/certificates/interest-calculator";
import { mapCertificate, type DbCertificate } from "@/lib/certificates/mappers";
import {
  computeRenewalPrincipal,
  evaluateMaturity,
} from "@/lib/certificates/recurring/maturity";
import {
  buildProcessResult,
  planInterestProcessing,
  type ProcessedEntrySnapshot,
} from "@/lib/certificates/recurring/processor-logic";
import type { ProcessCertificateInterestResult } from "@/lib/certificates/recurring/types";
import { deriveNextInterestDate } from "@/lib/certificates/schedule-generator";
import {
  fetchCertificateSchedules,
  generateAndPersistSchedule,
  claimScheduleEntryForProcessing,
  finalizeScheduleEntryProcessing,
  revertScheduleEntryToPending,
  updateCertificateProcessingMetadata,
  ensureCertificateSchedule,
} from "@/lib/certificates/schedule-service";
import { getCertificate } from "@/lib/certificates/service";
import type { Certificate, CertificateScheduleEntry, CertificateStatus } from "@/lib/certificates/types";
import { canReceiveTransfers } from "@/lib/finance/account-capabilities";
import { fetchAccounts, insertInterestRecord } from "@/lib/finance/service";
import type { Account } from "@/lib/finance/types";
import { todayIsoDate } from "@/lib/format/date";

const processingLocks = new Set<string>();

function alreadyProcessedSnapshot(
  entry: CertificateScheduleEntry,
): ProcessedEntrySnapshot {
  return {
    scheduleEntryId: entry.id,
    interestAmount: entry.interestAmount,
    transferAttempted: false,
    transferSucceeded: false,
    transferFailed: entry.transferFailed,
  };
}

async function loadDestinationAccount(
  supabase: SupabaseClient,
  userId: string,
  destinationAccountId: string | null,
): Promise<Account | null> {
  if (!destinationAccountId) return null;
  const accounts = await fetchAccounts(supabase, userId);
  return accounts.find((account) => account.id === destinationAccountId) ?? null;
}

async function processScheduleEntry(
  supabase: SupabaseClient,
  userId: string,
  certificate: Certificate,
  entry: CertificateScheduleEntry,
  destinationAccount: Account | null,
): Promise<ProcessedEntrySnapshot | null> {
  if (entry.status !== "pending") {
    return alreadyProcessedSnapshot(entry);
  }

  const claimed = await claimScheduleEntryForProcessing(
    supabase,
    userId,
    entry.id,
  );
  if (!claimed) {
    return null;
  }

  const shouldAutoTransfer =
    certificate.autoApply && Boolean(certificate.destinationAccountId);
  const canTransfer =
    shouldAutoTransfer &&
    destinationAccount !== null &&
    canReceiveTransfers(destinationAccount);

  let transferAttempted = false;
  let transferSucceeded = false;
  let transferFailed = false;

  try {
    if (shouldAutoTransfer && canTransfer && destinationAccount) {
      transferAttempted = true;
      try {
        const { record } = await insertInterestRecord(supabase, userId, {
          accountId: destinationAccount.id,
          amount: entry.interestAmount,
          date: entry.dueDate,
          description: INTEREST_RECORD_DESCRIPTION,
          certificateId: certificate.id,
          scheduleEntryId: entry.id,
          updateBalance: true,
          currentBalance: destinationAccount.currentBalance,
        });

        await finalizeScheduleEntryProcessing(supabase, userId, entry.id, {
          interestRecordId: record.id,
          transferFailed: false,
        });

        transferSucceeded = true;
        return {
          scheduleEntryId: entry.id,
          interestAmount: entry.interestAmount,
          transferAttempted,
          transferSucceeded,
          transferFailed,
        };
      } catch {
        transferFailed = true;
      }
    }

    const { record } = await insertInterestRecord(supabase, userId, {
      accountId: certificate.accountId,
      amount: entry.interestAmount,
      date: entry.dueDate,
      description: INTEREST_RECORD_DESCRIPTION,
      certificateId: certificate.id,
      scheduleEntryId: entry.id,
      updateBalance: false,
    });

    await finalizeScheduleEntryProcessing(supabase, userId, entry.id, {
      interestRecordId: record.id,
      transferFailed: transferFailed,
    });

    return {
      scheduleEntryId: entry.id,
      interestAmount: entry.interestAmount,
      transferAttempted,
      transferSucceeded,
      transferFailed,
    };
  } catch (error) {
    await revertScheduleEntryToPending(supabase, userId, entry.id);
    throw error;
  }
}

async function executeRenewal(
  supabase: SupabaseClient,
  userId: string,
  certificate: Certificate,
  schedules: CertificateScheduleEntry[],
  accountName: string,
  institution: string | null,
): Promise<Certificate | null> {
  const evaluation = evaluateMaturity(certificate, schedules);
  if (!evaluation.shouldRenew) return null;
  if (certificate.renewalProcessedAt || certificate.renewedCertificateId) {
    return null;
  }

  const newPrincipal = computeRenewalPrincipal(
    certificate,
    evaluation.totalEarnedInterest,
  );

  const { data: accountRow, error: accountError } = await supabase
    .from("accounts")
    .insert({
      user_id: userId,
      account_type: "certificate",
      name: accountName,
      institution,
      current_balance: newPrincipal,
      include_in_net_worth: true,
      include_in_emergency_fund: false,
      status: "active",
    })
    .select("id")
    .single();

  if (accountError) throw accountError;

  const purchaseDate = certificate.maturityDate;
  const maturityDate = calculateMaturityDate(purchaseDate, certificate.termMonths);

  const { data: certificateRow, error: certificateError } = await supabase
    .from("certificates")
    .insert({
      user_id: userId,
      account_id: accountRow.id,
      principal_amount: newPrincipal,
      annual_interest_rate: certificate.annualInterestRate,
      purchase_date: purchaseDate,
      term_months: certificate.termMonths,
      maturity_date: maturityDate,
      payout_frequency: certificate.payoutFrequency,
      destination_account_id: certificate.destinationAccountId,
      auto_apply: certificate.autoApply,
      renewal_type: certificate.renewalType,
      renewed_from_certificate_id: certificate.id,
      source_certificate_id: certificate.id,
      status: "active",
    })
    .select("*")
    .single();

  if (certificateError) {
    await supabase.from("accounts").delete().eq("id", accountRow.id);
    throw certificateError;
  }

  const newCertificate = mapCertificate(certificateRow as DbCertificate);

  await supabase
    .from("certificates")
    .update({
      status: "renewed",
      renewal_processed_at: new Date().toISOString(),
      renewed_certificate_id: newCertificate.id,
    })
    .eq("id", certificate.id)
    .eq("user_id", userId);

  await supabase
    .from("accounts")
    .update({ status: "archived", include_in_net_worth: false })
    .eq("id", certificate.accountId)
    .eq("user_id", userId);

  await generateAndPersistSchedule(supabase, userId, newCertificate);

  return newCertificate;
}

export async function processCertificateInterest(
  supabase: SupabaseClient,
  userId: string,
  certificateId: string,
  options?: { asOfDate?: string; accountName?: string; institution?: string | null },
): Promise<ProcessCertificateInterestResult> {
  if (processingLocks.has(certificateId)) {
    const existing = await getCertificate(supabase, userId, certificateId);
    return buildProcessResult(
      certificateId,
      [],
      existing?.status ?? "active",
      existing?.status ?? "active",
    );
  }

  processingLocks.add(certificateId);

  try {
    return await processCertificateInterestLocked(
      supabase,
      userId,
      certificateId,
      options,
    );
  } finally {
    processingLocks.delete(certificateId);
  }
}

async function processCertificateInterestLocked(
  supabase: SupabaseClient,
  userId: string,
  certificateId: string,
  options?: { asOfDate?: string; accountName?: string; institution?: string | null },
): Promise<ProcessCertificateInterestResult> {
  const asOfDate = options?.asOfDate ?? todayIsoDate();

  const certificate = await getCertificate(supabase, userId, certificateId);
  if (!certificate) {
    throw new Error("Certificate not found");
  }

  if (certificate.status !== "active") {
    return buildProcessResult(certificateId, [], certificate.status, certificate.status);
  }

  let schedules = await fetchCertificateSchedules(supabase, userId, certificateId);
  if (schedules.length === 0) {
    schedules = await generateAndPersistSchedule(supabase, userId, certificate);
  }

  const dueEntries = planInterestProcessing(certificate, schedules, asOfDate);
  const destinationAccount = await loadDestinationAccount(
    supabase,
    userId,
    certificate.destinationAccountId,
  );

  const processedSnapshots: ProcessedEntrySnapshot[] = [];

  for (const entry of dueEntries) {
    if (entry.status !== "pending") continue;
    const freshSchedules = await fetchCertificateSchedules(
      supabase,
      userId,
      certificateId,
    );
    const freshEntry = freshSchedules.find((item) => item.id === entry.id);
    if (!freshEntry || freshEntry.status !== "pending") continue;

    const snapshot = await processScheduleEntry(
      supabase,
      userId,
      certificate,
      freshEntry,
      destinationAccount,
    );
    if (snapshot) {
      processedSnapshots.push(snapshot);
    }
  }

  schedules = await fetchCertificateSchedules(supabase, userId, certificateId);
  const nextInterestDate = deriveNextInterestDate(schedules, asOfDate);
  const lastProcessedAt =
    processedSnapshots.length > 0 ? new Date().toISOString() : certificate.lastInterestProcessedAt;

  await updateCertificateProcessingMetadata(supabase, userId, certificateId, {
    nextInterestDate,
    lastInterestProcessedAt: lastProcessedAt,
  });

  const evaluation = evaluateMaturity(certificate, schedules, asOfDate);
  let nextStatus: CertificateStatus = certificate.status;

  if (evaluation.shouldMature) {
    if (evaluation.shouldClose) {
      nextStatus = "closed";
      await updateCertificateProcessingMetadata(supabase, userId, certificateId, {
        status: "closed",
        nextInterestDate: null,
      });
      await supabase
        .from("accounts")
        .update({ status: "archived", include_in_net_worth: false })
        .eq("id", certificate.accountId)
        .eq("user_id", userId);
    } else if (evaluation.shouldRenew) {
      const accountRow = await supabase
        .from("accounts")
        .select("name, institution")
        .eq("id", certificate.accountId)
        .eq("user_id", userId)
        .maybeSingle();

      await executeRenewal(
        supabase,
        userId,
        certificate,
        schedules,
        options?.accountName ?? accountRow.data?.name ?? "Certificate",
        options?.institution ?? accountRow.data?.institution ?? null,
      );
      nextStatus = "renewed";
    } else {
      nextStatus = "matured";
      await updateCertificateProcessingMetadata(supabase, userId, certificateId, {
        status: "matured",
        nextInterestDate: null,
      });
    }
  }

  return buildProcessResult(
    certificateId,
    processedSnapshots,
    nextStatus,
    certificate.status,
  );
}

export async function processAllDueCertificateInterest(
  supabase: SupabaseClient,
  userId: string,
  certificateIds: string[],
): Promise<ProcessCertificateInterestResult[]> {
  const results: ProcessCertificateInterestResult[] = [];
  for (const certificateId of certificateIds) {
    try {
      const result = await processCertificateInterest(supabase, userId, certificateId);
      results.push(result);
    } catch (error) {
      console.error("processCertificateInterest failed", certificateId, error);
    }
  }
  return results;
}