"use client";

import { arEG, enGB } from "date-fns/locale";
import { useMemo, useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import {
  SELECTION_SHEET_HEADER_HEIGHT_PX,
  SelectionBottomSheet,
} from "@/components/ui/selection-bottom-sheet";
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

interface DatePickerCalendarProps {
  value: string;
  maxDate: string;
  locale: "en" | "ar";
  onChange: (value: string) => void;
  onClose: () => void;
}

/** Six week rows + caption — keeps sheet height stable across months. */
const CALENDAR_GRID_MIN_HEIGHT_PX =
  SELECTION_SHEET_HEADER_HEIGHT_PX + 40 + 6 * 40 + 24;

function DatePickerCalendar({
  value,
  maxDate,
  locale,
  onChange,
  onClose,
}: DatePickerCalendarProps) {
  const dayPickerLocale = locale === "ar" ? arEG : enGB;
  const maxDateValue = useMemo(() => parseIsoDate(maxDate), [maxDate]);
  const selectedDate = useMemo(
    () => (value ? parseIsoDate(value) : undefined),
    [value],
  );
  const startMonth = useMemo(
    () => new Date(maxDateValue.getFullYear() - 100, 0),
    [maxDateValue],
  );
  const initialMonth = selectedDate ?? maxDateValue;
  const [visibleMonth, setVisibleMonth] = useState(initialMonth);

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    onChange(toIsoDate(date));
    onClose();
  }

  return (
    <div
      className="flex justify-center px-2"
      style={{
        minHeight: CALENDAR_GRID_MIN_HEIGHT_PX,
        paddingBottom: SELECTION_SHEET_HEADER_HEIGHT_PX,
      }}
    >
      <Calendar
        mode="single"
        fixedWeeks
        captionLayout="dropdown"
        navLayout="after"
        locale={dayPickerLocale}
        selected={selectedDate}
        month={visibleMonth}
        onMonthChange={setVisibleMonth}
        startMonth={startMonth}
        endMonth={maxDateValue}
        onSelect={handleSelect}
        disabled={{ after: maxDateValue }}
        className="w-full [--cell-size:2.5rem]"
      />
    </div>
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
  const locale = useLocale();
  const sheetTitle = title ?? t("common.datePicker.title");

  return (
    <SelectionBottomSheet
      open={open}
      onClose={onClose}
      ariaLabelledBy="date-picker-title"
      header={
        <h2 id="date-picker-title" className="text-base font-semibold">
          {sheetTitle}
        </h2>
      }
    >
      <DatePickerCalendar
        key={`${value}-${maxDate}`}
        value={value}
        maxDate={maxDate}
        locale={locale}
        onChange={onChange}
        onClose={onClose}
      />
    </SelectionBottomSheet>
  );
}
