import type { AccountType } from "@/lib/finance/types";

export interface AccountFormRequirements {
  mode?: "create" | "edit";
  accountType?: AccountType | string;
  interestModel?: "fixed" | "tiered";
  interestDestination?: "same_account" | "another_account";
  autoApplyInterest?: boolean;
  postingFrequency?: string;
  payoutFrequency?: string;
  showsPayoutDay?: boolean;
  /** Field is rendered; institution is required when shown (except cash). */
  showsInstitution?: boolean;
  /** Field is rendered; balance is required on create when shown. */
  showsBalance?: boolean;
  /**
   * Field visibility only — last-4 identifiers are optional when provided.
   * @deprecated Do not use for required-indicator logic.
   */
  showsIdentifier?: boolean;
  termPreset?: string | number;
}

/**
 * Whether a field shows the required indicator (*).
 * Mirrors submit-time validation: only fields that fail when empty/unset.
 * Chip selects with default selections are never required indicators.
 *
 * @see validateMoneyAccountForm, validateSavingsForm, validateCertificateForm,
 *   validateCreditCardForm, validateLendingAccountForm
 */
export function isAccountFormFieldRequired(
  fieldKey: string,
  requirements: AccountFormRequirements,
): boolean {
  const normalized = normalizeAccountFormFieldKey(fieldKey);

  switch (normalized) {
    case "name":
      return true;
    case "institution":
      return (
        requirements.showsInstitution !== false &&
        requirements.accountType !== "cash"
      );
    case "accountNumber":
    case "certificateNumber":
    case "identifier":
      // validateIdentifierLast4Field — optional; format-only when non-empty
      return false;
    case "balance":
    case "outstandingBalance":
      return requirements.mode === "create" && requirements.showsBalance !== false;
    case "annualInterestRate":
      return (
        requirements.interestModel === "fixed" ||
        requirements.accountType === "certificate"
      );
    case "principalAmount":
    case "purchaseDate":
    case "creditLimit":
    case "linkedAccountId":
      return true;
    case "destinationAccountId":
      return (
        requirements.interestDestination === "another_account" ||
        requirements.autoApplyInterest === true
      );
    case "tierMinBalance":
    case "tierAnnualRate":
      return requirements.interestModel === "tiered";
    case "tierMaxBalance":
      return false;
    case "customTermYears":
    case "certificate-custom-term":
      return requirements.termPreset === "custom";
    default:
      return false;
  }
}

/**
 * Resolves whether to show `*`. Validation registry is the source of truth;
 * callers may pass `required={false}` to force-hide the indicator only.
 */
export function resolveAccountFormFieldRequired(
  fieldKey: string,
  requirements: AccountFormRequirements,
  explicit?: boolean,
): boolean {
  if (explicit === false) return false;
  if (explicit === true) return true;
  return isAccountFormFieldRequired(fieldKey, requirements);
}

function normalizeAccountFormFieldKey(fieldKey: string): string {
  if (fieldKey.startsWith("tier-min-")) return "tierMinBalance";
  if (fieldKey.startsWith("tier-max-")) return "tierMaxBalance";
  if (fieldKey.startsWith("tier-rate-")) return "tierAnnualRate";

  const aliases: Record<string, string> = {
    "account-name": "name",
    "savings-name": "name",
    "lending-name": "name",
    "credit-card-name": "name",
    "certificate-name": "name",
    "account-institution": "institution",
    "savings-institution": "institution",
    "lending-institution": "institution",
    "account-number-last4": "accountNumber",
    "savings-account-number": "accountNumber",
    "lending-identifier": "identifier",
    "credit-card-identifier": "identifier",
    "certificate-institution": "institution",
    "certificate-number": "certificateNumber",
    balance: "balance",
    "savings-balance": "balance",
    "lending-balance": "balance",
    "credit-card-outstanding": "outstandingBalance",
    "certificate-principal": "principalAmount",
    "certificate-purchase-date": "purchaseDate",
    "savings-rate": "annualInterestRate",
    "certificate-rate": "annualInterestRate",
    "credit-card-limit": "creditLimit",
    "credit-card-linked-account": "linkedAccountId",
    "savings-destination": "destinationAccountId",
    "certificate-interest-destination": "destinationAccountId",
  };

  return aliases[fieldKey] ?? fieldKey;
}
