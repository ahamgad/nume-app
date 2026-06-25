"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { AccountDetailsSection } from "@/components/accounts/account-details-section";
import {
  ACCOUNT_DETAILS_COMPACT_FIELD_ROW_CLASS,
  ACCOUNT_DETAILS_RECORD_SEPARATOR_MARGIN_CLASS,
  ACCOUNT_DETAILS_RECORDS_LIST_WRAPPER_CLASS,
  ACCOUNT_DETAILS_VIEW_ALL_BUTTON_MARGIN_TOP_CLASS,
} from "@/lib/layout/account-details-chrome";
import { FormSectionActionButton, RecordRow } from "@/components/patterns";
import {
  ACCOUNT_DETAILS_RECENT_RECORDS_LIMIT,
  shouldShowRecentRecordsSection,
} from "@/lib/finance/recent-records-display";
import type { FinanceRecord } from "@/lib/finance/types";
import { cn } from "@/lib/utils";
import { useT } from "@/providers/i18n-provider";

interface RecentRecordsSectionProps {
  accountId: string;
  records: FinanceRecord[];
  totalRecordCount: number;
  isArchived?: boolean;
  formatLocale: string;
  recordLabel: (record: FinanceRecord) => string;
  recordAmount: (record: FinanceRecord) => number;
  recordSubline?: (record: FinanceRecord) => string | null;
  recordDate: (record: FinanceRecord) => string;
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
  recordSubline,
  recordDate,
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
      fieldRowClassName={
        totalRecordCount === 0
          ? ACCOUNT_DETAILS_COMPACT_FIELD_ROW_CLASS
          : ACCOUNT_DETAILS_RECORDS_LIST_WRAPPER_CLASS
      }
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
        <div>
          {records.map((record, index) => (
            <div key={record.id}>
              {index > 0 ? (
                <div
                  role="separator"
                  aria-hidden
                  className={cn(
                    "border-t border-border",
                    ACCOUNT_DETAILS_RECORD_SEPARATOR_MARGIN_CLASS,
                  )}
                />
              ) : null}
              <RecordRow
                className="min-h-0 py-0"
                label={recordLabel(record)}
                amount={recordAmount(record)}
                formatLocale={formatLocale}
                subline={recordSubline?.(record)}
                date={recordDate(record)}
                icon={recordIcon(record)}
                onClick={onRecordClick ? () => onRecordClick(record) : undefined}
              />
            </div>
          ))}
          {showViewAll ? (
            <FormSectionActionButton
              className={ACCOUNT_DETAILS_VIEW_ALL_BUTTON_MARGIN_TOP_CLASS}
              label={t("accounts.details.records.viewAll")}
              onClick={() => router.push(`/accounts/${accountId}/records`)}
            />
          ) : null}
        </div>
      )}
    </AccountDetailsSection>
  );
}
