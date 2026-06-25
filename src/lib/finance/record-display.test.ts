import { describe, expect, it } from "vitest";

import {
  findTransferCounterpartyRecord,
  formatAccountContextRecordSubline,
} from "@/lib/finance/record-display";
import type { Account, FinanceRecord } from "@/lib/finance/types";

const accounts: Account[] = [
  {
    id: "a1",
    type: "current_account",
    name: "Checking",
    institution: null,
    accountNumberLast4: null,
    currentBalance: 0,
    includeInNetWorth: true,
    includeInEmergencyFund: false,
    status: "active",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "a2",
    type: "savings_account",
    name: "Savings",
    institution: null,
    accountNumberLast4: null,
    currentBalance: 0,
    includeInNetWorth: true,
    includeInEmergencyFund: false,
    status: "active",
    createdAt: "",
    updatedAt: "",
  },
];

function transferRecord(
  partial: Pick<FinanceRecord, "id" | "accountId" | "amount">,
): FinanceRecord {
  return {
    certificateId: null,
    scheduleEntryId: null,
    savingsAccountId: null,
    creditCardId: null,
    paymentSourceAccountId: null,
    type: "transfer",
    description: "Move",
    date: "2026-06-01",
    createdAt: "",
    ...partial,
  };
}

describe("record display", () => {
  it("pairs transfer records by date, description, and opposite amount", () => {
    const outgoing = transferRecord({ id: "r1", accountId: "a1", amount: -100 });
    const incoming = transferRecord({ id: "r2", accountId: "a2", amount: 100 });

    expect(findTransferCounterpartyRecord(outgoing, [outgoing, incoming])).toEqual(
      incoming,
    );
  });

  it("hides account subline for non-transfer records in account context", () => {
    const income: FinanceRecord = {
      id: "r3",
      accountId: "a1",
      type: "income",
      amount: 50,
      description: "Salary",
      date: "2026-06-01",
      certificateId: null,
      scheduleEntryId: null,
      savingsAccountId: null,
      creditCardId: null,
      paymentSourceAccountId: null,
      createdAt: "",
    };

    const t = (key: string) => key;
    expect(
      formatAccountContextRecordSubline(income, "a1", [income], accounts, t),
    ).toBeNull();
  });

  it("labels outgoing and incoming transfers for account context", () => {
    const outgoing = transferRecord({ id: "r1", accountId: "a1", amount: -100 });
    const incoming = transferRecord({ id: "r2", accountId: "a2", amount: 100 });
    const allRecords = [outgoing, incoming];

    const t = (key: string, params?: Record<string, string>) =>
      `${key}:${params?.account ?? ""}`;

    expect(
      formatAccountContextRecordSubline(outgoing, "a1", allRecords, accounts, t),
    ).toBe("records.display.transferOutgoing:Savings");
    expect(
      formatAccountContextRecordSubline(incoming, "a2", allRecords, accounts, t),
    ).toBe("records.display.transferIncoming:Checking");
  });
});
