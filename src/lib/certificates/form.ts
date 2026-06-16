import type { PayoutFrequency, RenewalType } from "@/lib/certificates/types";
import { isFutureDate, todayIsoDate } from "@/lib/format/date";
import type { TranslationKey } from "@/lib/i18n";
import { parseAmount } from "@/lib/format/currency";

/** Preset certificate terms in whole years (stored as months in DB). */
export const CERTIFICATE_TERM_YEAR_PRESETS = [1, 2, 3, 4, 5] as const;

export type CertificateTermPreset =
  | (typeof CERTIFICATE_TERM_YEAR_PRESETS)[number]
  | "custom";

export interface CertificateFormValues {
  name: string;
  institution: string;
  principalAmount: string;
  annualInterestRate: string;
  purchaseDate: string;
  termPreset: CertificateTermPreset;
  customTermYears: string;
  payoutFrequency: PayoutFrequency;
  destinationAccountId: string | null;
  autoApplyInterest: boolean;
  renewalType: RenewalType;
}

export const DEFAULT_CERTIFICATE_FORM_VALUES: CertificateFormValues = {
  name: "",
  institution: "",
  principalAmount: "",
  annualInterestRate: "",
  purchaseDate: todayIsoDate(),
  termPreset: 1,
  customTermYears: "",
  payoutFrequency: "monthly",
  destinationAccountId: null,
  autoApplyInterest: false,
  renewalType: "none",
};

export function yearsToTermMonths(years: number): number {
  return Math.round(years * 12);
}

export function termMonthsToYears(termMonths: number): number {
  return termMonths / 12;
}

export function resolveTermMonths(values: CertificateFormValues): number | null {
  if (values.termPreset === "custom") {
    const years = parseAmount(values.customTermYears);
    if (years === null || !Number.isFinite(years)) return null;
    return yearsToTermMonths(years);
  }
  return yearsToTermMonths(values.termPreset);
}

export function validateCertificateForm(
  values: CertificateFormValues,
  t: (key: TranslationKey) => string,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.name.trim()) {
    errors.name = t("certificates.validation.nameRequired");
  }

  const principal = parseAmount(values.principalAmount);
  if (principal === null) {
    errors.principalAmount = t("certificates.validation.principalRequired");
  } else if (principal <= 0) {
    errors.principalAmount = t("certificates.validation.principalPositive");
  }

  const rate = parseAmount(values.annualInterestRate);
  if (rate === null) {
    errors.annualInterestRate = t("certificates.validation.rateRequired");
  } else if (rate < 0) {
    errors.annualInterestRate = t("certificates.validation.rateNegative");
  } else if (rate > 9999) {
    errors.annualInterestRate = t("certificates.validation.rateMax");
  }

  if (!values.purchaseDate) {
    errors.purchaseDate = t("certificates.validation.purchaseDateRequired");
  } else if (isFutureDate(values.purchaseDate)) {
    errors.purchaseDate = t("certificates.validation.purchaseDateFuture");
  }

  const termMonths = resolveTermMonths(values);
  if (termMonths === null || !Number.isInteger(termMonths)) {
    errors.term = t("certificates.validation.termRequired");
  } else if (termMonths < 1) {
    errors.term = t("certificates.validation.termMin");
  } else if (termMonths > 600) {
    errors.term = t("certificates.validation.termMax");
  }

  if (values.termPreset === "custom") {
    const years = parseAmount(values.customTermYears);
    if (years === null || !Number.isFinite(years) || years <= 0) {
      errors.term = t("certificates.validation.termYearsMin");
    } else if (years > 50) {
      errors.term = t("certificates.validation.termYearsMax");
    }
  }

  if (values.autoApplyInterest && !values.destinationAccountId) {
    errors.destinationAccountId = t(
      "certificates.validation.interestDestinationRequired",
    );
  }

  return errors;
}

export function certificateFormValuesFromCertificate(
  certificate: {
    principalAmount: number;
    annualInterestRate: number;
    purchaseDate: string;
    termMonths: number;
    payoutFrequency: PayoutFrequency;
    destinationAccountId: string | null;
    autoApply: boolean;
    renewalType: RenewalType;
  },
  account: { name: string; institution: string | null },
): CertificateFormValues {
  const years = termMonthsToYears(certificate.termMonths);
  const presetYear = CERTIFICATE_TERM_YEAR_PRESETS.find(
    (value) => yearsToTermMonths(value) === certificate.termMonths,
  );
  const termPreset: CertificateTermPreset = presetYear ?? "custom";

  return {
    name: account.name,
    institution: account.institution ?? "",
    principalAmount: String(certificate.principalAmount),
    annualInterestRate: String(certificate.annualInterestRate),
    purchaseDate: certificate.purchaseDate,
    termPreset,
    customTermYears:
      termPreset === "custom"
        ? String(Number.isInteger(years) ? years : Number(years.toFixed(2)))
        : "",
    payoutFrequency: certificate.payoutFrequency,
    destinationAccountId: certificate.destinationAccountId,
    autoApplyInterest: certificate.autoApply,
    renewalType: certificate.renewalType ?? "none",
  };
}

export function isCertificateFormDirty(
  values: CertificateFormValues,
  initial: CertificateFormValues,
): boolean {
  return (
    values.name.trim() !== initial.name.trim() ||
    values.institution.trim() !== initial.institution.trim() ||
    values.principalAmount !== initial.principalAmount ||
    values.annualInterestRate !== initial.annualInterestRate ||
    values.purchaseDate !== initial.purchaseDate ||
    values.termPreset !== initial.termPreset ||
    values.customTermYears !== initial.customTermYears ||
    values.payoutFrequency !== initial.payoutFrequency ||
    values.destinationAccountId !== initial.destinationAccountId ||
    values.autoApplyInterest !== initial.autoApplyInterest ||
    values.renewalType !== initial.renewalType
  );
}
