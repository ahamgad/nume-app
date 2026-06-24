"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { AccountDetailsSection } from "@/components/accounts/account-details-section";
import { ACCOUNT_DETAILS_COMPACT_FIELD_ROW_CLASS } from "@/lib/layout/account-details-chrome";
import { RecordRow } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import {
  ACCOUNT_DETAILS_RECENT_RECORDS_LIMIT,
  shouldShowRecentRecordsSection,
} from "@/lib/finance/recent-records-display";
import type { FinanceRecord } from "@/lib/finance/types";
import { useT } from "@/providers/i18n-provider";

interface RecentRecordsSectionProps {
  accountId: string;
  records: FinanceRecord[];
  totalRecordCount: number;
  isArchived?: boolean;
  formatLocale: string;
  recordLabel: (record: FinanceRecord) => string;
  recordAmount: (record: FinanceRecord) => number;
  recordMeta: (record: FinanceRecord) => string;
  recordIcon: (record: FinanceRecord) => ReactNode;
  onRecordClick?: (record: FinanceRecord) => void;
}

export function RecentRecordsSection({
  accountId,
  records,
  totalRecordCount,
  isArchived = false,
  formatLocale,
  recordLabel,
  recordAmount,
  recordMeta,
  recordIcon,
  onRecordClick,
}: RecentRecordsSectionProps) {
  const t = useT();
  const router = useRouter();

  if (!shouldShowRecentRecordsSection(isArchived, totalRecordCount)) {
    return null;
  }

  const showViewAll = totalRecordCount > ACCOUNT_DETAILS_RECENT_RECORDS_LIMIT;

  return (
    <AccountDetailsSection
      title={t("accounts.details.records.title")}
      fieldRowClassName={ACCOUNT_DETAILS_COMPACT_FIELD_ROW_CLASS}
    >
      {totalRecordCount === 0 ? (
        <div>
          <p className="text-[0.9375rem] font-medium">
            {t("accounts.details.records.emptyTitle")}
          </p>
          <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
            {t("accounts.details.records.emptyDescription")}
          </p>
        </div>
      ) : (
        <>
          {records.map((record) => (
            <RecordRow
              key={record.id}
              className="min-h-0 py-0"
              label={recordLabel(record)}
              amount={recordAmount(record)}
              formatLocale={formatLocale}
              meta={recordMeta(record)}
              icon={recordIcon(record)}
              onClick={onRecordClick ? () => onRecordClick(record) : undefined}
            />
          ))}
          {showViewAll ? (
            <Button
              type="button"
              variant="secondary"
              className="mt-2 w-full"
              onClick={() => router.push(`/accounts/${accountId}/records`)}
            >
              {t("accounts.details.records.viewAll")}
            </Button>
          ) : null}
        </>
      )}
    </AccountDetailsSection>
  );
}
