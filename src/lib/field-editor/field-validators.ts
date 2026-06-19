import { parseAmount } from "@/lib/format/currency";
import type { TranslationKey } from "@/lib/i18n";

type Translator = (key: TranslationKey) => string;

export function validateAccountNameField(
  value: string,
  t: Translator,
): string | undefined {
  if (!value.trim()) return t("accounts.validation.nameRequired");
}

export function validateAccountBalanceField(
  value: string,
  t: Translator,
): string | undefined {
  const parsed = parseAmount(value);
  if (parsed === null) return t("accounts.validation.balanceRequired");
  if (parsed < 0) return t("accounts.validation.balanceNegative");
}

export function validateCertificateNameField(
  value: string,
  t: Translator,
): string | undefined {
  if (!value.trim()) return t("certificates.validation.nameRequired");
}

export function validateCertificatePrincipalField(
  value: string,
  t: Translator,
): string | undefined {
  const principal = parseAmount(value);
  if (principal === null) return t("certificates.validation.principalRequired");
  if (principal <= 0) return t("certificates.validation.principalPositive");
}

export function validateCertificateRateField(
  value: string,
  t: Translator,
): string | undefined {
  const rate = parseAmount(value);
  if (rate === null) return t("certificates.validation.rateRequired");
  if (rate < 0) return t("certificates.validation.rateNegative");
  if (rate > 9999) return t("certificates.validation.rateMax");
}

export function validateCertificateCustomTermField(
  value: string,
  t: Translator,
): string | undefined {
  const years = parseAmount(value);
  if (years === null || !Number.isFinite(years) || years <= 0) {
    return t("certificates.validation.termYearsMin");
  }
  if (years > 50) return t("certificates.validation.termYearsMax");
}

export function validateIdentifierLast4Field(
  value: string | undefined | null,
  t: Translator,
): string | undefined {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return undefined;
  if (!/^\d{4}$/.test(trimmed)) {
    return t("accounts.validation.identifierLast4Invalid");
  }
}
