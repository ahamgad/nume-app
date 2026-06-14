"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface ScrollChipOption<T extends string | number> {
  value: T;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  hint?: string;
}

interface ScrollChipSelectProps<T extends string | number> {
  value: T;
  options: ScrollChipOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
  /**
   * Global chip default rule (NUME v1): when enabled, selects the first
   * non-disabled option if the current value is missing or disabled.
   * See `resolveDefaultChipValue` in this module.
   */
  defaultToFirstOption?: boolean;
  /** Primary chips for high-emphasis decisions (e.g. Add Account type). */
  emphasis?: "primary" | "secondary";
}

/** Shared rule for horizontal chip selectors — first enabled chip wins when unset. */
export function resolveDefaultChipValue<T extends string | number>(
  value: T | null | undefined,
  options: ScrollChipOption<T>[],
): T | null {
  const firstEnabled = options.find((option) => !option.disabled);
  if (!firstEnabled) return null;

  const hasValidSelection = options.some(
    (option) => option.value === value && !option.disabled,
  );
  if (value === null || value === undefined || !hasValidSelection) {
    return firstEnabled.value;
  }
  return value;
}

export function ScrollChipSelect<T extends string | number>({
  value,
  options,
  onChange,
  ariaLabel,
  className,
  defaultToFirstOption = true,
  emphasis = "secondary",
}: ScrollChipSelectProps<T>) {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!defaultToFirstOption) return;
    const resolved = resolveDefaultChipValue(value, options);
    if (resolved !== null && resolved !== value) {
      onChangeRef.current(resolved);
    }
  }, [defaultToFirstOption, value, options]);

  return (
    <div
      role="listbox"
      aria-label={ariaLabel}
      className={cn(
        "-mx-4 flex gap-2 overflow-x-auto px-4 pb-1",
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        const disabled = option.disabled ?? false;

        return (
          <button
            key={String(option.value)}
            type="button"
            role="option"
            aria-selected={selected}
            aria-disabled={disabled}
            disabled={disabled}
            title={disabled ? option.hint : undefined}
            onClick={() => {
              if (!disabled) onChange(option.value);
            }}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              emphasis === "primary"
                ? selected
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-foreground"
                : selected
                  ? "border-foreground/25 bg-muted text-foreground"
                  : "border-border bg-background text-foreground",
              disabled && "cursor-not-allowed opacity-45",
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
