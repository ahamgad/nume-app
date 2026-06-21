"use client";

import type { CSSProperties } from "react";

import {
  CURRENCY_DECIMAL_SCALE,
  getCurrencyDisplayParts,
} from "@/lib/format/currency";
import type { ResponsiveCurrencyVariant } from "@/lib/format/responsive-currency";
import { cn } from "@/lib/utils";

export type CurrencyAmountVariant = ResponsiveCurrencyVariant | "inline" | "detail";

interface CurrencyAmountProps {
  amount: number;
  locale: string;
  variant?: CurrencyAmountVariant;
  className?: string;
  style?: React.CSSProperties;
  showDecimals?: boolean;
}

const STATIC_VARIANT_CLASS: Partial<Record<CurrencyAmountVariant, string>> = {
  inline: "text-[0.9375rem] font-semibold",
  detail: "text-[0.9375rem] font-medium",
  row: "text-[0.9375rem] font-semibold",
};

export function CurrencyAmount({
  amount,
  locale,
  variant = "inline",
  className,
  style,
  showDecimals,
}: CurrencyAmountProps) {
  const parts = getCurrencyDisplayParts(amount, locale, { showDecimals });
  const staticClass = STATIC_VARIANT_CLASS[variant];

  return (
    <span
      className={cn(
        "inline-flex min-w-0 max-w-full items-baseline whitespace-nowrap tabular-nums tracking-tight leading-none",
        staticClass,
        className,
      )}
      style={style}
    >
      <span className="min-w-0 truncate">{parts.integerText}</span>
      {parts.hasDecimals ? (
        <span
          className="shrink-0"
          style={{ fontSize: `${CURRENCY_DECIMAL_SCALE}em` }}
        >
          {parts.decimalText}
        </span>
      ) : null}
      <span className="ms-1 shrink-0">{parts.symbol}</span>
    </span>
  );
}
