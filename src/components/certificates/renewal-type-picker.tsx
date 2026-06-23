"use client";

import { useMemo, useState } from "react";

import {
  InputField,
  InputFieldRowTrigger,
  InputFieldValue,
} from "@/components/forms/input-field";
import { PickerBottomSheet } from "@/components/ui/picker-bottom-sheet";
import { PickerList, PickerListOption } from "@/components/ui/picker-list";
import { inputClassName } from "@/components/ui/input";
import { CardChevron } from "@/components/ui/card-chevron";
import type { RenewalType } from "@/lib/certificates/types";
import type { TranslationKey } from "@/lib/i18n";
import { useT } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";

export const RENEWAL_TYPE_OPTIONS: RenewalType[] = [
  "none",
  "renew_principal",
  "renew_principal_and_interest",
];

interface RenewalTypePickerProps {
  id?: string;
  label: string;
  value: RenewalType;
  disabled?: boolean;
  readOnly?: boolean;
  onChange: (value: RenewalType) => void;
  variant?: "input" | "row";
  error?: string;
  required?: boolean;
}

export function renewalTypeLabel(
  type: RenewalType,
  t: ReturnType<typeof useT>,
): string {
  return t(`certificates.renewalType.${type}` as TranslationKey);
}

export function RenewalTypePicker({
  id,
  label,
  value,
  disabled = false,
  readOnly = false,
  onChange,
  variant = "input",
  error,
  required = false,
}: RenewalTypePickerProps) {
  const t = useT();
  const [open, setOpen] = useState(false);

  const displayLabel = renewalTypeLabel(value, t);
  const isInteractive = !disabled && !readOnly;

  const options = useMemo(
    () =>
      RENEWAL_TYPE_OPTIONS.map((option) => ({
        value: option,
        label: renewalTypeLabel(option, t),
      })),
    [t],
  );

  if (readOnly) {
    return (
      <InputField id={id} label={label} required={required}>
        <div
          id={id}
          className={cn(
            inputClassName,
            "flex items-center text-[0.9375rem] text-foreground opacity-80",
          )}
        >
          {displayLabel}
        </div>
      </InputField>
    );
  }

  const triggerLabel = (
    <InputFieldValue>{displayLabel}</InputFieldValue>
  );

  const pickerControl =
    variant === "row" ? (
      <InputFieldRowTrigger
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onClick={() => isInteractive && setOpen(true)}
        className={!isInteractive ? "pointer-events-none opacity-60" : undefined}
      >
        {triggerLabel}
      </InputFieldRowTrigger>
    ) : (
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => isInteractive && setOpen(true)}
        className={cn(
          inputClassName,
          "flex items-center justify-between gap-2 text-start",
          !isInteractive && "pointer-events-none opacity-60",
          error && "border-destructive",
        )}
      >
        <span className="min-w-0 flex-1 truncate text-[0.9375rem] font-medium">
          {displayLabel}
        </span>
        <CardChevron />
      </button>
    );

  return (
    <InputField id={id} label={label} required={required} error={error}>
      {pickerControl}

      <PickerBottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={label}
        titleId={`${id ?? "renewal-type"}-picker-title`}
      >
        <PickerList ariaLabel={label}>
          {options.map((option) => (
            <PickerListOption
              key={option.value}
              selected={option.value === value}
              onSelect={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </PickerListOption>
          ))}
        </PickerList>
      </PickerBottomSheet>
    </InputField>
  );
}
