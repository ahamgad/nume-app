"use client";

import type { CSSProperties } from "react";

import {
  CURRENCY_DECIMAL_SCALE,
  getCurrencyDisplayParts,
} from "@/lib/format/currency";
import type { CurrencySignMode } from "@/lib/format/currency-display";
import type { ResponsiveCurrencyVariant } from "@/lib/format/responsive-currency";
import { cn } from "@/lib/utils";

export type CurrencyAmountVariant = ResponsiveCurrencyVariant | "inline" | "detail";

interface CurrencyAmountProps {
  amount: number;
  locale: string;
  variant?: CurrencyAmountVariant;
  className?: string;
  style?: CSSProperties;
  showDecimals?: boolean;
  signMode?: CurrencySignMode;
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
  signMode = "unsigned",
}: CurrencyAmountProps) {
  const parts = getCurrencyDisplayParts(amount, locale, { showDecimals, signMode });
  const staticClass = STATIC_VARIANT_CLASS[variant];

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-baseline whitespace-nowrap tabular-nums tracking-tight leading-none",
        staticClass,
        className,
      )}
      style={style}
    >
      {parts.signPrefix ? (
        <span className="shrink-0">{parts.signPrefix}</span>
      ) : null}
      <span className="shrink-0">{parts.code}</span>
      <span className="mx-1 shrink-0" aria-hidden="true">
        {" "}
      </span>
      <span className="shrink-0">{parts.integerText}</span>
      {parts.hasDecimals ? (
        <span
          className="shrink-0"
          style={{ fontSize: `${CURRENCY_DECIMAL_SCALE}em` }}
        >
          {parts.decimalText}
        </span>
      ) : null}
    </span>
  );
}
