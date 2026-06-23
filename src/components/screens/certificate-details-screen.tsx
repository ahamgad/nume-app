"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import {
  AccountDetailsContentHeader,
  AccountDetailsStackHeader,
} from "@/components/accounts/account-details-chrome";
import { AccountDetailsSettingsSection } from "@/components/accounts/account-details-settings-section";
import { ArchivedAccountActions } from "@/components/accounts/archived-account-actions";
import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { MetricHero, ToggleSettingRow, WidgetCard } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { ConfirmBottomSheet } from "@/components/ui/confirm-bottom-sheet";
import { accountsListHref, getPersistedAccountsListFilter } from "@/lib/accounts/accounts-list-filter";
import { countDueEntries } from "@/lib/certificates/certificate-insights";
import {
  computeCertificateMetrics,
  formatCertificateRemainingLabel,
} from "@/lib/certificates/certificate-engine";
import { calculateScheduleSummary } from "@/lib/certificates/schedule-generator";
import { formatAccountDestinationDisplay, formatAccountDetailsHeaderSubtitle } from "@/lib/finance/account-display";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format/currency";
import { formatDisplayDate, formatRelativeTime, todayIsoDate } from "@/lib/format/date";
import { useFinance } from "@/lib/finance/store";
import type { TranslationKey } from "@/lib/i18n";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/errors";
import { useT, useFormatLocale } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";

interface CertificateDetailsScreenProps {
  accountId: string;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="text-[0.9375rem] text-muted-foreground">{label}</span>
      <span className="text-end text-[0.9375rem] font-medium tabular-nums">{value}</span>
    </div>
  );
}

export function CertificateDetailsScreen({ accountId }: CertificateDetailsScreenProps) {
  const t = useT();
  const formatLocale = useFormatLocale();
  const router = useRouter();
  const { showToast } = useToast();
  const {
    getAccount,
    getCertificateByAccountId,
    getCertificateSchedules,
    updateAccount,
    archiveCertificate,
    restoreCertificate,
    deleteAccount,
    processCertificateInterest,
    accounts,
    isFinanceReady,
    isProcessingCertificateInterest,
    refresh,
  } = useFinance();

  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const processingInterestRef = useRef(false);

  const account = getAccount(accountId);
  const certificate = getCertificateByAccountId(accountId);
  const schedules = certificate ? getCertificateSchedules(certificate.id) : [];

  const metrics = useMemo(() => {
    if (!certificate) return null;
    return computeCertificateMetrics(certificate);
  }, [certificate]);

  const scheduleSummary = useMemo(
    () => calculateScheduleSummary(schedules),
    [schedules],
  );

  const dueCount = certificate
    ? countDueEntries(schedules, certificate.id, todayIsoDate())
    : 0;

  const payoutFrequencyKey =
    `certificates.payoutFrequency.${certificate?.payoutFrequency}` as TranslationKey;

  async function handleProcessInterest() {
    if (!certificate) return;
    if (
      processingInterestRef.current ||
      isProcessingCertificateInterest(certificate.id)
    ) {
      return;
    }

    processingInterestRef.current = true;
    try {
      await processCertificateInterest(certificate.id);
    } catch (error) {
      logSupabaseError("processCertificateInterest", error);
    } finally {
      processingInterestRef.current = false;
    }
  }

  async function handleArchiveConfirm() {
    if (!certificate) return;
    setArchiving(true);
    try {
      await archiveCertificate(certificate.id);
      showToast(t("certificates.details.archiveSuccess"));
      router.replace(accountsListHref(getPersistedAccountsListFilter()));
    } catch (error) {
      logSupabaseError("archiveCertificate", error);
      showToast(getSupabaseErrorMessage(error) || t("common.retry"));
    } finally {
      setArchiving(false);
      setShowArchiveConfirm(false);
    }
  }

  async function handleRestore() {
    if (!certificate) return;
    setRestoring(true);
    try {
      await restoreCertificate(certificate.id);
      showToast(t("accounts.details.restoreSuccess"));
    } catch (error) {
      logSupabaseError("restoreCertificate", error);
      showToast(getSupabaseErrorMessage(error) || t("common.retry"));
    } finally {
      setRestoring(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!account) return;
    setDeleting(true);
    try {
      await deleteAccount(account.id);
      showToast(t("accounts.details.permanentlyDeleteSuccess"));
      router.replace(accountsListHref(getPersistedAccountsListFilter()));
    } catch (error) {
      logSupabaseError("deleteAccount", error);
      showToast(getSupabaseErrorMessage(error) || t("common.retry"));
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
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

  if (!account || !certificate || !metrics) {
    return (
      <>
        <ScreenHeader
          mode="stack"
          title={t("certificates.details.notFound")}
          onBack={() => router.back()}
        />
        <ScreenBody withTabBar={false}>
          <p className="text-muted-foreground">
            {t("certificates.details.notFoundDescription")}
          </p>
          <Button
            className="mt-4 h-11"
            onClick={() =>
              router.push(accountsListHref(getPersistedAccountsListFilter()))
            }
          >
            {t("accounts.title")}
          </Button>
        </ScreenBody>
      </>
    );
  }

  const statusKey = `certificates.status.${certificate.status}` as TranslationKey;
  const remainingValue = formatCertificateRemainingLabel(
    metrics.maturityDate,
    todayIsoDate(),
    t,
  );

  const destinationAccount = certificate.destinationAccountId
    ? accounts.find((item) => item.id === certificate.destinationAccountId) ?? null
    : null;

  const destinationDisplay = destinationAccount
    ? formatAccountDestinationDisplay(destinationAccount, t)
    : t("certificates.details.interestPayout.notSelected");

  const isArchived = account.status === "archived";
  const canProcessInterest = certificate.status === "active" && dueCount > 0;
  const isProcessingThisCertificate = isProcessingCertificateInterest(
    certificate.id,
  );

  const headerSubtitle = formatAccountDetailsHeaderSubtitle(
    account.type,
    certificate.certificateNumberLast4,
    t,
  );

  return (
    <>
      <AccountDetailsStackHeader
        accountName={account.name}
        onBack={() => router.back()}
      />
      <ScreenBody withTabBar={false} className="space-y-6" onRefresh={refresh}>
        <AccountDetailsContentHeader
          accountName={account.name}
          institution={account.institution}
          institutionSubtitle={headerSubtitle}
          accountType={account.type}
        />

        <WidgetCard elevated>
          <MetricHero
            label={t("certificates.details.principal")}
            amount={certificate.principalAmount}
            locale={formatLocale}
            amountSignMode="balance"
            meta={t("dashboard.netWorth.updated", {
              time: formatRelativeTime(account.updatedAt, t, formatLocale),
            })}
          />
        </WidgetCard>

        {canProcessInterest ? (
          <Button
            className="h-11 w-full"
            disabled={isProcessingThisCertificate}
            onClick={() => void handleProcessInterest()}
          >
            {isProcessingThisCertificate
              ? t("certificates.details.processInterest.processing")
              : t("certificates.details.processInterest.action")}
          </Button>
        ) : null}

        <section>
          <h2 className="mb-2 text-start text-lg font-semibold">
            {t("certificates.details.summary")}
          </h2>
          <div className="divide-y divide-border rounded-lg border border-border px-4">
            <DetailRow
              label={t("accounts.fields.annualRate.label")}
              value={`${certificate.annualInterestRate}%`}
            />
            <DetailRow
              label={t("certificates.details.purchaseDate")}
              value={formatDisplayDate(certificate.purchaseDate, formatLocale)}
            />
            <DetailRow
              label={t("certificates.details.maturityDate")}
              value={formatDisplayDate(metrics.maturityDate, formatLocale)}
            />
            <DetailRow
              label={t("certificates.details.remaining")}
              value={remainingValue}
            />
            <DetailRow label={t("certificates.details.status")} value={t(statusKey)} />
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-start text-lg font-semibold">
            {t("certificates.details.interestPayout.title")}
          </h2>
          <div className="divide-y divide-border rounded-lg border border-border px-4">
            <DetailRow
              label={t("certificates.details.interestPayout.totalExpected")}
              value={formatCurrency(scheduleSummary.totalExpectedInterest, formatLocale)}
            />
            <DetailRow
              label={t("certificates.details.interestPayout.frequency")}
              value={t(payoutFrequencyKey)}
            />
            <DetailRow
              label={t("accounts.fields.interestDestination.label")}
              value={destinationDisplay}
            />
          </div>
        </section>

        {!isArchived ? (
          <AccountDetailsSettingsSection
            title={t("accounts.details.settingsTitle")}
            editLabel={t("certificates.details.edit")}
            archiveLabel={t("certificates.details.archive")}
            archiveDisabled={archiving}
            onEdit={() => router.push(`/accounts/${account.id}/edit`)}
            onArchive={() => setShowArchiveConfirm(true)}
          >
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
          </AccountDetailsSettingsSection>
        ) : (
          <ArchivedAccountActions
            restoreLabel={t("accounts.details.restoreAccount")}
            restoreLoadingLabel={t("accounts.details.restoreRestoring")}
            deleteLabel={t("accounts.details.permanentlyDelete")}
            restoring={restoring}
            deleting={deleting}
            onRestore={handleRestore}
            onDelete={() => setShowDeleteConfirm(true)}
          />
        )}
      </ScreenBody>

      <ConfirmBottomSheet
        open={showDeleteConfirm}
        titleId="delete-certificate-title"
        icon="delete"
        title={t("accounts.details.permanentlyDeleteConfirm.title")}
        description={t("accounts.details.permanentlyDeleteConfirm.description")}
        confirmLabel={t("accounts.details.permanentlyDeleteConfirm.confirm")}
        confirmLoadingLabel={t("accounts.details.permanentlyDeleteConfirm.deleting")}
        cancelLabel={t("accounts.details.permanentlyDeleteConfirm.cancel")}
        confirmDisabled={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ConfirmBottomSheet
        open={showArchiveConfirm}
        titleId="archive-certificate-title"
        icon="archive"
        title={t("certificates.details.archiveConfirm.title")}
        description={t("certificates.details.archiveConfirm.description")}
        confirmLabel={t("certificates.details.archiveConfirm.confirm")}
        confirmLoadingLabel={t("certificates.details.archiveConfirm.archiving")}
        cancelLabel={t("certificates.details.archiveConfirm.cancel")}
        confirmDisabled={archiving}
        onConfirm={handleArchiveConfirm}
        onCancel={() => setShowArchiveConfirm(false)}
      />
    </>
  );
}
