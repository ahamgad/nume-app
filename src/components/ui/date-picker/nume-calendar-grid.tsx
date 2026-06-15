"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
  type Locale,
} from "date-fns";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

import { SCREEN_HEADER_ICON_CLASS } from "@/components/layout/screen-header";
import { parseIsoDate, toIsoDate } from "@/lib/format/date";
import { CALENDAR_WEEK_ROWS } from "@/lib/layout/date-picker-sheet";
import { cn } from "@/lib/utils";
import { useT } from "@/providers/i18n-provider";

interface NumeCalendarGridProps {
  visibleMonth: Date;
  selectedIsoDate: string | null;
  maxDate: string;
  locale: Locale;
  onVisibleMonthChange: (month: Date) => void;
  onSelectDate: (isoDate: string) => void;
  onOpenMonthYearPicker: () => void;
}

export function NumeCalendarGrid({
  visibleMonth,
  selectedIsoDate,
  maxDate,
  locale,
  onVisibleMonthChange,
  onSelectDate,
  onOpenMonthYearPicker,
}: NumeCalendarGridProps) {
  const t = useT();
  const maxDateValue = useMemo(() => parseIsoDate(maxDate), [maxDate]);
  const selectedDate = useMemo(
    () => (selectedIsoDate ? parseIsoDate(selectedIsoDate) : undefined),
    [selectedIsoDate],
  );

  const monthLabel = format(visibleMonth, "MMMM yyyy", { locale });
  const weekStartsOn = locale.options?.weekStartsOn ?? 1;

  const weekdayLabels = useMemo(() => {
    const anchor = startOfWeek(new Date(2024, 0, 7), { weekStartsOn, locale });
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(anchor);
      day.setDate(anchor.getDate() + index);
      return format(day, "EEE", { locale });
    });
  }, [locale, weekStartsOn]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(visibleMonth);
    const monthEnd = endOfMonth(visibleMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn, locale });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn, locale });
    const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
    const targetCells = CALENDAR_WEEK_ROWS * 7;

    if (days.length >= targetCells) {
      return days.slice(0, targetCells);
    }

    const padded = [...days];
    while (padded.length < targetCells) {
      const last = padded[padded.length - 1];
      padded.push(new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1));
    }
    return padded;
  }, [locale, visibleMonth, weekStartsOn]);

  const canGoNext =
    visibleMonth.getFullYear() < maxDateValue.getFullYear() ||
    (visibleMonth.getFullYear() === maxDateValue.getFullYear() &&
      visibleMonth.getMonth() < maxDateValue.getMonth());

  const minMonth = useMemo(
    () => new Date(maxDateValue.getFullYear() - 100, 0, 1),
    [maxDateValue],
  );

  const canGoPrevious =
    visibleMonth.getFullYear() > minMonth.getFullYear() ||
    (visibleMonth.getFullYear() === minMonth.getFullYear() &&
      visibleMonth.getMonth() > minMonth.getMonth());

  function handlePreviousMonth() {
    if (!canGoPrevious) return;
    onVisibleMonthChange(subMonths(visibleMonth, 1));
  }

  function handleNextMonth() {
    if (!canGoNext) return;
    onVisibleMonthChange(addMonths(visibleMonth, 1));
  }

  function isDateDisabled(date: Date) {
    return isAfter(date, maxDateValue);
  }

  return (
    <div className="flex flex-col px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4">
      <div className="mb-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onOpenMonthYearPicker}
          className="inline-flex min-w-0 items-center gap-1.5 rounded-md py-2 text-start"
          aria-label={t("common.datePicker.openMonthYear")}
        >
          <span className="truncate text-2xl font-semibold tracking-tight">
            {monthLabel}
          </span>
          <ChevronDown className="size-5 shrink-0 text-muted-foreground" />
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={handlePreviousMonth}
            disabled={!canGoPrevious}
            className="inline-flex size-11 items-center justify-center rounded-md text-foreground disabled:opacity-40"
            aria-label={t("common.datePicker.previousMonth")}
          >
            <ChevronLeft className={cn(SCREEN_HEADER_ICON_CLASS, "rtl:rotate-180")} />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            disabled={!canGoNext}
            className="inline-flex size-11 items-center justify-center rounded-md text-foreground disabled:opacity-40"
            aria-label={t("common.datePicker.nextMonth")}
          >
            <ChevronRight className={cn(SCREEN_HEADER_ICON_CLASS, "rtl:rotate-180")} />
          </button>
        </div>
      </div>

      <div
        key={`${visibleMonth.getFullYear()}-${visibleMonth.getMonth()}`}
        className="animate-in fade-in-0 duration-200"
      >
        <div className="mb-3 grid grid-cols-7 gap-1">
          {weekdayLabels.map((label) => (
            <div
              key={label}
              className="flex h-10 items-center justify-center text-sm font-medium text-muted-foreground"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const disabled = isDateDisabled(day);
            const selected = selectedDate ? isSameDay(day, selectedDate) : false;
            const inMonth = isSameMonth(day, visibleMonth);
            const today = isToday(day);

            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={disabled}
                onClick={() => onSelectDate(toIsoDate(day))}
                className={cn(
                  "flex size-11 items-center justify-center rounded-full text-base font-medium transition-colors",
                  !inMonth && "text-muted-foreground/60",
                  disabled && "opacity-40",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : today
                      ? "bg-muted text-foreground ring-1 ring-border"
                      : "text-foreground active:bg-muted",
                )}
                aria-label={format(day, "PPPP", { locale })}
                aria-pressed={selected}
              >
                {format(day, "d", { locale })}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
