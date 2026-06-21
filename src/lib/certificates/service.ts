import type { SupabaseClient } from "@supabase/supabase-js";

import { calculateMaturityDate } from "@/lib/certificates/certificate-engine";
import { generateAndPersistSchedule } from "@/lib/certificates/schedule-service";
import { mapCertificate, type DbCertificate } from "@/lib/certificates/mappers";
import { hasCertificateRowUpdates } from "@/lib/certificates/update-certificate-logic";
import {
  supportsRenewalTypeColumn,
  isMissingRenewalTypeColumnError,
} from "@/lib/certificates/schema-support";
import type {
  Certificate,
  CreateCertificateInput,
  UpdateCertificateInput,
} from "@/lib/certificates/types";
import { getCertificatesSafe } from "@/lib/certificates/load-certificates";
import { DEFAULT_BUSINESS_DAY_SETTINGS } from "@/lib/business-days/types";
import { assertDestinationAccount } from "@/lib/finance/interest-destination-accounts";
import { patchAccount } from "@/lib/finance/service";
import { getSupabaseErrorMessage } from "@/lib/supabase/errors";

export async function getCertificates(
  supabase: SupabaseClient,
  userId: string,
): Promise<Certificate[]> {
  return getCertificatesSafe(supabase, userId);
}

export async function getCertificateByAccountId(
  supabase: SupabaseClient,
  userId: string,
  accountId: string,
): Promise<Certificate | null> {
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("account_id", accountId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapCertificate(data as DbCertificate);
}

export async function getCertificate(
  supabase: SupabaseClient,
  userId: string,
  certificateId: string,
): Promise<Certificate | null> {
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("id", certificateId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapCertificate(data as DbCertificate);
}

export async function createCertificate(
  supabase: SupabaseClient,
  userId: string,
  input: CreateCertificateInput,
): Promise<Certificate> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(getSupabaseErrorMessage(authError));
  }

  if (!user || user.id !== userId) {
    throw new Error("Not authenticated — session unavailable for certificate insert");
  }

  await assertDestinationAccount(supabase, userId, input.destinationAccountId);

  const maturityDate = calculateMaturityDate(
    input.purchaseDate,
    input.termMonths,
  );

  const { data: accountRow, error: accountError } = await supabase
    .from("accounts")
    .insert({
      user_id: user.id,
      account_type: "certificate",
      name: input.name.trim(),
      institution: input.institution?.trim() || null,
      current_balance: input.principalAmount,
      include_in_net_worth: input.includeInNetWorth ?? true,
      include_in_emergency_fund: input.includeInEmergencyFund ?? false,
      status: "active",
    })
    .select("id")
    .single();

  if (accountError) {
    throw new Error(getSupabaseErrorMessage(accountError));
  }

  const renewalTypeSupported = await supportsRenewalTypeColumn(supabase);
  const certificateInsert: Record<string, unknown> = {
    user_id: user.id,
    account_id: accountRow.id,
    principal_amount: input.principalAmount,
    annual_interest_rate: input.annualInterestRate,
    purchase_date: input.purchaseDate,
    term_months: input.termMonths,
    maturity_date: maturityDate,
    payout_frequency: input.payoutFrequency,
    exclude_weekends:
      input.excludeWeekends ?? DEFAULT_BUSINESS_DAY_SETTINGS.excludeWeekends,
    exclude_egyptian_holidays:
      input.excludeEgyptianHolidays ??
      DEFAULT_BUSINESS_DAY_SETTINGS.excludeEgyptianHolidays,
    destination_account_id: input.destinationAccountId ?? null,
    auto_apply: input.autoApply ?? false,
    status: "active",
    certificate_number_last4: input.certificateNumberLast4 ?? null,
    payout_day: input.payoutDay ?? 1,
  };

  if (renewalTypeSupported) {
    certificateInsert.renewal_type = input.renewalType ?? "none";
  }

  const { data: certificateRow, error: certificateError } = await supabase
    .from("certificates")
    .insert(certificateInsert)
    .select("*")
    .single();

  if (certificateError && isMissingRenewalTypeColumnError(certificateError)) {
    delete certificateInsert.renewal_type;
    const retry = await supabase
      .from("certificates")
      .insert(certificateInsert)
      .select("*")
      .single();
    if (retry.error) {
      await supabase.from("accounts").delete().eq("id", accountRow.id).eq("user_id", userId);
      throw new Error(getSupabaseErrorMessage(retry.error));
    }
    const certificate = mapCertificate(retry.data as DbCertificate);
    await generateAndPersistSchedule(supabase, userId, certificate);
    const refreshed = await getCertificate(supabase, userId, certificate.id);
    return refreshed ?? certificate;
  }

  if (certificateError) {
    await supabase.from("accounts").delete().eq("id", accountRow.id).eq("user_id", userId);
    throw new Error(getSupabaseErrorMessage(certificateError));
  }

  const certificate = mapCertificate(certificateRow as DbCertificate);
  await generateAndPersistSchedule(supabase, userId, certificate);
  const refreshed = await getCertificate(supabase, userId, certificate.id);
  return refreshed ?? certificate;
}

export async function updateCertificate(
  supabase: SupabaseClient,
  userId: string,
  certificateId: string,
  input: UpdateCertificateInput,
): Promise<Certificate> {
  const existing = await getCertificate(supabase, userId, certificateId);
  if (!existing) {
    throw new Error("Certificate not found");
  }

  if (input.destinationAccountId !== undefined) {
    await assertDestinationAccount(supabase, userId, input.destinationAccountId);
  }

  const purchaseDate = input.purchaseDate ?? existing.purchaseDate;
  const termMonths = input.termMonths ?? existing.termMonths;
  const principalAmount = input.principalAmount ?? existing.principalAmount;

  const maturityDate =
    input.purchaseDate !== undefined || input.termMonths !== undefined
      ? calculateMaturityDate(purchaseDate, termMonths)
      : existing.maturityDate;

  const certificatePayload: Record<string, unknown> = {};

  if (input.autoApply !== undefined) {
    certificatePayload.auto_apply = input.autoApply;
  }
  if (input.renewalType !== undefined) {
    if (existing.status !== "active") {
      throw new Error("Renewal configuration cannot change on inactive certificates");
    }
    if (await supportsRenewalTypeColumn(supabase)) {
      certificatePayload.renewal_type = input.renewalType;
    }
  }

  if (input.principalAmount !== undefined) {
    certificatePayload.principal_amount = input.principalAmount;
  }
  if (input.annualInterestRate !== undefined) {
    certificatePayload.annual_interest_rate = input.annualInterestRate;
  }
  if (input.purchaseDate !== undefined) {
    certificatePayload.purchase_date = input.purchaseDate;
  }
  if (input.termMonths !== undefined) {
    certificatePayload.term_months = input.termMonths;
  }
  if (
    input.purchaseDate !== undefined ||
    input.termMonths !== undefined
  ) {
    certificatePayload.maturity_date = maturityDate;
  }
  if (input.payoutFrequency !== undefined) {
    certificatePayload.payout_frequency = input.payoutFrequency;
  }
  if (input.payoutDay !== undefined) {
    certificatePayload.payout_day = input.payoutDay;
  }
  if (input.excludeWeekends !== undefined) {
    certificatePayload.exclude_weekends = input.excludeWeekends;
  }
  if (input.excludeEgyptianHolidays !== undefined) {
    certificatePayload.exclude_egyptian_holidays = input.excludeEgyptianHolidays;
  }
  if (input.destinationAccountId !== undefined) {
    certificatePayload.destination_account_id = input.destinationAccountId;
  }
  if (input.status !== undefined) {
    certificatePayload.status = input.status;
  }
  if (input.certificateNumberLast4 !== undefined) {
    certificatePayload.certificate_number_last4 = input.certificateNumberLast4;
  }

  let updatedCertificate = existing;

  if (hasCertificateRowUpdates(input)) {
    const { data, error } = await supabase
      .from("certificates")
      .update(certificatePayload)
      .eq("id", certificateId)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      throw new Error(getSupabaseErrorMessage(error));
    }

    updatedCertificate = mapCertificate(data as DbCertificate);
  }

  const accountPatch: Parameters<typeof patchAccount>[3] = {};
  if (input.name !== undefined) accountPatch.name = input.name;
  if (input.institution !== undefined) accountPatch.institution = input.institution;
  if (input.includeInNetWorth !== undefined) {
    accountPatch.includeInNetWorth = input.includeInNetWorth;
  }
  if (input.includeInEmergencyFund !== undefined) {
    accountPatch.includeInEmergencyFund = input.includeInEmergencyFund;
  }
  if (input.principalAmount !== undefined) {
    accountPatch.currentBalance = principalAmount;
  }

  if (Object.keys(accountPatch).length > 0) {
    await patchAccount(supabase, userId, existing.accountId, accountPatch);
  }

  if (input.status === "archived") {
    await supabase
      .from("accounts")
      .update({ status: "archived" })
      .eq("id", existing.accountId)
      .eq("user_id", userId);
  }

  const updated = updatedCertificate;

  const scheduleFieldsChanged =
    input.principalAmount !== undefined ||
    input.annualInterestRate !== undefined ||
    input.purchaseDate !== undefined ||
    input.termMonths !== undefined ||
    input.payoutFrequency !== undefined ||
    input.excludeWeekends !== undefined ||
    input.excludeEgyptianHolidays !== undefined;

  if (scheduleFieldsChanged && updated.status === "active") {
    await generateAndPersistSchedule(supabase, userId, updated);
    const refreshed = await getCertificate(supabase, userId, certificateId);
    return refreshed ?? updated;
  }

  return updated;
}

export async function archiveCertificate(
  supabase: SupabaseClient,
  userId: string,
  certificateId: string,
): Promise<Certificate> {
  return updateCertificate(supabase, userId, certificateId, {
    status: "archived",
  });
}
