import type { PayoutFrequency } from "@/lib/certificates/types";
import { todayIsoDate } from "@/lib/format/date";
import type { TranslationKey } from "@/lib/i18n";
import { parseAmount } from "@/lib/format/currency";

export const CERTIFICATE_TERM_PRESETS = [3, 6, 12, 24, 36] as const;

export type CertificateTermPreset = (typeof CERTIFICATE_TERM_PRESETS)[number] | "custom";

export interface CertificateFormValues {
  name: string;
  institution: string;
  principalAmount: string;
  annualInterestRate: string;
  purchaseDate: string;
  termPreset: CertificateTermPreset;
  customTermMonths: string;
  payoutFrequency: PayoutFrequency;
}

export const DEFAULT_CERTIFICATE_FORM_VALUES: CertificateFormValues = {
  name: "",
  institution: "",
  principalAmount: "",
  annualInterestRate: "",
  purchaseDate: todayIsoDate(),
  termPreset: 12,
  customTermMonths: "",
  payoutFrequency: "at_maturity",
};

export function resolveTermMonths(values: CertificateFormValues): number | null {
  if (values.termPreset === "custom") {
    const months = Number.parseInt(values.customTermMonths, 10);
    if (!Number.isFinite(months)) return null;
    return months;
  }
  return values.termPreset;
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
  } else if (rate > 100) {
    errors.annualInterestRate = t("certificates.validation.rateMax");
  }

  if (!values.purchaseDate) {
    errors.purchaseDate = t("certificates.validation.purchaseDateRequired");
  } else if (values.purchaseDate > todayIsoDate()) {
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

  return errors;
}

export function certificateFormValuesFromCertificate(
  certificate: {
    principalAmount: number;
    annualInterestRate: number;
    purchaseDate: string;
    termMonths: number;
    payoutFrequency: PayoutFrequency;
  },
  account: { name: string; institution: string | null },
): CertificateFormValues {
  const preset = CERTIFICATE_TERM_PRESETS.includes(
    certificate.termMonths as (typeof CERTIFICATE_TERM_PRESETS)[number],
  )
    ? (certificate.termMonths as CertificateTermPreset)
    : "custom";

  return {
    name: account.name,
    institution: account.institution ?? "",
    principalAmount: String(certificate.principalAmount),
    annualInterestRate: String(certificate.annualInterestRate),
    purchaseDate: certificate.purchaseDate,
    termPreset: preset,
    customTermMonths: preset === "custom" ? String(certificate.termMonths) : "",
    payoutFrequency: certificate.payoutFrequency,
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
    values.customTermMonths !== initial.customTermMonths ||
    values.payoutFrequency !== initial.payoutFrequency
  );
}
