"use client";

import { CalendarDays, ChevronRight } from "lucide-react";
import * as React from "react";

import { DatePickerBottomSheet } from "@/components/ui/date-picker-bottom-sheet";
import { formatDisplayDate } from "@/lib/format/date";
import { cn } from "@/lib/utils";

import { inputClassName } from "@/components/ui/input";

export interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
  locale?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-invalid"?: boolean;
  label?: string;
  placeholder?: string;
  variant?: "input" | "row";
}

export const DateField = React.forwardRef<HTMLButtonElement, DateFieldProps>(
  (
    {
      className,
      value,
      onChange,
      locale = "en-GB",
      disabled,
      id,
      "aria-invalid": ariaInvalid,
      label,
      placeholder,
      variant = "input",
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const displayText = value ? formatDisplayDate(value, locale) : placeholder;

    const rowTrigger = (
      <button
        ref={ref}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen(true)}
        className={cn(
          "flex min-h-12 w-full items-center gap-3 text-start transition-colors tabular-nums",
          !value && "text-muted-foreground",
          disabled && "pointer-events-none opacity-50",
          ariaInvalid && "text-destructive",
          className,
        )}
      >
        <span className="min-w-0 flex-1 truncate text-[0.9375rem] font-medium">
          {displayText}
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" />
      </button>
    );

    const inputTrigger = (
      <button
        ref={ref}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen(true)}
        className={cn(
          inputClassName,
          "flex items-center justify-between gap-2 text-start tabular-nums",
          !value && "text-muted-foreground",
          disabled && "pointer-events-none",
          ariaInvalid && "border-destructive ring-destructive/20",
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{displayText}</span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" />
      </button>
    );

    return (
      <>
        {variant === "row" ? rowTrigger : inputTrigger}

        <DatePickerBottomSheet
          open={open}
          onClose={() => setOpen(false)}
          value={value}
          onChange={onChange}
          title={label}
        />
      </>
    );
  },
);

DateField.displayName = "DateField";
