"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { calculateNetWorth } from "@/lib/finance/net-worth";
import type {
  Account,
  CreateAccountInput,
  CreateRecordInput,
  FinanceRecord,
} from "@/lib/finance/types";

const STORAGE_KEY = "nume-finance-v1";

interface FinanceState {
  accounts: Account[];
  records: FinanceRecord[];
}

interface FinanceContextValue {
  accounts: Account[];
  records: FinanceRecord[];
  isHydrated: boolean;
  netWorth: ReturnType<typeof calculateNetWorth>;
  createAccount: (input: CreateAccountInput) => Account;
  updateAccount: (
    id: string,
    patch: Partial<
      Pick<
        Account,
        | "name"
        | "institution"
        | "includeInNetWorth"
        | "includeInEmergencyFund"
        | "currentBalance"
      >
    >,
  ) => void;
  getAccount: (id: string) => Account | undefined;
  getAccountRecords: (accountId: string) => FinanceRecord[];
  createRecord: (input: CreateRecordInput) => FinanceRecord;
  recentRecords: (limit?: number) => FinanceRecord[];
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

function loadState(): FinanceState {
  if (typeof window === "undefined") {
    return { accounts: [], records: [] };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { accounts: [], records: [] };
    return JSON.parse(raw) as FinanceState;
  } catch {
    return { accounts: [], records: [] };
  }
}

function persistState(state: FinanceState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FinanceState>({
    accounts: [],
    records: [],
  });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadState();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client hydration from localStorage
    setState(loaded);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) persistState(state);
  }, [state, isHydrated]);

  const createAccount = useCallback((input: CreateAccountInput): Account => {
    const now = new Date().toISOString();
    const account: Account = {
      id: crypto.randomUUID(),
      type: "current_account",
      name: input.name.trim(),
      institution: input.institution?.trim() || null,
      currentBalance: input.currentBalance,
      includeInNetWorth: input.includeInNetWorth ?? true,
      includeInEmergencyFund: input.includeInEmergencyFund ?? false,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };
    setState((prev) => ({
      ...prev,
      accounts: [...prev.accounts, account],
    }));
    return account;
  }, []);

  const updateAccount = useCallback(
    (
      id: string,
      patch: Partial<
        Pick<
          Account,
          | "name"
          | "institution"
          | "includeInNetWorth"
          | "includeInEmergencyFund"
          | "currentBalance"
        >
      >,
    ) => {
      setState((prev) => ({
        ...prev,
        accounts: prev.accounts.map((account) =>
          account.id === id
            ? { ...account, ...patch, updatedAt: new Date().toISOString() }
            : account,
        ),
      }));
    },
    [],
  );

  const getAccount = useCallback(
    (id: string) => state.accounts.find((a) => a.id === id),
    [state.accounts],
  );

  const getAccountRecords = useCallback(
    (accountId: string) =>
      state.records
        .filter((r) => r.accountId === accountId)
        .sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime() ||
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [state.records],
  );

  const createRecord = useCallback(
    (input: CreateRecordInput): FinanceRecord => {
      const account = state.accounts.find((a) => a.id === input.accountId);
      if (!account) throw new Error("Account not found");

      let nextBalance = account.currentBalance;
      let recordAmount = input.amount;

      if (input.type === "income") {
        nextBalance += input.amount;
      } else if (input.type === "expense") {
        nextBalance -= input.amount;
      } else {
        const delta = input.amount - account.currentBalance;
        nextBalance = input.amount;
        recordAmount = delta;
      }

      const record: FinanceRecord = {
        id: crypto.randomUUID(),
        accountId: input.accountId,
        type: input.type,
        amount: recordAmount,
        description: input.description?.trim() || null,
        date: input.date,
        createdAt: new Date().toISOString(),
      };

      setState((prev) => ({
        accounts: prev.accounts.map((a) =>
          a.id === input.accountId
            ? {
                ...a,
                currentBalance: nextBalance,
                updatedAt: new Date().toISOString(),
              }
            : a,
        ),
        records: [record, ...prev.records],
      }));

      return record;
    },
    [state.accounts],
  );

  const recentRecords = useCallback(
    (limit = 3) =>
      [...state.records]
        .sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime() ||
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, limit),
    [state.records],
  );

  const netWorth = useMemo(
    () => calculateNetWorth(state.accounts),
    [state.accounts],
  );

  const value = useMemo(
    () => ({
      accounts: state.accounts.filter((a) => a.status === "active"),
      records: state.records,
      isHydrated,
      netWorth,
      createAccount,
      updateAccount,
      getAccount,
      getAccountRecords,
      createRecord,
      recentRecords,
    }),
    [
      state.accounts,
      state.records,
      isHydrated,
      netWorth,
      createAccount,
      updateAccount,
      getAccount,
      getAccountRecords,
      createRecord,
      recentRecords,
    ],
  );

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within FinanceProvider");
  }
  return context;
}
