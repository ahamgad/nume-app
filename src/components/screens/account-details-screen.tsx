"use client";

import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CertificateDetailsScreen } from "@/components/screens/certificate-details-screen";
import { AccountDetailActions } from "@/components/accounts/account-detail-actions";
import { BalanceMetricCard } from "@/components/accounts/balance-metric-card";
import { RecentRecordsSection } from "@/components/accounts/recent-records-section";
import { ScreenBody, ScreenHeader, SCREEN_HEADER_ACTION_ICON_CLASS } from "@/components/layout/screen-header";
import {
  ToggleSettingRow,
} from "@/components/patterns";
import { AccountTypeBadge } from "@/components/ui/account-type-icon";
import { ConfirmBottomSheet } from "@/components/ui/confirm-bottom-sheet";
import { Button } from "@/components/ui/button";
import { formatInstitutionEntityLabel } from "@/lib/institutions/catalog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatSignedCurrency } from "@/lib/format/currency";
import { formatDisplayDate, formatRelativeTime } from "@/lib/format/date";
import { useFinance } from "@/lib/finance/store";
import type { FinanceRecord } from "@/lib/finance/types";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/errors";
import { useT, useFormatLocale } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";

function recordIcon(type: FinanceRecord["type"]) {
  if (type === "income") return <ArrowDownLeft className="size-4" />;
  if (type === "expense") return <ArrowUpRight className="size-4" />;
  if (type === "transfer") return <ArrowLeftRight className="size-4" />;
  return <ArrowLeftRight className="size-4" />;
}

function recordLabel(record: FinanceRecord, t: ReturnType<typeof useT>) {
  if (record.description) return record.description;
  return t(`records.types.${record.type}`);
}

interface AccountDetailsScreenProps {
  accountId: string;
}

export function AccountDetailsScreen({ accountId }: AccountDetailsScreenProps) {
  const t = useT();
  const formatLocale = useFormatLocale();
  const router = useRouter();
  const { showToast } = useToast();
  const {
    getAccount,
    getAccountRecords,
    updateAccount,
    archiveAccount,
    restoreAccount,
    isFinanceReady,
  } = useFinance();

  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const account = getAccount(accountId);
  const records = getAccountRecords(accountId).slice(0, 5);
  const isArchived = account?.status === "archived";

  async function handleArchiveConfirm() {
    if (!account) return;
    setArchiving(true);
    try {
      await archiveAccount(account.id);
      showToast(t("accounts.details.archiveSuccess"));
      router.replace("/accounts");
    } catch (error) {
      logSupabaseError("archiveAccount", error);
      showToast(getSupabaseErrorMessage(error) || t("common.retry"));
    } finally {
      setArchiving(false);
      setShowArchiveConfirm(false);
    }
  }

  async function handleRestore() {
    if (!account) return;
    setRestoring(true);
    try {
      await restoreAccount(account.id);
      showToast(t("accounts.details.restoreSuccess"));
    } catch (error) {
      logSupabaseError("restoreAccount", error);
      showToast(getSupabaseErrorMessage(error) || t("common.retry"));
    } finally {
      setRestoring(false);
    }
  }

  if (!isFinanceReady) {
    return (
      <>
        <ScreenHeader mode="stack" title={t("common.loading")} />
        <ScreenBody withTabBar={false}>
          <Skeleton className="h-40 w-full rounded-lg" />
        </ScreenBody>
      </>
    );
  }

  if (!account) {
    return (
      <>
        <ScreenHeader
          mode="stack"
          title={t("accounts.details.notFound")}
          onBack={() => router.push("/accounts")}
        />
        <ScreenBody withTabBar={false}>
          <p className="text-muted-foreground">
            {t("accounts.details.notFoundDescription")}
          </p>
          <Button
            className="mt-4 h-11"
            onClick={() => router.push("/accounts")}
          >
            {t("accounts.title")}
          </Button>
        </ScreenBody>
      </>
    );
  }

  if (account.type === "certificate") {
    return <CertificateDetailsScreen accountId={accountId} />;
  }

  return (
    <>
      <ScreenHeader
        mode="stack"
        title={account.name}
        onBack={() => router.push("/accounts")}
        rightAction={
          !isArchived ? (
            <button
              type="button"
              onClick={() => router.push(`/accounts/${account.id}/records/new`)}
              className="inline-flex size-11 items-center justify-center rounded-md text-foreground"
              aria-label={t("accounts.details.addRecord")}
            >
              <Plus className={SCREEN_HEADER_ACTION_ICON_CLASS} />
            </button>
          ) : undefined
        }
      />
      <ScreenBody withTabBar={false} className="space-y-6">
        <div>
          {account.institution ? (
            <p className="text-[0.8125rem] text-muted-foreground">
              {formatInstitutionEntityLabel(account.institution, t)}
            </p>
          ) : null}
          <div className="mt-1 flex flex-wrap gap-2">
            <AccountTypeBadge type={account.type} />
            <span className="rounded-sm bg-muted px-2 py-1 text-xs text-muted-foreground">
              {isArchived ? t("accounts.status.archived") : t("common.active")}
            </span>
          </div>
        </div>

        <BalanceMetricCard
          account={account}
          label={t("accounts.details.currentBalance")}
          meta={t("dashboard.netWorth.updated", {
            time: formatRelativeTime(account.updatedAt, t, formatLocale),
          })}
          editable={!isArchived}
          onBalanceSave={async (balance) => {
            await updateAccount(account.id, { currentBalance: balance });
          }}
        />

        {!isArchived ? (
          <AccountDetailActions
            editLabel={t("accounts.details.edit")}
            archiveLabel={t("accounts.details.archiveAccount")}
            disabled={archiving}
            onEdit={() => router.push(`/accounts/${account.id}/edit`)}
            onArchive={() => setShowArchiveConfirm(true)}
          />
        ) : null}

        {!isArchived ? (
          <section>
            <h2 className="mb-2 text-start text-lg font-semibold">
              {t("accounts.details.settingsTitle")}
            </h2>
            <div className="rounded-lg border border-border px-4">
              <ToggleSettingRow
                label={t("accounts.settings.includeInNetWorth.label")}
                description={t("accounts.settings.includeInNetWorth.description")}
                checked={account.includeInNetWorth}
                onCheckedChange={(checked) =>
                  void updateAccount(account.id, { includeInNetWorth: checked })
                }
              />
              <div className="border-t border-border">
                <ToggleSettingRow
                  label={t("accounts.settings.includeInEmergencyFund.label")}
                  description={t(
                    "accounts.settings.includeInEmergencyFund.description",
                  )}
                  checked={account.includeInEmergencyFund}
                  onCheckedChange={(checked) =>
                    void updateAccount(account.id, {
                      includeInEmergencyFund: checked,
                    })
                  }
                />
              </div>
            </div>
          </section>
        ) : (
          <Button
            className="h-11 w-full"
            disabled={restoring}
            onClick={handleRestore}
          >
            {restoring
              ? t("accounts.details.restoreRestoring")
              : t("accounts.details.restoreAccount")}
          </Button>
        )}

        <RecentRecordsSection
          records={records}
          formatLocale={formatLocale}
          recordLabel={(record) => recordLabel(record, t)}
          recordAmount={(record) =>
            formatSignedCurrency(record.amount, record.type, formatLocale)
          }
          recordMeta={(record) =>
            formatDisplayDate(record.date, formatLocale)
          }
          recordIcon={(record) => recordIcon(record.type)}
        />
      </ScreenBody>

      <ConfirmBottomSheet
        open={showArchiveConfirm}
        titleId="archive-account-title"
        icon="archive"
        title={t("accounts.details.archiveConfirm.title")}
        description={t("accounts.details.archiveConfirm.description")}
        confirmLabel={t("accounts.details.archiveConfirm.confirm")}
        confirmLoadingLabel={t("accounts.details.archiveConfirm.archiving")}
        cancelLabel={t("accounts.details.archiveConfirm.cancel")}
        confirmDisabled={archiving}
        onConfirm={handleArchiveConfirm}
        onCancel={() => setShowArchiveConfirm(false)}
      />
    </>
  );
}
