"use client";

import type { BalanceSign } from "@/lib/field-editor/balance-sign";
import { chipButtonClassName } from "@/lib/layout/chip-chrome";

interface FieldSignToggleProps {
  value: BalanceSign;
  onChange: (sign: BalanceSign) => void;
  positiveLabel: string;
  negativeLabel: string;
  onAfterChange?: () => void;
}

export function FieldSignToggle({
  value,
  onChange,
  positiveLabel,
  negativeLabel,
  onAfterChange,
}: FieldSignToggleProps) {
  function handleSelect(sign: BalanceSign) {
    onChange(sign);
    onAfterChange?.();
  }

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
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => handleSelect(sign)}
            className={chipButtonClassName("canvas", selected)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
