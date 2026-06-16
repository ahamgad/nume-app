"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { formatCurrency } from "@/lib/format/currency";
import {
  computeFittedFontSizePx,
  getTierFontBounds,
  type ResponsiveCurrencyVariant,
} from "@/lib/format/responsive-currency";
import { cn } from "@/lib/utils";

interface ResponsiveCurrencyAmountProps {
  amount: number;
  locale: string;
  variant?: ResponsiveCurrencyVariant;
  className?: string;
}

export function ResponsiveCurrencyAmount({
  amount,
  locale,
  variant = "hero",
  className,
}: ResponsiveCurrencyAmountProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSizePx, setFontSizePx] = useState<number | null>(null);
  const formatted = formatCurrency(amount, locale);
  const { maxPx, minPx } = getTierFontBounds(variant);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    function fit() {
      text!.style.fontSize = `${maxPx}px`;
      const textWidth = text!.scrollWidth;
      const containerWidth = container!.clientWidth;
      const nextSize = computeFittedFontSizePx(
        textWidth,
        containerWidth,
        maxPx,
        minPx,
      );
      setFontSizePx(nextSize);
    }

    fit();

    const observer = new ResizeObserver(fit);
    observer.observe(container);
    return () => observer.disconnect();
  }, [formatted, maxPx, minPx]);

  return (
    <div ref={containerRef} className={cn("min-w-0 w-full overflow-hidden", className)}>
      <span
        ref={textRef}
        className="block whitespace-nowrap font-semibold tabular-nums tracking-tight leading-none"
        style={{ fontSize: fontSizePx ?? maxPx }}
      >
        {formatted}
      </span>
    </div>
  );
}
