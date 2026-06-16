export type ResponsiveCurrencyVariant = "hero" | "large" | "row";

export const RESPONSIVE_CURRENCY_TIERS: Record<
  ResponsiveCurrencyVariant,
  { maxRem: number; minRem: number }
> = {
  hero: { maxRem: 2.25, minRem: 0.875 },
  large: { maxRem: 2, minRem: 0.875 },
  row: { maxRem: 0.9375, minRem: 0.75 },
};

/** Gap between a monetary amount and an adjacent trailing action (px). */
export const CURRENCY_AMOUNT_TRAILING_GAP_PX = 8;

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

/**
 * Binary-search font size so measured text width fits available space.
 * More accurate than proportional scaling for tabular currency strings.
 */
export function fitFontSizeToWidth(
  measureWidthAtSize: (fontSizePx: number) => number,
  availableWidth: number,
  maxPx: number,
  minPx: number,
): number {
  if (availableWidth <= 0) return minPx;

  if (measureWidthAtSize(maxPx) <= availableWidth) return maxPx;

  let low = minPx;
  let high = maxPx;
  let best = minPx;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const width = measureWidthAtSize(mid);
    if (width <= availableWidth) {
      best = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return best;
}

export function getAvailableAmountWidth(
  containerWidth: number,
  trailingWidth: number,
  hasTrailing: boolean,
): number {
  const gap = hasTrailing ? CURRENCY_AMOUNT_TRAILING_GAP_PX : 0;
  return Math.max(0, containerWidth - trailingWidth - gap);
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
