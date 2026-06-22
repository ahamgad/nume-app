"use client";

import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { PickerBottomSheet } from "@/components/ui/picker-bottom-sheet";
import { PickerList, PickerListOption } from "@/components/ui/picker-list";
import { inputClassName } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <div
          id={id}
          className={cn(
            inputClassName,
            "flex items-center text-[0.9375rem] text-foreground opacity-80",
          )}
        >
          {displayLabel}
        </div>
      </div>
    );
  }

  const triggerLabel = (
    <span
      className={cn(
        "min-w-0 flex-1 truncate text-[0.9375rem] font-medium",
        error && "text-destructive",
      )}
    >
      {displayLabel}
    </span>
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {variant === "row" ? (
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onClick={() => isInteractive && setOpen(true)}
          className={cn(
            "flex min-h-12 w-full items-center gap-3 text-start transition-colors",
            !isInteractive && "pointer-events-none opacity-60",
          )}
        >
          {triggerLabel}
          <ChevronRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" />
        </button>
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
          {triggerLabel}
          <ChevronRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" />
        </button>
      )}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-sm text-destructive">
          {error}
        </p>
      ) : null}

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
              selected={value === option.value}
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
    </div>
  );
}
