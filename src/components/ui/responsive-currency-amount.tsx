"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { CurrencyAmount } from "@/components/ui/currency-amount";
import { getCurrencyDisplayParts } from "@/lib/format/currency";
import {
  CURRENCY_AMOUNT_TRAILING_GAP_PX,
  fitFontSizeToWidth,
  getAvailableAmountWidth,
  getTierFontBounds,
  type ResponsiveCurrencyVariant,
} from "@/lib/format/responsive-currency";
import { cn } from "@/lib/utils";

interface ResponsiveCurrencyAmountProps {
  amount: number;
  locale: string;
  variant?: ResponsiveCurrencyVariant;
  className?: string;
  /** Trailing action rendered beside the amount (e.g. edit button). */
  trailing?: ReactNode;
}

export function ResponsiveCurrencyAmount({
  amount,
  locale,
  variant = "hero",
  className,
  trailing,
}: ResponsiveCurrencyAmountProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const trailingRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSizePx, setFontSizePx] = useState<number | null>(null);
  const parts = getCurrencyDisplayParts(amount, locale);
  const { maxPx, minPx } = getTierFontBounds(variant);
  const hasTrailing = trailing != null;

  useLayoutEffect(() => {
    const row = rowRef.current;
    const text = textRef.current;
    if (!row || !text) return;

    function fit() {
      const trailingWidth = trailingRef.current?.offsetWidth ?? 0;
      const available = getAvailableAmountWidth(
        row!.clientWidth,
        trailingWidth,
        hasTrailing,
      );

      const nextSize = fitFontSizeToWidth(
        (size) => {
          text!.style.fontSize = `${size}px`;
          return text!.scrollWidth;
        },
        available,
        maxPx,
        minPx,
      );

      setFontSizePx(nextSize);
    }

    fit();

    const observer = new ResizeObserver(fit);
    observer.observe(row);
    if (trailingRef.current) {
      observer.observe(trailingRef.current);
    }
    return () => observer.disconnect();
  }, [parts.fullText, hasTrailing, maxPx, minPx]);

  return (
    <div
      ref={rowRef}
      className={cn("flex min-w-0 w-full items-center", className)}
      style={
        hasTrailing
          ? ({ gap: `${CURRENCY_AMOUNT_TRAILING_GAP_PX}px` } as CSSProperties)
          : undefined
      }
    >
      <span ref={textRef} className="inline-block min-w-0 max-w-full">
        <CurrencyAmount
          amount={amount}
          locale={locale}
          variant={variant}
          className="font-semibold"
          style={{ fontSize: fontSizePx ?? maxPx }}
        />
      </span>
      {hasTrailing ? (
        <div ref={trailingRef} className="shrink-0">
          {trailing}
        </div>
      ) : null}
    </div>
  );
}
