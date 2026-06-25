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

/** Second-row subline for records on account details and account-scoped history. */
export function formatAccountContextRecordSubline(
  record: FinanceRecord,
  contextAccountId: string,
  allRecords: FinanceRecord[],
  accounts: Account[],
  t: (key: TranslationKey, params?: Record<string, string>) => string,
): string | null {
  if (record.type !== "transfer" || record.accountId !== contextAccountId) {
    return null;
  }

  const counterpartyRecord = findTransferCounterpartyRecord(record, allRecords);
  const counterpartyAccount = counterpartyRecord
    ? accounts.find((account) => account.id === counterpartyRecord.accountId)
    : null;
  const accountName = counterpartyAccount?.name ?? t("common.emptyValue");

  if (record.amount < 0) {
    return t("records.display.transferOutgoing", { account: accountName });
  }

  return t("records.display.transferIncoming", { account: accountName });
}
