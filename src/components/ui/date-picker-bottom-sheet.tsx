"use client";

import { arEG, enGB } from "date-fns/locale";
import { useMemo, useState } from "react";

import { NumeCalendarGrid } from "@/components/ui/date-picker/nume-calendar-grid";
import { NumeMonthYearPicker } from "@/components/ui/date-picker/nume-month-year-picker";
import { ImmersiveBottomSheet } from "@/components/ui/immersive-bottom-sheet";
import { parseIsoDate, todayIsoDate } from "@/lib/format/date";
import { cn } from "@/lib/utils";
import { useLocale, useT } from "@/providers/i18n-provider";

interface DatePickerBottomSheetProps {
  open: boolean;
  onClose: () => void;
  value: string;
  onChange: (value: string) => void;
  title?: string;
  maxDate?: string;
}

type DatePickerView = "grid" | "month-year";

interface DatePickerSheetContentProps {
  value: string;
  maxDate: string;
  title: string;
  onClose: () => void;
  onChange: (value: string) => void;
}

function DatePickerSheetContent({
  value,
  maxDate,
  title,
  onClose,
  onChange,
}: DatePickerSheetContentProps) {
  const t = useT();
  const localeCode = useLocale();
  const dayPickerLocale = localeCode === "ar" ? arEG : enGB;

  const initialMonth = useMemo(
    () => parseIsoDate(value || maxDate),
    [maxDate, value],
  );

  const [draftDate, setDraftDate] = useState<string | null>(value || null);
  const [visibleMonth, setVisibleMonth] = useState(initialMonth);
  const [view, setView] = useState<DatePickerView>("grid");

  function handleDismiss() {
    onClose();
  }

  function handleConfirm() {
    if (!draftDate) return;
    onChange(draftDate);
    onClose();
  }

  function handleSelectDate(isoDate: string) {
    setDraftDate(isoDate);
    setVisibleMonth(parseIsoDate(isoDate));
  }

  function handleMonthYearChange(month: Date) {
    setVisibleMonth(month);
  }

  return (
    <ImmersiveBottomSheet
      title={title}
      onDismiss={handleDismiss}
      onConfirm={handleConfirm}
      confirmAriaLabel={t("fieldEditor.confirm")}
      confirmDisabled={!draftDate}
      ariaLabel={title}
      bodyClassName="min-h-0"
    >
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          className={cn(
            "absolute inset-0 flex min-h-0 flex-col transition-opacity duration-200",
            view === "grid"
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0",
          )}
        >
          <NumeCalendarGrid
            visibleMonth={visibleMonth}
            selectedIsoDate={draftDate}
            maxDate={maxDate}
            locale={dayPickerLocale}
            onVisibleMonthChange={setVisibleMonth}
            onSelectDate={handleSelectDate}
            onOpenMonthYearPicker={() => setView("month-year")}
          />
        </div>

        <div
          className={cn(
            "absolute inset-0 flex min-h-0 flex-col transition-opacity duration-200",
            view === "month-year"
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0",
          )}
        >
          <NumeMonthYearPicker
            visibleMonth={visibleMonth}
            maxDate={maxDate}
            locale={dayPickerLocale}
            monthYearExpanded
            onMonthYearChange={handleMonthYearChange}
            onCloseMonthYearPicker={() => setView("grid")}
          />
        </div>
      </div>
    </ImmersiveBottomSheet>
  );
}

export function DatePickerBottomSheet({
  open,
  onClose,
  value,
  onChange,
  title,
  maxDate = todayIsoDate(),
}: DatePickerBottomSheetProps) {
  const t = useT();
  const sheetTitle = title ?? t("common.datePicker.title");

  if (!open) return null;

  return (
    <DatePickerSheetContent
      key={`${value}-${maxDate}`}
      value={value}
      maxDate={maxDate}
      title={sheetTitle}
      onClose={onClose}
      onChange={onChange}
    />
  );
}
