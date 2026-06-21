import type { AccountIdentityResolverContext } from "@/lib/finance/account-identity-validation";

export function buildAccountIdentityContext(source: {
  accounts: AccountIdentityResolverContext["accounts"];
  certificates: AccountIdentityResolverContext["certificates"];
  creditCards: AccountIdentityResolverContext["creditCards"];
  loans: AccountIdentityResolverContext["loans"];
}): AccountIdentityResolverContext {
  return {
    accounts: source.accounts,
    certificates: source.certificates,
    creditCards: source.creditCards,
    loans: source.loans,
  };
}
