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
        "inline max-w-full whitespace-nowrap tabular-nums tracking-tight leading-none",
        staticClass,
        className,
      )}
      style={style}
    >
      {parts.signPrefix}
      {parts.code}
      {" "}
      {parts.integerText}
      {parts.hasDecimals ? (
        <span style={{ fontSize: `${CURRENCY_DECIMAL_SCALE}em` }}>
          {parts.decimalText}
        </span>
      ) : null}
    </span>
  );
}
