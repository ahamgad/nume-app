"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import { calculateNetWorth } from "@/lib/finance/net-worth";
import {
  deleteAccount as deleteAccountService,
  fetchAccounts,
  fetchRecords,
  insertAccount,
  insertRecordWithBalanceUpdate,
  patchAccount,
} from "@/lib/finance/service";
import type {
  Account,
  CreateAccountInput,
  CreateRecordInput,
  FinanceRecord,
} from "@/lib/finance/types";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth-provider";

const FINANCE_QUERY_KEY = "finance";

interface FinanceContextValue {
  accounts: Account[];
  records: FinanceRecord[];
  isLoading: boolean;
  isHydrated: boolean;
  isFinanceReady: boolean;
  isFinanceLoading: boolean;
  netWorth: ReturnType<typeof calculateNetWorth>;
  createAccount: (input: CreateAccountInput) => Promise<Account>;
  deleteAccount: (id: string) => Promise<void>;
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
  ) => Promise<void>;
  getAccount: (id: string) => Account | undefined;
  getAccountRecords: (accountId: string) => FinanceRecord[];
  createRecord: (input: CreateRecordInput) => Promise<FinanceRecord>;
  recentRecords: (limit?: number) => FinanceRecord[];
  refresh: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

async function loadFinanceData(userId: string) {
  const supabase = createClient();
  const [accounts, records] = await Promise.all([
    fetchAccounts(supabase, userId),
    fetchRecords(supabase, userId),
  ]);
  return { accounts, records };
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const { data, isLoading: financeLoading, isFetched } = useQuery({
    queryKey: [FINANCE_QUERY_KEY, userId],
    queryFn: () => loadFinanceData(userId!),
    enabled: Boolean(userId),
    placeholderData: (previous) => previous,
  });

  const accounts = useMemo(() => data?.accounts ?? [], [data?.accounts]);
  const records = useMemo(() => data?.records ?? [], [data?.records]);

  const invalidate = useCallback(async () => {
    if (!userId) return;
    await queryClient.invalidateQueries({ queryKey: [FINANCE_QUERY_KEY, userId] });
  }, [queryClient, userId]);

  const createAccount = useCallback(
    async (input: CreateAccountInput): Promise<Account> => {
      if (!userId) throw new Error("Not authenticated");
      const supabase = createClient();
      const account = await insertAccount(supabase, userId, input);
      queryClient.setQueryData(
        [FINANCE_QUERY_KEY, userId],
        (current: { accounts: Account[]; records: FinanceRecord[] } | undefined) => ({
          accounts: [...(current?.accounts ?? []), account],
          records: current?.records ?? [],
        }),
      );
      void invalidate();
      return account;
    },
    [userId, invalidate, queryClient],
  );

  const deleteAccount = useCallback(
    async (id: string): Promise<void> => {
      if (!userId) throw new Error("Not authenticated");
      const supabase = createClient();
      await deleteAccountService(supabase, userId, id);
      queryClient.setQueryData(
        [FINANCE_QUERY_KEY, userId],
        (current: { accounts: Account[]; records: FinanceRecord[] } | undefined) => ({
          accounts: (current?.accounts ?? []).filter((account) => account.id !== id),
          records: (current?.records ?? []).filter(
            (record) => record.accountId !== id,
          ),
        }),
      );
      void invalidate();
    },
    [userId, invalidate, queryClient],
  );

  const updateAccount = useCallback(
    async (
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
      if (!userId) throw new Error("Not authenticated");
      const supabase = createClient();
      await patchAccount(supabase, userId, id, patch);
      await invalidate();
    },
    [userId, invalidate],
  );

  const getAccount = useCallback(
    (id: string) => accounts.find((a) => a.id === id),
    [accounts],
  );

  const getAccountRecords = useCallback(
    (accountId: string) =>
      records
        .filter((r) => r.accountId === accountId)
        .sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime() ||
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [records],
  );

  const createRecord = useCallback(
    async (input: CreateRecordInput): Promise<FinanceRecord> => {
      if (!userId) throw new Error("Not authenticated");
      const account = accounts.find((a) => a.id === input.accountId);
      if (!account) throw new Error("Account not found");

      const supabase = createClient();
      const { record } = await insertRecordWithBalanceUpdate(
        supabase,
        userId,
        input,
        account.currentBalance,
      );
      await invalidate();
      return record;
    },
    [userId, accounts, invalidate],
  );

  const recentRecords = useCallback(
    (limit = 3) =>
      [...records]
        .sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime() ||
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, limit),
    [records],
  );

  const netWorth = useMemo(() => calculateNetWorth(accounts), [accounts]);

  const isFinanceLoading = Boolean(userId) && financeLoading && !isFetched;
  const isFinanceReady = !userId || isFetched;
  const isHydrated = !authLoading;
  const isLoading = authLoading || isFinanceLoading;

  const value = useMemo(
    () => ({
      accounts,
      records,
      isLoading,
      isHydrated,
      isFinanceReady,
      isFinanceLoading,
      netWorth,
      createAccount,
      deleteAccount,
      updateAccount,
      getAccount,
      getAccountRecords,
      createRecord,
      recentRecords,
      refresh: invalidate,
    }),
    [
      accounts,
      records,
      isLoading,
      isHydrated,
      isFinanceReady,
      isFinanceLoading,
      netWorth,
      createAccount,
      deleteAccount,
      updateAccount,
      getAccount,
      getAccountRecords,
      createRecord,
      recentRecords,
      invalidate,
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
