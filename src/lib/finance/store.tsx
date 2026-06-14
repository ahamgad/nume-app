"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import {
  archiveCertificate as archiveCertificateService,
  createCertificate as createCertificateService,
  updateCertificate as updateCertificateService,
} from "@/lib/certificates/service";
import { getCertificatesSafe } from "@/lib/certificates/load-certificates";
import type {
  Certificate,
  CreateCertificateInput,
  UpdateCertificateInput,
} from "@/lib/certificates/types";
import { calculateNetWorth } from "@/lib/finance/net-worth";
import {
  archiveAccount as archiveAccountService,
  deleteAccount as deleteAccountService,
  fetchAccounts,
  fetchRecords,
  insertAccount,
  insertRecordWithBalanceUpdate,
  patchAccount,
  restoreAccount as restoreAccountService,
} from "@/lib/finance/service";
import type {
  Account,
  CreateAccountInput,
  CreateRecordInput,
  FinanceRecord,
} from "@/lib/finance/types";
import { createClient } from "@/lib/supabase/client";
import { logSupabaseError } from "@/lib/supabase/errors";
import { useAuth } from "@/providers/auth-provider";

const FINANCE_QUERY_KEY = "finance";

interface FinanceData {
  accounts: Account[];
  records: FinanceRecord[];
  certificates: Certificate[];
}

interface FinanceContextValue {
  accounts: Account[];
  records: FinanceRecord[];
  certificates: Certificate[];
  isLoading: boolean;
  isHydrated: boolean;
  isFinanceReady: boolean;
  isFinanceLoading: boolean;
  netWorth: ReturnType<typeof calculateNetWorth>;
  createAccount: (input: CreateAccountInput) => Promise<Account>;
  createCertificate: (input: CreateCertificateInput) => Promise<Certificate>;
  updateCertificate: (
    certificateId: string,
    input: UpdateCertificateInput,
  ) => Promise<Certificate>;
  archiveCertificate: (certificateId: string) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  archiveAccount: (id: string) => Promise<void>;
  restoreAccount: (id: string) => Promise<void>;
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
  getCertificateByAccountId: (accountId: string) => Certificate | undefined;
  getAccountRecords: (accountId: string) => FinanceRecord[];
  createRecord: (input: CreateRecordInput) => Promise<FinanceRecord>;
  recentRecords: (limit?: number) => FinanceRecord[];
  refresh: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

async function loadFinanceData(userId: string): Promise<FinanceData> {
  const supabase = createClient();
  // Core money data must never depend on optional Certificates migration.
  const [accounts, records] = await Promise.all([
    fetchAccounts(supabase, userId),
    fetchRecords(supabase, userId),
  ]);

  let certificates: Certificate[] = [];
  try {
    certificates = await getCertificatesSafe(supabase, userId);
  } catch (error) {
    logSupabaseError("loadFinanceData:certificates", error);
  }

  const activeAccountIds = new Set(accounts.map((account) => account.id));
  certificates = certificates.filter((certificate) =>
    activeAccountIds.has(certificate.accountId),
  );

  return { accounts, records, certificates };
}

function accountFromCertificateInput(
  certificate: Certificate,
  input: CreateCertificateInput,
): Account {
  const now = certificate.createdAt;
  return {
    id: certificate.accountId,
    type: "certificate",
    name: input.name.trim(),
    institution: input.institution?.trim() || null,
    currentBalance: certificate.principalAmount,
    includeInNetWorth: input.includeInNetWorth ?? true,
    includeInEmergencyFund: input.includeInEmergencyFund ?? false,
    status: "active",
    createdAt: now,
    updatedAt: certificate.updatedAt,
  };
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
  const certificates = useMemo(
    () => data?.certificates ?? [],
    [data?.certificates],
  );

  const invalidate = useCallback(async () => {
    if (!userId) return;
    await queryClient.invalidateQueries({ queryKey: [FINANCE_QUERY_KEY, userId] });
  }, [queryClient, userId]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    await queryClient.refetchQueries({ queryKey: [FINANCE_QUERY_KEY, userId] });
  }, [queryClient, userId]);

  const createAccount = useCallback(
    async (input: CreateAccountInput): Promise<Account> => {
      if (!userId) throw new Error("Not authenticated");
      const supabase = createClient();
      const account = await insertAccount(supabase, userId, input);
      queryClient.setQueryData(
        [FINANCE_QUERY_KEY, userId],
        (current: FinanceData | undefined) => ({
          accounts: [...(current?.accounts ?? []), account],
          records: current?.records ?? [],
          certificates: current?.certificates ?? [],
        }),
      );
      return account;
    },
    [userId, queryClient],
  );

  const createCertificate = useCallback(
    async (input: CreateCertificateInput): Promise<Certificate> => {
      if (!userId) throw new Error("Not authenticated");
      const supabase = createClient();
      const certificate = await createCertificateService(supabase, userId, input);
      const account = accountFromCertificateInput(certificate, input);
      queryClient.setQueryData(
        [FINANCE_QUERY_KEY, userId],
        (current: FinanceData | undefined) => ({
          accounts: [...(current?.accounts ?? []), account],
          records: current?.records ?? [],
          certificates: [...(current?.certificates ?? []), certificate],
        }),
      );
      return certificate;
    },
    [userId, queryClient],
  );

  const updateCertificate = useCallback(
    async (
      certificateId: string,
      input: UpdateCertificateInput,
    ): Promise<Certificate> => {
      if (!userId) throw new Error("Not authenticated");
      const supabase = createClient();
      const updated = await updateCertificateService(
        supabase,
        userId,
        certificateId,
        input,
      );
      queryClient.setQueryData(
        [FINANCE_QUERY_KEY, userId],
        (current: FinanceData | undefined) => {
          if (!current) return current;
          const nextCertificates = current.certificates.map((certificate) =>
            certificate.id === certificateId ? updated : certificate,
          );
          const nextAccounts = current.accounts.map((account) => {
            if (account.id !== updated.accountId) return account;
            return {
              ...account,
              name: input.name ?? account.name,
              institution:
                input.institution !== undefined
                  ? input.institution
                  : account.institution,
              currentBalance: input.principalAmount ?? account.currentBalance,
              includeInNetWorth:
                input.includeInNetWorth ?? account.includeInNetWorth,
              includeInEmergencyFund:
                input.includeInEmergencyFund ?? account.includeInEmergencyFund,
              status:
                input.status === "archived" ? ("archived" as const) : account.status,
              updatedAt: updated.updatedAt,
            };
          });
          return {
            ...current,
            accounts: nextAccounts,
            certificates: nextCertificates,
          };
        },
      );
      return updated;
    },
    [userId, queryClient],
  );

  const archiveCertificate = useCallback(
    async (certificateId: string): Promise<void> => {
      if (!userId) throw new Error("Not authenticated");
      const existing = certificates.find(
        (certificate) => certificate.id === certificateId,
      );
      if (!existing) throw new Error("Certificate not found");

      const supabase = createClient();
      await archiveCertificateService(supabase, userId, certificateId);
      queryClient.setQueryData(
        [FINANCE_QUERY_KEY, userId],
        (current: FinanceData | undefined) => {
          if (!current) return current;
          return {
            accounts: current.accounts.map((account) =>
              account.id === existing.accountId
                ? { ...account, status: "archived" as const, includeInNetWorth: false }
                : account,
            ),
            records: current.records,
            certificates: current.certificates.map((certificate) =>
              certificate.id === certificateId
                ? { ...certificate, status: "archived" as const }
                : certificate,
            ),
          };
        },
      );
    },
    [userId, certificates, queryClient],
  );

  const archiveAccount = useCallback(
    async (id: string): Promise<void> => {
      if (!userId) throw new Error("Not authenticated");
      const supabase = createClient();
      await archiveAccountService(supabase, userId, id);
      queryClient.setQueryData(
        [FINANCE_QUERY_KEY, userId],
        (current: FinanceData | undefined) => {
          if (!current) return current;
          return {
            accounts: current.accounts.map((account) =>
              account.id === id
                ? { ...account, status: "archived" as const, includeInNetWorth: false }
                : account,
            ),
            records: current.records,
            certificates: current.certificates,
          };
        },
      );
    },
    [userId, queryClient],
  );

  const restoreAccount = useCallback(
    async (id: string): Promise<void> => {
      if (!userId) throw new Error("Not authenticated");
      const supabase = createClient();
      await restoreAccountService(supabase, userId, id);
      queryClient.setQueryData(
        [FINANCE_QUERY_KEY, userId],
        (current: FinanceData | undefined) => {
          if (!current) return current;
          return {
            accounts: current.accounts.map((account) =>
              account.id === id ? { ...account, status: "active" as const } : account,
            ),
            records: current.records,
            certificates: current.certificates,
          };
        },
      );
    },
    [userId, queryClient],
  );

  const deleteAccount = useCallback(
    async (id: string): Promise<void> => {
      if (!userId) throw new Error("Not authenticated");
      const supabase = createClient();
      await deleteAccountService(supabase, userId, id);
      queryClient.setQueryData(
        [FINANCE_QUERY_KEY, userId],
        (current: FinanceData | undefined) => ({
          accounts: (current?.accounts ?? []).filter((account) => account.id !== id),
          records: (current?.records ?? []).filter(
            (record) => record.accountId !== id,
          ),
          certificates: (current?.certificates ?? []).filter(
            (certificate) => certificate.accountId !== id,
          ),
        }),
      );
    },
    [userId, queryClient],
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

  const getCertificateByAccountId = useCallback(
    (accountId: string) =>
      certificates.find((certificate) => certificate.accountId === accountId),
    [certificates],
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

  const netWorth = useMemo(
    () => calculateNetWorth(accounts, certificates),
    [accounts, certificates],
  );

  const isFinanceLoading = Boolean(userId) && financeLoading && !isFetched;
  const isFinanceReady = !userId || isFetched;
  const isHydrated = !authLoading;
  const isLoading = authLoading || isFinanceLoading;

  const value = useMemo(
    () => ({
      accounts,
      records,
      certificates,
      isLoading,
      isHydrated,
      isFinanceReady,
      isFinanceLoading,
      netWorth,
      createAccount,
      createCertificate,
      updateCertificate,
      archiveCertificate,
      archiveAccount,
      restoreAccount,
      deleteAccount,
      updateAccount,
      getAccount,
      getCertificateByAccountId,
      getAccountRecords,
      createRecord,
      recentRecords,
      refresh,
    }),
    [
      accounts,
      records,
      certificates,
      isLoading,
      isHydrated,
      isFinanceReady,
      isFinanceLoading,
      netWorth,
      createAccount,
      createCertificate,
      updateCertificate,
      archiveCertificate,
      archiveAccount,
      restoreAccount,
      deleteAccount,
      updateAccount,
      getAccount,
      getCertificateByAccountId,
      getAccountRecords,
      createRecord,
      recentRecords,
      refresh,
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
