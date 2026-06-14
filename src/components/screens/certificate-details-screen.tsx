"use client";

import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { MetricHero, ToggleSettingRow, WidgetCard } from "@/components/patterns";
import { AccountTypeBadge } from "@/components/ui/account-type-icon";
import { ConfirmBottomSheet } from "@/components/ui/confirm-bottom-sheet";
import { Button } from "@/components/ui/button";
import { formatAccountDestinationDisplay } from "@/lib/finance/account-display";
import { formatInstitutionDisplay } from "@/lib/institutions/catalog";
import { Skeleton } from "@/components/ui/skeleton";
import { computeCertificateMetrics } from "@/lib/certificates/certificate-engine";
import { formatCurrency } from "@/lib/format/currency";
import { formatDisplayDate } from "@/lib/format/date";
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
    updateCertificate,
    archiveCertificate,
    accounts,
    isFinanceReady,
    refresh,
  } = useFinance();

  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const account = getAccount(accountId);
  const certificate = getCertificateByAccountId(accountId);

  const metrics = useMemo(() => {
    if (!certificate) return null;
    return computeCertificateMetrics(certificate);
  }, [certificate]);

  const payoutFrequencyKey =
    `certificates.payoutFrequency.${certificate?.payoutFrequency}` as TranslationKey;

  async function handleArchiveConfirm() {
    if (!certificate) return;
    setArchiving(true);
    try {
      await archiveCertificate(certificate.id);
      showToast(t("certificates.details.archiveSuccess"));
      router.replace("/accounts");
    } catch (error) {
      logSupabaseError("archiveCertificate", error);
      showToast(getSupabaseErrorMessage(error) || t("common.retry"));
    } finally {
      setArchiving(false);
      setShowArchiveConfirm(false);
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
          onBack={() => router.push("/accounts")}
        />
        <ScreenBody withTabBar={false}>
          <p className="text-muted-foreground">
            {t("certificates.details.notFoundDescription")}
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

  const statusKey = `certificates.status.${certificate.status}` as TranslationKey;
  const remainingDaysValue =
    metrics.remainingDays === 1
      ? t("certificates.details.remainingDayCount")
      : t("certificates.details.remainingDaysCount", {
          count: metrics.remainingDays,
        });

  const nextPayoutLabel =
    certificate.payoutFrequency === "instantly"
      ? t("certificates.details.upfrontPayout")
      : t("certificates.details.nextPayoutDate");

  const nextPayoutValue =
    certificate.payoutFrequency === "instantly"
      ? formatDisplayDate(certificate.purchaseDate, formatLocale)
      : metrics.nextPayoutDate
        ? formatDisplayDate(metrics.nextPayoutDate, formatLocale)
        : t("certificates.details.noNextPayout");

  const destinationAccount = certificate.destinationAccountId
    ? accounts.find((item) => item.id === certificate.destinationAccountId) ?? null
    : null;

  const destinationDisplay = destinationAccount
    ? formatAccountDestinationDisplay(destinationAccount, t)
    : t("certificates.details.interestPayout.notSelected");

  return (
    <>
      <ScreenHeader
        mode="stack"
        title={account.name}
        onBack={() => router.push("/accounts")}
      />
      <ScreenBody withTabBar={false} className="space-y-6" onRefresh={refresh}>
        <div>
          {account.institution ? (
            <p className="text-[0.8125rem] text-muted-foreground">
              {formatInstitutionDisplay(account.institution, t)}
            </p>
          ) : null}
          <div className="mt-1 flex flex-wrap gap-2">
            <AccountTypeBadge type={account.type} />
            <span className="rounded-sm bg-muted px-2 py-1 text-xs text-muted-foreground">
              {t(statusKey)}
            </span>
          </div>
        </div>

        <WidgetCard>
          <MetricHero
            label={t("certificates.details.principal")}
            value={formatCurrency(certificate.principalAmount, formatLocale)}
          />
        </WidgetCard>

        <section>
          <h2 className="mb-2 text-start text-lg font-semibold">
            {t("certificates.details.summary")}
          </h2>
          <div className="divide-y divide-border rounded-lg border border-border px-4">
            <DetailRow
              label={t("certificates.details.rate")}
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
              label={t("certificates.details.remainingDays")}
              value={remainingDaysValue}
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
              label={t("certificates.details.interestPayout.frequency")}
              value={t(payoutFrequencyKey)}
            />
            <DetailRow
              label={t("certificates.details.interestPayout.destination")}
              value={destinationDisplay}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-start text-lg font-semibold">
            {t("certificates.details.outcomes")}
          </h2>
          <div className="divide-y divide-border rounded-lg border border-border px-4">
            <DetailRow
              label={t("certificates.details.expectedProfit")}
              value={formatCurrency(metrics.expectedProfit, formatLocale)}
            />
            <DetailRow
              label={t("certificates.details.expectedTotalReturn")}
              value={formatCurrency(metrics.expectedTotalReturn, formatLocale)}
            />
            <DetailRow label={nextPayoutLabel} value={nextPayoutValue} />
          </div>
        </section>

        <Button
          variant="outline"
          className="h-11 w-full"
          onClick={() => router.push(`/accounts/${account.id}/edit`)}
        >
          <Pencil className="me-2 size-4" />
          {t("certificates.details.edit")}
        </Button>

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
                void updateCertificate(certificate.id, {
                  includeInNetWorth: checked,
                })
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
                  void updateCertificate(certificate.id, {
                    includeInEmergencyFund: checked,
                  })
                }
              />
            </div>
          </div>
          <Button
            variant="outline"
            className="mt-4 h-11 w-full text-destructive hover:text-destructive"
            onClick={() => setShowArchiveConfirm(true)}
          >
            {t("certificates.details.archive")}
          </Button>
        </section>
      </ScreenBody>

      <ConfirmBottomSheet
        open={showArchiveConfirm}
        titleId="archive-certificate-title"
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
