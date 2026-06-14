"use client";

import { arEG, enGB } from "date-fns/locale";
import { useMemo } from "react";

import { Calendar } from "@/components/ui/calendar";
import { SelectionBottomSheet } from "@/components/ui/selection-bottom-sheet";
import {
  parseIsoDate,
  todayIsoDate,
  toIsoDate,
} from "@/lib/format/date";
import { useLocale, useT } from "@/providers/i18n-provider";

interface DatePickerBottomSheetProps {
  open: boolean;
  onClose: () => void;
  value: string;
  onChange: (value: string) => void;
  title?: string;
  maxDate?: string;
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
  const locale = useLocale();
  const sheetTitle = title ?? t("common.datePicker.title");
  const dayPickerLocale = locale === "ar" ? arEG : enGB;
  const maxDateValue = useMemo(() => parseIsoDate(maxDate), [maxDate]);
  const selectedDate = useMemo(
    () => (value ? parseIsoDate(value) : undefined),
    [value],
  );

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    onChange(toIsoDate(date));
    onClose();
  }

  return (
    <SelectionBottomSheet
      open={open}
      onClose={onClose}
      defaultHalfSize="large"
      ariaLabelledBy="date-picker-title"
      header={
        <h2 id="date-picker-title" className="text-base font-semibold">
          {sheetTitle}
        </h2>
      }
    >
      <div className="flex justify-center px-2 pb-4">
        <Calendar
          mode="single"
          locale={dayPickerLocale}
          selected={selectedDate}
          defaultMonth={selectedDate ?? maxDateValue}
          onSelect={handleSelect}
          disabled={{ after: maxDateValue }}
          className="w-full [--cell-size:2.5rem]"
        />
      </div>
    </SelectionBottomSheet>
  );
}
