export type ResponsiveCurrencyVariant = "hero" | "large" | "row";

export const RESPONSIVE_CURRENCY_TIERS: Record<
  ResponsiveCurrencyVariant,
  { maxRem: number; minRem: number }
> = {
  hero: { maxRem: 2.25, minRem: 0.875 },
  large: { maxRem: 2, minRem: 0.875 },
  row: { maxRem: 0.9375, minRem: 0.75 },
};

const REM_BASE_PX = 16;

export function remToPx(rem: number): number {
  return rem * REM_BASE_PX;
}

/** Scale font size down proportionally so text fits the container width. */
export function computeFittedFontSizePx(
  textWidth: number,
  containerWidth: number,
  maxPx: number,
  minPx: number,
): number {
  if (containerWidth <= 0 || textWidth <= containerWidth) return maxPx;

  const ratio = containerWidth / textWidth;
  const scaled = Math.floor(maxPx * ratio);
  return Math.max(minPx, Math.min(maxPx, scaled));
}

export function getTierFontBounds(variant: ResponsiveCurrencyVariant): {
  maxPx: number;
  minPx: number;
} {
  const tier = RESPONSIVE_CURRENCY_TIERS[variant];
  return {
    maxPx: remToPx(tier.maxRem),
    minPx: remToPx(tier.minRem),
  };
}
