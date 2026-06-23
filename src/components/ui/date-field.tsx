"use client";

import { CalendarDays } from "lucide-react";
import * as React from "react";

import {
  InputField,
  InputFieldRowTrigger,
  InputFieldValue,
} from "@/components/forms/input-field";
import { DatePickerBottomSheet } from "@/components/ui/date-picker-bottom-sheet";
import { inputClassName } from "@/components/ui/input";
import { CardChevron } from "@/components/ui/card-chevron";
import { formatDisplayDate } from "@/lib/format/date";
import { cn } from "@/lib/utils";

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
  error?: string;
  required?: boolean;
  hideLabel?: boolean;
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
      error,
      required = false,
      hideLabel = false,
      variant = "input",
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const hasValue = Boolean(value);
    const displayText = hasValue
      ? formatDisplayDate(value, locale)
      : (placeholder ?? "");

    const rowTrigger = (
      <InputFieldRowTrigger
        ref={ref}
        id={id}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={ariaInvalid || error ? true : undefined}
        aria-describedby={error && id ? `${id}-error` : undefined}
        onClick={() => setOpen(true)}
        className={cn(
          "tabular-nums",
          disabled && "pointer-events-none opacity-50",
          className,
        )}
      >
        <InputFieldValue isPlaceholder={!hasValue}>{displayText}</InputFieldValue>
      </InputFieldRowTrigger>
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
          !hasValue && "text-muted-foreground",
          disabled && "pointer-events-none",
          ariaInvalid && "border-destructive ring-destructive/20",
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{displayText}</span>
        </span>
        <CardChevron />
      </button>
    );

    const trigger = variant === "row" ? rowTrigger : inputTrigger;

    if (label) {
      return (
        <>
          <InputField
            id={id}
            label={label}
            required={required}
            error={error}
            hideLabel={hideLabel}
          >
            {trigger}
          </InputField>

          <DatePickerBottomSheet
            open={open}
            onClose={() => setOpen(false)}
            value={value}
            onChange={onChange}
            title={label}
          />
        </>
      );
    }

    return (
      <>
        {trigger}

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
