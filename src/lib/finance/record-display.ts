import type { Certificate } from "@/lib/certificates/types";
import type { CreditCard } from "@/lib/credit-cards/types";
import type { SavingsAccount } from "@/lib/savings/types";
import type { Account, FinanceRecord } from "@/lib/finance/types";
import type { TranslationKey } from "@/lib/i18n";

export function findTransferCounterpartyRecord(
  record: FinanceRecord,
  allRecords: FinanceRecord[],
): FinanceRecord | null {
  if (record.type !== "transfer") return null;

  return (
    allRecords.find(
      (candidate) =>
        candidate.id !== record.id &&
        candidate.type === "transfer" &&
        candidate.date === record.date &&
        candidate.description === record.description &&
        candidate.amount === -record.amount,
    ) ?? null
  );
}

function accountName(
  accountId: string | null | undefined,
  accounts: Account[],
  t: (key: TranslationKey, params?: Record<string, string>) => string,
): string {
  if (!accountId) return t("common.emptyValue");
  return accounts.find((account) => account.id === accountId)?.name ?? t("common.emptyValue");
}

function resolveInterestSourceAccountId(
  record: FinanceRecord,
  savingsAccounts: SavingsAccount[],
  certificates: Certificate[],
): string | null {
  if (record.savingsAccountId) {
    const savings = savingsAccounts.find(
      (item) => item.id === record.savingsAccountId,
    );
    return savings?.accountId ?? null;
  }

  if (record.certificateId) {
    const certificate = certificates.find(
      (item) => item.id === record.certificateId,
    );
    return certificate?.accountId ?? null;
  }

  return null;
}

function resolveCreditCardAccountId(
  creditCardId: string | null | undefined,
  creditCards: CreditCard[],
): string | null {
  if (!creditCardId) return null;
  return creditCards.find((card) => card.id === creditCardId)?.accountId ?? null;
}

export function formatRecordLabel(
  record: FinanceRecord,
  t: (key: TranslationKey, params?: Record<string, string>) => string,
): string {
  if (record.type === "interest") {
    if (record.savingsAccountId) {
      return t("records.display.savingsInterest");
    }
    if (record.certificateId) {
      return t("records.display.certificateInterest");
    }
    return t("records.types.interest");
  }

  if (record.description?.trim()) {
    return record.description;
  }

  return t(`records.types.${record.type}`);
}

export interface FormatRecordSublineParams {
  /** When set, transfer direction is relative to this account. */
  contextAccountId?: string | null;
  allRecords: FinanceRecord[];
  accounts: Account[];
  savingsAccounts: SavingsAccount[];
  certificates: Certificate[];
  creditCards: CreditCard[];
  t: (key: TranslationKey, params?: Record<string, string>) => string;
}

export function formatRecordSubline(
  record: FinanceRecord,
  params: FormatRecordSublineParams,
): string | null {
  const {
    contextAccountId = null,
    allRecords,
    accounts,
    savingsAccounts,
    certificates,
    creditCards,
    t,
  } = params;

  const fromAccount = (name: string) =>
    t("records.display.fromAccount", { account: name });
  const toAccount = (name: string) =>
    t("records.display.toAccount", { account: name });

  if (record.type === "income" || record.type === "expense") {
    return accountName(record.accountId, accounts, t);
  }

  if (record.type === "interest") {
    const sourceAccountId = resolveInterestSourceAccountId(
      record,
      savingsAccounts,
      certificates,
    );
    return fromAccount(accountName(sourceAccountId, accounts, t));
  }

  if (record.type === "credit_card_purchase") {
    return accountName(record.accountId, accounts, t);
  }

  if (record.type === "credit_card_payment") {
    return fromAccount(
      accountName(record.paymentSourceAccountId, accounts, t),
    );
  }

  if (record.type === "transfer") {
    const viewingAccountId = contextAccountId ?? record.accountId;

    if (record.accountId !== viewingAccountId) {
      return null;
    }

    if (record.creditCardId) {
      const cardName = accountName(
        resolveCreditCardAccountId(record.creditCardId, creditCards),
        accounts,
        t,
      );

      if (record.amount < 0) {
        return toAccount(cardName);
      }

      return fromAccount(cardName);
    }

    const counterpartyRecord = findTransferCounterpartyRecord(record, allRecords);
    const counterpartyName = accountName(
      counterpartyRecord?.accountId,
      accounts,
      t,
    );

    if (record.amount < 0) {
      return toAccount(counterpartyName);
    }

    return fromAccount(counterpartyName);
  }

  return null;
}

/** @deprecated Use {@link formatRecordSubline} */
export function formatAccountContextRecordSubline(
  record: FinanceRecord,
  contextAccountId: string,
  allRecords: FinanceRecord[],
  accounts: Account[],
  t: (key: TranslationKey, params?: Record<string, string>) => string,
): string | null {
  return formatRecordSubline(record, {
    contextAccountId,
    allRecords,
    accounts,
    savingsAccounts: [],
    certificates: [],
    creditCards: [],
    t,
  });
}
