import type { Account } from "@/lib/finance/types";
import type { Certificate } from "@/lib/certificates/types";
import type { CreditCard } from "@/lib/credit-cards/types";
import type { Loan } from "@/lib/lending/types";

export interface AccountIdentityInput {
  name: string;
  institution: string | null;
  numberLast4: string | null;
}

export interface AccountIdentityResolverContext {
  accounts: Account[];
  certificates: Certificate[];
  creditCards: CreditCard[];
  loans: Loan[];
}

function normalizeText(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed.toLowerCase() : null;
}

export function normalizeAccountIdentity(input: AccountIdentityInput) {
  return {
    name: input.name.trim().toLowerCase(),
    institution: normalizeText(input.institution),
    numberLast4: input.numberLast4?.trim() || null,
  };
}

export function resolveAccountNumberLast4(
  account: Account,
  context: Pick<
    AccountIdentityResolverContext,
    "certificates" | "creditCards" | "loans"
  >,
): string | null {
  if (account.type === "certificate") {
    return (
      context.certificates.find((item) => item.accountId === account.id)
        ?.certificateNumberLast4 ?? null
    );
  }
  if (account.type === "credit_card") {
    return (
      context.creditCards.find((item) => item.accountId === account.id)
        ?.cardNumberLast4 ?? null
    );
  }
  if (account.type === "loan") {
    return (
      context.loans.find((item) => item.accountId === account.id)
        ?.loanNumberLast4 ?? null
    );
  }
  return account.accountNumberLast4;
}

export function applyDuplicateAccountIdentityError(
  errors: Record<string, string>,
  input: AccountIdentityInput,
  context: AccountIdentityResolverContext,
  excludeAccountId: string | undefined,
  duplicateMessage: string,
): Record<string, string> {
  if (findDuplicateAccountIdentity(input, context, excludeAccountId)) {
    return { ...errors, name: duplicateMessage };
  }
  return errors;
}

export function findDuplicateAccountIdentity(
  input: AccountIdentityInput,
  context: AccountIdentityResolverContext,
  excludeAccountId?: string,
): Account | undefined {
  const candidate = normalizeAccountIdentity(input);

  return context.accounts.find((account) => {
    if (excludeAccountId && account.id === excludeAccountId) return false;

    const existing = normalizeAccountIdentity({
      name: account.name,
      institution: account.institution,
      numberLast4: resolveAccountNumberLast4(account, context),
    });

    return (
      candidate.name === existing.name &&
      candidate.institution === existing.institution &&
      candidate.numberLast4 === existing.numberLast4
    );
  });
}
