"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  buildCertificateAccountNameKey,
  buildCertificateAccountNameLookup,
  computeCertificateInsights,
  getCertificateSchedules as selectCertificateSchedules,
} from "@/lib/certificates/certificate-insights";
import {
  processAllDueCertificateInterest,
  processCertificateInterest as processCertificateInterestService,
} from "@/lib/certificates/interest-processor";
import { getCertificateSchedulesSafe } from "@/lib/certificates/load-schedules";
import { getCertificatesSafe } from "@/lib/certificates/load-certificates";
import {
  archiveCertificate as archiveCertificateService,
  createCertificate as createCertificateService,
  updateCertificate as updateCertificateService,
} from "@/lib/certificates/service";
import type {
  Certificate,
  CertificateInsights,
  CertificateScheduleEntry,
  CreateCertificateInput,
  UpdateCertificateInput,
} from "@/lib/certificates/types";
import type { ProcessCertificateInterestResult } from "@/lib/certificates/recurring/types";
import { calculateNetWorth } from "@/lib/finance/net-worth";
import {
  archiveAccount as archiveAccountService,
  deleteAccount as deleteAccountService,
  fetchAccounts,
  fetchRecords,
  insertAccount,
  insertRecordWithBalanceUpdate,
  insertTransfer,
  patchAccount,
  restoreAccount as restoreAccountService,
} from "@/lib/finance/service";
import type {
  Account,
  CreateAccountInput,
  CreateRecordInput,
  CreateTransferInput,
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
  certificateSchedules: CertificateScheduleEntry[];
}

interface FinanceContextValue {
  accounts: Account[];
  records: FinanceRecord[];
  certificates: Certificate[];
  certificateSchedules: CertificateScheduleEntry[];
  certificateInsights: CertificateInsights;
  isLoading: boolean;
  isHydrated: boolean;
  isFinanceReady: boolean;
  isFinanceLoading: boolean;
  isProcessingInterest: boolean;
  isProcessingCertificateInterest: (certificateId: string) => boolean;
  netWorth: ReturnType<typeof calculateNetWorth>;
  createAccount: (input: CreateAccountInput) => Promise<Account>;
  createCertificate: (input: CreateCertificateInput) => Promise<Certificate>;
  updateCertificate: (
    certificateId: string,
    input: UpdateCertificateInput,
  ) => Promise<Certificate>;
  archiveCertificate: (certificateId: string) => Promise<void>;
  processCertificateInterest: (
    certificateId: string,
  ) => Promise<ProcessCertificateInterestResult>;
  getCertificateSchedules: (certificateId: string) => CertificateScheduleEntry[];
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
  createTransfer: (input: CreateTransferInput) => Promise<void>;
  recentRecords: (limit?: number) => FinanceRecord[];
  refresh: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

async function fetchFinanceSnapshot(
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<FinanceData> {
  const [accounts, records] = await Promise.all([
    fetchAccounts(supabase, userId),
    fetchRecords(supabase, userId),
  ]);

  let certificates: Certificate[] = [];
  let certificateSchedules: CertificateScheduleEntry[] = [];

  try {
    certificates = await getCertificatesSafe(supabase, userId);
    certificateSchedules = await getCertificateSchedulesSafe(supabase, userId);
  } catch (error) {
    logSupabaseError("fetchFinanceSnapshot:certificates", error);
  }

  const activeAccountIds = new Set(accounts.map((account) => account.id));
  certificates = certificates.filter((certificate) =>
    activeAccountIds.has(certificate.accountId),
  );

  return { accounts, records, certificates, certificateSchedules };
}

async function loadFinanceData(userId: string): Promise<FinanceData> {
  const supabase = createClient();
  let snapshot = await fetchFinanceSnapshot(supabase, userId);

  const activeCertificateIds = snapshot.certificates
    .filter((certificate) => certificate.status === "active")
    .map((certificate) => certificate.id);

  if (activeCertificateIds.length > 0) {
    try {
      await processAllDueCertificateInterest(
        supabase,
        userId,
        activeCertificateIds,
      );
      snapshot = await fetchFinanceSnapshot(supabase, userId);
    } catch (error) {
      logSupabaseError("loadFinanceData:processInterest", error);
    }
  }

  return snapshot;
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const processingCertificatesRef = useRef<Set<string>>(new Set());
  const [processingCertificateIds, setProcessingCertificateIds] = useState<
    string[]
  >([]);

  const syncProcessingCertificateIds = useCallback(() => {
    setProcessingCertificateIds([...processingCertificatesRef.current]);
  }, []);

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
  const certificateSchedules = useMemo(
    () => data?.certificateSchedules ?? [],
    [data?.certificateSchedules],
  );

  const certificateAccountNameKey = useMemo(
    () => buildCertificateAccountNameKey(accounts),
    [accounts],
  );

  const certificateAccountNames = useMemo(
    () => buildCertificateAccountNameLookup(accounts),
    [certificateAccountNameKey],
  );

  const certificateInsights = useMemo(
    () =>
      computeCertificateInsights(
        certificates,
        certificateSchedules,
        certificateAccountNames,
      ),
    [certificates, certificateSchedules, certificateAccountNames],
  );

  const isProcessingInterest = processingCertificateIds.length > 0;

  const isProcessingCertificateInterest = useCallback(
    (certificateId: string) =>
      processingCertificatesRef.current.has(certificateId),
    [processingCertificateIds],
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
          certificateSchedules: current?.certificateSchedules ?? [],
        }),
      );
      return account;
    },
    [userId, invalidate],
  );

  const createCertificate = useCallback(
    async (input: CreateCertificateInput): Promise<Certificate> => {
      if (!userId) throw new Error("Not authenticated");
      const supabase = createClient();
      await createCertificateService(supabase, userId, input);
      await invalidate();
      const refreshed = await fetchFinanceSnapshot(supabase, userId);
      const certificate = refreshed.certificates.at(-1);
      if (!certificate) throw new Error("Certificate not found after create");
      return certificate;
    },
    [userId, invalidate],
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
      await invalidate();
      return updated;
    },
    [userId, invalidate],
  );

  const archiveCertificate = useCallback(
    async (certificateId: string): Promise<void> => {
      if (!userId) throw new Error("Not authenticated");
      const supabase = createClient();
      await archiveCertificateService(supabase, userId, certificateId);
      await invalidate();
    },
    [userId, invalidate],
  );

  const processCertificateInterest = useCallback(
    async (certificateId: string): Promise<ProcessCertificateInterestResult> => {
      if (!userId) throw new Error("Not authenticated");
      if (processingCertificatesRef.current.has(certificateId)) {
        const current = certificates.find(
          (certificate) => certificate.id === certificateId,
        );
        return {
          certificateId,
          processedCount: 0,
          matured: false,
          renewed: false,
          closed: false,
          entries: [],
        };
      }

      processingCertificatesRef.current.add(certificateId);
      syncProcessingCertificateIds();

      try {
        const supabase = createClient();
        const result = await processCertificateInterestService(
          supabase,
          userId,
          certificateId,
        );
        await invalidate();
        return result;
      } finally {
        processingCertificatesRef.current.delete(certificateId);
        syncProcessingCertificateIds();
      }
    },
    [userId, invalidate, certificates, syncProcessingCertificateIds],
  );

  const getCertificateSchedules = useCallback(
    (certificateId: string) =>
      selectCertificateSchedules(certificateSchedules, certificateId),
    [certificateSchedules],
  );

  const archiveAccount = useCallback(
    async (id: string): Promise<void> => {
      if (!userId) throw new Error("Not authenticated");
      const supabase = createClient();
      await archiveAccountService(supabase, userId, id);
      await invalidate();
    },
    [userId, invalidate],
  );

  const restoreAccount = useCallback(
    async (id: string): Promise<void> => {
      if (!userId) throw new Error("Not authenticated");
      const supabase = createClient();
      await restoreAccountService(supabase, userId, id);
      await invalidate();
    },
    [userId, invalidate],
  );

  const deleteAccount = useCallback(
    async (id: string): Promise<void> => {
      if (!userId) throw new Error("Not authenticated");
      const supabase = createClient();
      await deleteAccountService(supabase, userId, id);
      await invalidate();
    },
    [userId, invalidate],
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

  const createTransfer = useCallback(
    async (input: CreateTransferInput): Promise<void> => {
      if (!userId) throw new Error("Not authenticated");
      const fromAccount = accounts.find((a) => a.id === input.fromAccountId);
      const toAccount = accounts.find((a) => a.id === input.toAccountId);
      if (!fromAccount || !toAccount) {
        throw new Error("Account not found");
      }

      const supabase = createClient();
      await insertTransfer(
        supabase,
        userId,
        input,
        fromAccount,
        toAccount,
      );
      await invalidate();
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
      certificateSchedules,
      certificateInsights,
      isLoading,
      isHydrated,
      isFinanceReady,
      isFinanceLoading,
      isProcessingInterest,
      isProcessingCertificateInterest,
      netWorth,
      createAccount,
      createCertificate,
      updateCertificate,
      archiveCertificate,
      processCertificateInterest,
      getCertificateSchedules,
      archiveAccount,
      restoreAccount,
      deleteAccount,
      updateAccount,
      getAccount,
      getCertificateByAccountId,
      getAccountRecords,
      createRecord,
      createTransfer,
      recentRecords,
      refresh,
    }),
    [
      accounts,
      records,
      certificates,
      certificateSchedules,
      certificateInsights,
      isLoading,
      isHydrated,
      isFinanceReady,
      isFinanceLoading,
      isProcessingInterest,
      isProcessingCertificateInterest,
      netWorth,
      createAccount,
      createCertificate,
      updateCertificate,
      archiveCertificate,
      processCertificateInterest,
      getCertificateSchedules,
      archiveAccount,
      restoreAccount,
      deleteAccount,
      updateAccount,
      getAccount,
      getCertificateByAccountId,
      getAccountRecords,
      createRecord,
      createTransfer,
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
