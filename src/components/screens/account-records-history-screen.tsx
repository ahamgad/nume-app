"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AccountDetailsStackHeader } from "@/components/accounts/account-details-chrome";
import { RecordTypeIcon } from "@/components/finance/record-type-icon";
import { ScreenBody } from "@/components/layout/screen-header";
import { RecordRow } from "@/components/patterns";
import {
  ScrollChipSelect,
  type ScrollChipOption,
} from "@/components/ui/scroll-chip-select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDisplayDate } from "@/lib/format/date";
import {
  filterRecordsByMonth,
  type RecordMonthFilter,
} from "@/lib/finance/record-month-filter";
import type { FinanceRecord } from "@/lib/finance/types";
import { CARD_SURFACE_CLASS } from "@/lib/layout/card-surface";
import { ACCOUNT_FORM_SECTION_PADDING_CLASS } from "@/lib/layout/account-form-chrome";
import { useFinance } from "@/lib/finance/store";
import { cn } from "@/lib/utils";
import { useT, useFormatLocale } from "@/providers/i18n-provider";

function recordLabel(record: FinanceRecord, t: ReturnType<typeof useT>) {
  if (record.description) return record.description;
  return t(`records.types.${record.type}`);
}

interface AccountRecordsHistoryScreenProps {
  accountId: string;
}

export function AccountRecordsHistoryScreen({
  accountId,
}: AccountRecordsHistoryScreenProps) {
  const t = useT();
  const formatLocale = useFormatLocale();
  const router = useRouter();
  const { getAccount, getAccountRecords, isFinanceReady } = useFinance();
  const [monthFilter, setMonthFilter] = useState<RecordMonthFilter>("this_month");

  const account = getAccount(accountId);
  const allRecords = getAccountRecords(accountId);

  const filterOptions = useMemo(
    (): ScrollChipOption<RecordMonthFilter>[] => [
      { value: "this_month", label: t("accounts.recordsHistory.filters.thisMonth") },
      { value: "last_month", label: t("accounts.recordsHistory.filters.lastMonth") },
    ],
    [t],
  );

  const filteredRecords = useMemo(
    () => filterRecordsByMonth(allRecords, monthFilter),
    [allRecords, monthFilter],
  );

  if (!isFinanceReady) {
    return (
      <>
        <AccountDetailsStackHeader accountName="" onBack={() => router.back()} />
        <ScreenBody withTabBar={false} className="space-y-4">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </ScreenBody>
      </>
    );
  }

  if (!account) {
    return (
      <>
        <AccountDetailsStackHeader
          accountName={t("accounts.details.notFound")}
          onBack={() => router.back()}
        />
        <ScreenBody withTabBar={false}>
          <p className="text-muted-foreground">
            {t("accounts.details.notFoundDescription")}
          </p>
        </ScreenBody>
      </>
    );
  }

  return (
    <>
      <AccountDetailsStackHeader
        accountName={account.name}
        onBack={() => router.back()}
      />
      <ScreenBody withTabBar={false} className="space-y-4">
        <ScrollChipSelect
          value={monthFilter}
          options={filterOptions}
          onChange={setMonthFilter}
          ariaLabel={t("accounts.recordsHistory.filters.label")}
          emphasis="secondary"
          chipSurface="canvas"
        />

        <div className="space-y-3">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className={cn(CARD_SURFACE_CLASS, ACCOUNT_FORM_SECTION_PADDING_CLASS)}
            >
              <RecordRow
                className="min-h-0 py-0"
                label={recordLabel(record, t)}
                amount={record.amount}
                formatLocale={formatLocale}
                meta={formatDisplayDate(record.date, formatLocale)}
                icon={<RecordTypeIcon type={record.type} />}
              />
            </div>
          ))}
        </div>
      </ScreenBody>
    </>
  );
}
