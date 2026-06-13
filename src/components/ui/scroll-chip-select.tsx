"use client";

import { cn } from "@/lib/utils";

export interface ScrollChipOption<T extends string | number> {
  value: T;
  label: string;
  disabled?: boolean;
  hint?: string;
}

interface ScrollChipSelectProps<T extends string | number> {
  value: T;
  options: ScrollChipOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
}

export function ScrollChipSelect<T extends string | number>({
  value,
  options,
  onChange,
  ariaLabel,
  className,
}: ScrollChipSelectProps<T>) {
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
              "inline-flex shrink-0 items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              selected
                ? "border-foreground/25 bg-muted text-foreground"
                : "border-border bg-background text-foreground",
              disabled && "cursor-not-allowed opacity-45",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
