import type {
  Certificate,
  CertificateStatus,
  PayoutFrequency,
} from "@/lib/certificates/types";

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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
