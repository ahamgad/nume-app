export type PayoutFrequency =
  | "monthly"
  | "quarterly"
  | "semi_annual"
  | "annual"
  | "at_maturity";

export type CertificateStatus = "active" | "matured" | "archived";

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
  destinationAccountId?: string | null;
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
  destinationAccountId?: string | null;
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
  status: CertificateStatus;
}
