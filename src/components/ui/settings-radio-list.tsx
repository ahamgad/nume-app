"use client";

import { cn } from "@/lib/utils";

export interface SettingsRadioOption<T extends string> {
  value: T;
  label: string;
}

interface SettingsRadioListProps<T extends string> {
  name: string;
  value: T;
  options: SettingsRadioOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
}

export function SettingsRadioList<T extends string>({
  name,
  value,
  options,
  onChange,
  ariaLabel,
  className,
}: SettingsRadioListProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("overflow-hidden rounded-lg border border-border", className)}
    >
      {options.map((option, index) => {
        const selected = value === option.value;

        return (
          <label
            key={option.value}
            className={cn(
              "flex min-h-11 cursor-pointer items-center gap-3 px-4 py-3 transition-colors",
              index > 0 && "border-t border-border",
              selected ? "bg-muted/40" : "hover:bg-muted/25",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selected}
              onChange={() => onChange(option.value)}
              className="size-4 shrink-0 accent-foreground"
            />
            <span className="text-[0.9375rem] font-medium">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}
