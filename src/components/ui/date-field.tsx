"use client";

import { CalendarDays, ChevronDown } from "lucide-react";
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
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);

    return (
      <>
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
            <span className="truncate">
              {value ? formatDisplayDate(value, locale) : placeholder}
            </span>
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>

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
