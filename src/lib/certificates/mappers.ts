import type {
  Certificate,
  CertificateScheduleEntry,
  CertificateScheduleStatus,
  CertificateStatus,
  PayoutFrequency,
  RenewalType,
} from "@/lib/certificates/types";

export interface DbCertificateSchedule {
  id: string;
  user_id: string;
  certificate_id: string;
  due_date: string;
  interest_amount: number;
  status: CertificateScheduleStatus;
  processed_at: string | null;
  interest_record_id: string | null;
  transfer_failed: boolean;
  transfer_record_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbCertificate {
  id: string;
  user_id: string;
  account_id: string;
  principal_amount: number;
  annual_interest_rate: number;
  purchase_date: string;
  term_months: number;
  maturity_date: string;
  payout_frequency: PayoutFrequency;
  destination_account_id: string | null;
  auto_apply: boolean;
  status: CertificateStatus;
  next_interest_date: string | null;
  last_interest_processed_at: string | null;
  renewal_type: RenewalType;
  renewed_from_certificate_id: string | null;
  renewed_certificate_id: string | null;
  source_certificate_id: string | null;
  renewal_processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function mapCertificate(row: DbCertificate): Certificate {
  return {
    id: row.id,
    userId: row.user_id,
    accountId: row.account_id,
    principalAmount: Number(row.principal_amount),
    annualInterestRate: Number(row.annual_interest_rate),
    purchaseDate: row.purchase_date,
    termMonths: row.term_months,
    maturityDate: row.maturity_date,
    payoutFrequency: row.payout_frequency,
    destinationAccountId: row.destination_account_id,
    autoApply: row.auto_apply,
    status: row.status,
    nextInterestDate: row.next_interest_date,
    lastInterestProcessedAt: row.last_interest_processed_at,
    renewalType: row.renewal_type ?? "none",
    renewedFromCertificateId: row.renewed_from_certificate_id,
    renewedCertificateId: row.renewed_certificate_id ?? null,
    sourceCertificateId: row.source_certificate_id ?? null,
    renewalProcessedAt: row.renewal_processed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCertificateSchedule(
  row: DbCertificateSchedule,
): CertificateScheduleEntry {
  return {
    id: row.id,
    certificateId: row.certificate_id,
    userId: row.user_id,
    dueDate: row.due_date,
    interestAmount: Number(row.interest_amount),
    status: row.status,
    processedAt: row.processed_at,
    interestRecordId: row.interest_record_id,
    transferFailed: row.transfer_failed,
    transferRecordId: row.transfer_record_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
