"use client";

import type { ReactNode } from "react";

import { RecordRow } from "@/components/patterns";
import { shouldShowRecentRecordsSection } from "@/lib/finance/recent-records-display";
import type { FinanceRecord } from "@/lib/finance/types";
import { useT } from "@/providers/i18n-provider";

interface RecentRecordsSectionProps {
  records: FinanceRecord[];
  isArchived?: boolean;
  formatLocale: string;
  recordLabel: (record: FinanceRecord) => string;
  recordAmount: (record: FinanceRecord) => string;
  recordMeta: (record: FinanceRecord) => string;
  recordIcon: (record: FinanceRecord) => ReactNode;
  onRecordClick?: (record: FinanceRecord) => void;
}

export function RecentRecordsSection({
  records,
  isArchived = false,
  formatLocale: _formatLocale,
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
    <section>
      <h2 className="mb-2 text-start text-lg font-semibold">
        {t("accounts.details.records.title")}
      </h2>
      {records.length === 0 ? (
        <div className="rounded-lg border border-border px-4 py-4">
          <p className="text-[0.9375rem] font-medium">
            {t("accounts.details.records.emptyTitle")}
          </p>
          <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
            {t("accounts.details.records.emptyDescription")}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border px-4">
          {records.map((record) => (
            <RecordRow
              key={record.id}
              label={recordLabel(record)}
              amount={recordAmount(record)}
              meta={recordMeta(record)}
              icon={recordIcon(record)}
              onClick={
                onRecordClick ? () => onRecordClick(record) : undefined
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
