export type PayoutFrequency =
  | "daily"
  | "instantly"
  | "monthly"
  | "quarterly"
  | "semi_annual"
  | "annual"
  | "at_maturity";

export type CertificateStatus =
  | "active"
  | "matured"
  | "renewed"
  | "closed"
  | "archived";

export type RenewalType =
  | "none"
  | "renew_principal"
  | "renew_principal_and_interest";

export type CertificateScheduleStatus = "pending" | "processed" | "skipped";

export interface CertificateScheduleEntry {
  id: string;
  certificateId: string;
  userId: string;
  dueDate: string;
  interestAmount: number;
  status: CertificateScheduleStatus;
  processedAt: string | null;
  interestRecordId: string | null;
  transferFailed: boolean;
  transferRecordId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  id: string;
  userId: string;
  accountId: string;
  principalAmount: number;
  annualInterestRate: number;
  purchaseDate: string;
  termMonths: number;
  maturityDate: string;
  payoutFrequency: PayoutFrequency;
  destinationAccountId: string | null;
  autoApply: boolean;
  status: CertificateStatus;
  nextInterestDate: string | null;
  lastInterestProcessedAt: string | null;
  renewalType: RenewalType;
  renewedFromCertificateId: string | null;
  renewedCertificateId: string | null;
  sourceCertificateId: string | null;
  renewalProcessedAt: string | null;
  excludeWeekends: boolean;
  excludeEgyptianHolidays: boolean;
  certificateNumberLast4: string | null;
  payoutDay: number;
  createdAt: string;
  updatedAt: string;
}

export interface ComputedCertificateMetrics {
  maturityDate: string;
  expectedProfit: number;
  expectedTotalReturn: number;
  currentValue: number;
  nextPayoutDate: string | null;
  remainingDays: number;
}

export interface CreateCertificateInput {
  name: string;
  institution?: string | null;
  principalAmount: number;
  annualInterestRate: number;
  purchaseDate: string;
  termMonths: number;
  payoutFrequency: PayoutFrequency;
  excludeWeekends?: boolean;
  excludeEgyptianHolidays?: boolean;
  destinationAccountId?: string | null;
  autoApply?: boolean;
  renewalType?: RenewalType;
  certificateNumberLast4?: string | null;
  payoutDay?: number;
  includeInNetWorth?: boolean;
  includeInEmergencyFund?: boolean;
}

export interface UpdateCertificateInput {
  name?: string;
  institution?: string | null;
  principalAmount?: number;
  annualInterestRate?: number;
  purchaseDate?: string;
  termMonths?: number;
  payoutFrequency?: PayoutFrequency;
  excludeWeekends?: boolean;
  excludeEgyptianHolidays?: boolean;
  destinationAccountId?: string | null;
  autoApply?: boolean;
  renewalType?: RenewalType;
  certificateNumberLast4?: string | null;
  payoutDay?: number;
  status?: CertificateStatus;
  includeInNetWorth?: boolean;
  includeInEmergencyFund?: boolean;
}

/** Inputs required by pure certificate engine functions. */
export interface CertificateCalculationInput {
  principalAmount: number;
  annualInterestRate: number;
  purchaseDate: string;
  termMonths: number;
  maturityDate: string;
  payoutFrequency: PayoutFrequency;
  excludeWeekends: boolean;
  excludeEgyptianHolidays: boolean;
  status: CertificateStatus;
  observedHolidayDates?: ReadonlySet<string>;
}

export interface CertificateInsights {
  upcomingInterestAmount: number | null;
  nextInterestDate: string | null;
  upcomingInterestAutoRenewal: boolean;
  maturingSoon: Array<{
    certificateId: string;
    accountId: string;
    name: string;
    maturityDate: string;
    daysUntilMaturity: number;
    renewalType: RenewalType;
  }>;
}
