import { parseOptionalIdentifierLast4 } from "@/lib/finance/account-identifier";
import {
  applyDuplicateAccountIdentityError,
  type AccountIdentityInput,
  type AccountIdentityResolverContext,
} from "@/lib/finance/account-identity-validation";
import { DEFAULT_BUSINESS_DAY_SETTINGS } from "@/lib/business-days/types";
import {
  parsePostingDayFromForm,
  postingDayToFormValue,
  POSTING_DAY_LAST_OF_MONTH,
} from "@/lib/savings/posting-schedule";
import type { SavingsAccount } from "@/lib/savings/types";
import type { TierFormRow } from "@/lib/savings/tier-validation";
import {
  parseTierRows,
  validateTierStructure,
} from "@/lib/savings/tier-validation";
import { parseAmount } from "@/lib/format/currency";
import { validateIdentifierLast4Field } from "@/lib/field-editor/field-validators";
import type { TranslationKey } from "@/lib/i18n";

export type SavingsInterestModelForm = "fixed" | "tiered";

export type SavingsPostingFrequencyForm =
  | "daily"
  | "monthly"
  | "quarterly"
  | "semi_annual"
  | "annual";

export type SavingsInterestDestinationForm = "same_account" | "another_account";

export interface SavingsFormValues {
  name: string;
  institution: string;
  accountNumber: string;
  balance: string;
  interestModel: SavingsInterestModelForm;
  annualInterestRate: string;
  tiers: TierFormRow[];
  postingFrequency: SavingsPostingFrequencyForm;
  postingDay: string;
  excludeWeekends: boolean;
  excludeEgyptianHolidays: boolean;
  interestDestination: SavingsInterestDestinationForm;
  destinationAccountId: string;
}

export const DEFAULT_SAVINGS_FORM_VALUES: SavingsFormValues = {
  name: "",
  institution: "",
  accountNumber: "",
  balance: "",
  interestModel: "fixed",
  annualInterestRate: "",
  tiers: [{ minBalance: "0", maxBalance: "", annualInterestRate: "" }],
  postingFrequency: "monthly",
  postingDay: "1",
  excludeWeekends: DEFAULT_BUSINESS_DAY_SETTINGS.excludeWeekends,
  excludeEgyptianHolidays: DEFAULT_BUSINESS_DAY_SETTINGS.excludeEgyptianHolidays,
  interestDestination: "same_account",
  destinationAccountId: "",
};

export function savingsFormValuesFromAccount(
  account: { name: string; institution: string | null; accountNumberLast4?: string | null },
  savings: SavingsAccount,
): SavingsFormValues {
  return {
    name: account.name,
    institution: account.institution ?? "",
    accountNumber: account.accountNumberLast4 ?? "",
    balance: "",
    interestModel: savings.interestModel,
    annualInterestRate:
      savings.annualInterestRate === null
        ? ""
        : String(savings.annualInterestRate),
    tiers:
      savings.tiers.length > 0
        ? savings.tiers.map((tier) => ({
            minBalance: String(tier.minBalance),
            maxBalance:
              tier.maxBalance === null ? "" : String(tier.maxBalance),
            annualInterestRate: String(tier.annualInterestRate),
          }))
        : [{ minBalance: "0", maxBalance: "", annualInterestRate: "" }],
    postingFrequency: savings.postingFrequency,
    postingDay: postingDayToFormValue(savings.postingDay),
    excludeWeekends: savings.excludeWeekends,
    excludeEgyptianHolidays: savings.excludeEgyptianHolidays,
    interestDestination: savings.interestDestination,
    destinationAccountId: savings.destinationAccountId ?? "",
  };
}

export function isSavingsFormDirty(
  values: SavingsFormValues,
  initial: SavingsFormValues,
): boolean {
  return JSON.stringify(values) !== JSON.stringify(initial);
}

export function validateSavingsForm(
  values: SavingsFormValues,
  t: (key: TranslationKey) => string,
  mode: "create" | "edit" = "create",
  options?: {
    identityContext?: AccountIdentityResolverContext;
    excludeAccountId?: string;
  },
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.name.trim()) {
    errors.name = t("accounts.validation.nameRequired");
  }

  const identifierError = validateIdentifierLast4Field(values.accountNumber, t);
  if (identifierError) errors.accountNumber = identifierError;

  if (mode === "create") {
    const parsedBalance = parseAmount(values.balance);
    if (parsedBalance === null) {
      errors.balance = t("accounts.validation.balanceRequired");
    } else if (parsedBalance < 0) {
      errors.balance = t("accounts.validation.balanceNegative");
    }
  }

  if (values.interestModel === "fixed") {
    const rate = parseAmount(values.annualInterestRate);
    if (rate === null || rate < 0) {
      errors.annualInterestRate = t("savings.validation.rateRequired");
    }
  } else {
    const parsedTiers = parseTierRows(values.tiers);
    if (!parsedTiers) {
      errors.tiers = t("savings.validation.tiersInvalid");
    } else {
      Object.assign(errors, validateTierStructure(parsedTiers, t));
    }
  }

  const postingDay = parsePostingDayFromForm(values.postingDay);
  if (values.postingFrequency !== "daily" && postingDay === null) {
    errors.postingDay = t("savings.validation.postingDayInvalid");
  }

  if (
    values.interestDestination === "another_account" &&
    !values.destinationAccountId.trim()
  ) {
    errors.destinationAccountId = t(
      "accounts.validation.interestDestinationAccountRequired",
    );
  }

  if (options?.identityContext) {
    const identity: AccountIdentityInput = {
      name: values.name,
      institution: values.institution.trim() || null,
      numberLast4: parseOptionalIdentifierLast4(values.accountNumber),
    };
    return applyDuplicateAccountIdentityError(
      errors,
      identity,
      options.identityContext,
      options.excludeAccountId,
      t("accounts.validation.duplicateAccount"),
    );
  }

  return errors;
}

export function resolveSavingsFormForSubmit(
  values: SavingsFormValues,
  mode: "create" | "edit",
) {
  const parsedTiers =
    values.interestModel === "tiered" ? parseTierRows(values.tiers) : null;

  const parsedPostingDay = parsePostingDayFromForm(values.postingDay);

  return {
    name: values.name.trim(),
    institution: values.institution.trim() || null,
    accountNumberLast4: parseOptionalIdentifierLast4(values.accountNumber),
    openingBalance:
      mode === "create" ? (parseAmount(values.balance) ?? 0) : undefined,
    interestModel: values.interestModel,
    annualInterestRate:
      values.interestModel === "fixed"
        ? parseAmount(values.annualInterestRate)
        : null,
    tiers:
      parsedTiers?.map((tier, index) => ({
        minBalance: tier.minBalance,
        maxBalance: tier.maxBalance,
        annualInterestRate: tier.annualInterestRate,
        sortOrder: index,
      })) ?? [],
    postingFrequency: values.postingFrequency,
    postingDay:
      values.postingFrequency === "daily"
        ? 1
        : parsedPostingDay ?? POSTING_DAY_LAST_OF_MONTH,
    excludeWeekends: values.excludeWeekends,
    excludeEgyptianHolidays: values.excludeEgyptianHolidays,
    interestDestination: values.interestDestination,
    destinationAccountId:
      values.interestDestination === "another_account"
        ? values.destinationAccountId
        : null,
  };
}
