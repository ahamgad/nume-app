"use client";

import { format, type Locale } from "date-fns";
import { ChevronDown } from "lucide-react";
import { useMemo } from "react";

import { WheelColumn } from "@/components/ui/date-picker/wheel-column";
import { parseIsoDate } from "@/lib/format/date";
import { cn } from "@/lib/utils";
import { useT } from "@/providers/i18n-provider";

interface NumeMonthYearPickerProps {
  visibleMonth: Date;
  maxDate: string;
  locale: Locale;
  monthYearExpanded?: boolean;
  onMonthYearChange: (month: Date) => void;
  onCloseMonthYearPicker: () => void;
}

export function NumeMonthYearPicker({
  visibleMonth,
  maxDate,
  locale,
  monthYearExpanded = false,
  onMonthYearChange,
  onCloseMonthYearPicker,
}: NumeMonthYearPickerProps) {
  const t = useT();
  const maxDateValue = useMemo(() => parseIsoDate(maxDate), [maxDate]);
  const minYear = maxDateValue.getFullYear() - 100;
  const maxYear = maxDateValue.getFullYear();

  const monthLabel = format(visibleMonth, "MMMM yyyy", { locale });

  const years = useMemo(
    () =>
      Array.from({ length: maxYear - minYear + 1 }, (_, index) => minYear + index),
    [maxYear, minYear],
  );

  const months = useMemo(
    () => Array.from({ length: 12 }, (_, index) => index),
    [],
  );

  const selectedYearIndex = Math.max(
    0,
    years.indexOf(visibleMonth.getFullYear()),
  );
  const selectedMonthIndex = visibleMonth.getMonth();

  function handleYearSelect(index: number) {
    const year = years[index];
    const next = clampMonthYear(year, visibleMonth.getMonth(), maxDateValue);
    onMonthYearChange(next);
  }

  function handleMonthSelect(index: number) {
    const next = clampMonthYear(visibleMonth.getFullYear(), index, maxDateValue);
    onMonthYearChange(next);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pt-4">
        <button
          type="button"
          onClick={onCloseMonthYearPicker}
          className="inline-flex min-w-0 items-center gap-1.5 rounded-md py-2 text-start"
          aria-label={t("common.datePicker.backToCalendar")}
          aria-expanded={monthYearExpanded}
        >
          <span className="truncate text-2xl font-semibold tracking-tight">
            {monthLabel}
          </span>
          <ChevronDown className="size-5 shrink-0 rotate-180 text-muted-foreground" />
        </button>
      </div>

      <div
        className={cn(
          "flex gap-3 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-2",
          "flex-row rtl:flex-row-reverse",
        )}
      >
        <WheelColumn
          items={months}
          selectedIndex={selectedMonthIndex}
          onSelect={handleMonthSelect}
          getKey={(monthIndex) => `month-${monthIndex}`}
          renderLabel={(monthIndex) =>
            format(new Date(2024, monthIndex, 1), "MMMM", { locale })
          }
          ariaLabel={t("common.datePicker.selectMonth")}
        />
        <WheelColumn
          items={years}
          selectedIndex={selectedYearIndex}
          onSelect={handleYearSelect}
          getKey={(year) => `year-${year}`}
          renderLabel={(year) => String(year)}
          ariaLabel={t("common.datePicker.selectYear")}
        />
      </div>
    </div>
  );
}

function clampMonthYear(year: number, month: number, maxDate: Date): Date {
  const candidate = new Date(year, month, 1);
  const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
  if (candidate > maxMonth) return maxMonth;

  const minMonth = new Date(maxDate.getFullYear() - 100, 0, 1);
  if (candidate < minMonth) return minMonth;

  return candidate;
}
