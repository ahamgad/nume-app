"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

import { PickerBottomSheet } from "@/components/ui/picker-bottom-sheet";
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

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
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
        )}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

      <PickerBottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={label}
        titleId={`${id ?? "renewal-type"}-picker-title`}
      >
        <div role="listbox" aria-label={label}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                "flex min-h-11 w-full items-center rounded-md px-3 py-2 text-start text-[0.9375rem] transition-colors",
                value === option.value ? "bg-muted font-medium" : "hover:bg-muted/60",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </PickerBottomSheet>
    </div>
  );
}
