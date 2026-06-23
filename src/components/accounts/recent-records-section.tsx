"use client";

import type { ReactNode } from "react";

import { AccountDetailsSection } from "@/components/accounts/account-details-section";
import { ACCOUNT_DETAILS_COMPACT_FIELD_ROW_CLASS } from "@/lib/layout/account-details-chrome";
import { RecordRow } from "@/components/patterns";
import { shouldShowRecentRecordsSection } from "@/lib/finance/recent-records-display";
import type { FinanceRecord } from "@/lib/finance/types";
import { useT } from "@/providers/i18n-provider";

interface RecentRecordsSectionProps {
  records: FinanceRecord[];
  isArchived?: boolean;
  formatLocale: string;
  recordLabel: (record: FinanceRecord) => string;
  recordAmount: (record: FinanceRecord) => number;
  recordMeta: (record: FinanceRecord) => string;
  recordIcon: (record: FinanceRecord) => ReactNode;
  onRecordClick?: (record: FinanceRecord) => void;
}

export function RecentRecordsSection({
  records,
  isArchived = false,
  formatLocale,
  recordLabel,
  recordAmount,
  recordMeta,
  recordIcon,
  onRecordClick,
}: RecentRecordsSectionProps) {
  const t = useT();

  if (!shouldShowRecentRecordsSection(isArchived, records.length)) {
    return null;
  }

  return (
    <AccountDetailsSection
      title={t("accounts.details.records.title")}
      fieldRowClassName={ACCOUNT_DETAILS_COMPACT_FIELD_ROW_CLASS}
    >
      {records.length === 0 ? (
        <div>
          <p className="text-[0.9375rem] font-medium">
            {t("accounts.details.records.emptyTitle")}
          </p>
          <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
            {t("accounts.details.records.emptyDescription")}
          </p>
        </div>
      ) : (
        records.map((record) => (
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
        ))
      )}
    </AccountDetailsSection>
  );
}
