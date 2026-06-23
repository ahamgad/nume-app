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
  showsInstitution?: boolean;
  showsBalance?: boolean;
  showsIdentifier?: boolean;
  termPreset?: string | number;
}

/**
 * Whether a field shows the required indicator (*).
 * Mirrors submit-time validation: only fields that fail when empty/unset.
 * Chip selects with default selections are never required indicators.
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
      return requirements.showsIdentifier !== false;
    case "balance":
    case "outstandingBalance":
      return requirements.mode === "create" && requirements.showsBalance !== false;
    case "annualInterestRate":
      return requirements.interestModel === "fixed";
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

export function resolveAccountFormFieldRequired(
  fieldKey: string,
  requirements: AccountFormRequirements,
  explicit?: boolean,
): boolean {
  if (explicit === true) return true;
  if (explicit === false) return false;
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
