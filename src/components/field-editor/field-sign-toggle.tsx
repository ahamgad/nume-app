"use client";

import type { BalanceSign } from "@/lib/field-editor/balance-sign";
import { cn } from "@/lib/utils";

interface FieldSignToggleProps {
  value: BalanceSign;
  onChange: (sign: BalanceSign) => void;
  positiveLabel: string;
  negativeLabel: string;
}

export function FieldSignToggle({
  value,
  onChange,
  positiveLabel,
  negativeLabel,
}: FieldSignToggleProps) {
  return (
    <div
      className="flex justify-center gap-2"
      role="group"
      aria-label={`${positiveLabel} / ${negativeLabel}`}
    >
      {(["positive", "negative"] as const).map((sign) => {
        const selected = value === sign;
        const label = sign === "positive" ? positiveLabel : negativeLabel;
        return (
          <button
            key={sign}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(sign)}
            className={cn(
              "inline-flex min-h-9 min-w-[4.5rem] items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors",
              selected
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
