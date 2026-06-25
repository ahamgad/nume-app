import { describe, expect, it } from "vitest";

import {
  findTransferCounterpartyRecord,
  formatAccountContextRecordSubline,
  formatRecordLabel,
  formatRecordSubline,
} from "@/lib/finance/record-display";
import type { Account, FinanceRecord } from "@/lib/finance/types";
import type { SavingsAccount } from "@/lib/savings/types";
import type { Certificate } from "@/lib/certificates/types";
import type { CreditCard } from "@/lib/credit-cards/types";

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
  {
    id: "a3",
    type: "current_account",
    name: "Cash",
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
    id: "cc1",
    type: "credit_card",
    name: "Platinum Card",
    institution: null,
    accountNumberLast4: null,
    currentBalance: -500,
    includeInNetWorth: true,
    includeInEmergencyFund: false,
    status: "active",
    createdAt: "",
    updatedAt: "",
  },
];

const savingsAccounts = [
  {
    id: "s1",
    accountId: "a2",
  },
] as SavingsAccount[];

const certificates = [
  {
    id: "c1",
    accountId: "a3",
  },
] as Certificate[];

const creditCards = [
  {
    id: "cc-row",
    accountId: "cc1",
  },
] as CreditCard[];

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

function baseRecord(
  partial: Partial<FinanceRecord> & Pick<FinanceRecord, "id" | "type" | "accountId" | "amount">,
): FinanceRecord {
  return {
    certificateId: null,
    scheduleEntryId: null,
    savingsAccountId: null,
    creditCardId: null,
    paymentSourceAccountId: null,
    description: "",
    date: "2026-06-01",
    createdAt: "",
    ...partial,
  };
}

const t = (key: string, params?: Record<string, string>) =>
  params?.account ? `${key}:${params.account}` : key;

const sublineParams = {
  accounts,
  savingsAccounts,
  certificates,
  creditCards,
  t,
};

describe("record display", () => {
  it("pairs transfer records by date, description, and opposite amount", () => {
    const outgoing = transferRecord({ id: "r1", accountId: "a1", amount: -100 });
    const incoming = transferRecord({ id: "r2", accountId: "a2", amount: 100 });

    expect(findTransferCounterpartyRecord(outgoing, [outgoing, incoming])).toEqual(
      incoming,
    );
  });

  it("shows account name for income and expense in account context", () => {
    const income = baseRecord({
      id: "r3",
      accountId: "a1",
      type: "income",
      amount: 50,
      description: "Salary",
    });

    expect(
      formatRecordSubline(income, {
        contextAccountId: "a1",
        allRecords: [income],
        ...sublineParams,
      }),
    ).toBe("Checking");
  });

  it("labels outgoing and incoming transfers for account context", () => {
    const outgoing = transferRecord({ id: "r1", accountId: "a1", amount: -100 });
    const incoming = transferRecord({ id: "r2", accountId: "a2", amount: 100 });
    const allRecords = [outgoing, incoming];

    expect(
      formatRecordSubline(outgoing, {
        contextAccountId: "a1",
        allRecords,
        ...sublineParams,
      }),
    ).toBe("records.display.toAccount:Savings");
    expect(
      formatRecordSubline(incoming, {
        contextAccountId: "a2",
        allRecords,
        ...sublineParams,
      }),
    ).toBe("records.display.fromAccount:Checking");
  });

  it("uses savings interest title and from-account subline", () => {
    const interest = baseRecord({
      id: "r4",
      accountId: "a3",
      type: "interest",
      amount: 12,
      savingsAccountId: "s1",
      description: "Interest Credit",
    });

    expect(formatRecordLabel(interest, t)).toBe("records.display.savingsInterest");
    expect(
      formatRecordSubline(interest, {
        allRecords: [interest],
        ...sublineParams,
      }),
    ).toBe("records.display.fromAccount:Savings");
  });

  it("uses certificate interest title and from-account subline", () => {
    const interest = baseRecord({
      id: "r5",
      accountId: "a1",
      type: "interest",
      amount: 50,
      certificateId: "c1",
      description: "Certificate Interest",
    });

    expect(formatRecordLabel(interest, t)).toBe("records.display.certificateInterest");
    expect(
      formatRecordSubline(interest, {
        allRecords: [interest],
        ...sublineParams,
      }),
    ).toBe("records.display.fromAccount:Cash");
  });

  it("shows payment source account on credit card payments", () => {
    const payment = baseRecord({
      id: "r6",
      accountId: "a2",
      type: "credit_card_payment",
      amount: -200,
      paymentSourceAccountId: "a1",
      description: "Payment",
    });

    expect(
      formatRecordSubline(payment, {
        allRecords: [payment],
        ...sublineParams,
      }),
    ).toBe("records.display.fromAccount:Checking");
  });

  it("shows credit card account name on purchases", () => {
    const purchase = baseRecord({
      id: "r7",
      accountId: "cc1",
      type: "credit_card_purchase",
      amount: 150,
      creditCardId: "cc-row",
      description: "Groceries",
    });

    expect(
      formatRecordSubline(purchase, {
        contextAccountId: "cc1",
        allRecords: [purchase],
        ...sublineParams,
      }),
    ).toBe("Platinum Card");
  });

  it("shows credit card destination on source-account payment transfers", () => {
    const paymentTransfer = baseRecord({
      id: "r8",
      accountId: "a1",
      type: "transfer",
      amount: -200,
      creditCardId: "cc-row",
      description: "Payment",
    });

    expect(
      formatRecordSubline(paymentTransfer, {
        contextAccountId: "a1",
        allRecords: [paymentTransfer],
        ...sublineParams,
      }),
    ).toBe("records.display.toAccount:Platinum Card");
  });

  it("keeps deprecated account-context helper compatible for transfers", () => {
    const outgoing = transferRecord({ id: "r1", accountId: "a1", amount: -100 });
    const incoming = transferRecord({ id: "r2", accountId: "a2", amount: 100 });
    const allRecords = [outgoing, incoming];

    expect(
      formatAccountContextRecordSubline(outgoing, "a1", allRecords, accounts, t),
    ).toBe("records.display.toAccount:Savings");
    expect(
      formatAccountContextRecordSubline(incoming, "a2", allRecords, accounts, t),
    ).toBe("records.display.fromAccount:Checking");
  });
});
