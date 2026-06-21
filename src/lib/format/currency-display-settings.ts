/** Product currency code (future settings may override). */
export const CURRENCY_CODE = "EGP";

/**
 * When false, decimal portion is omitted from display.
 * Typography sizing remains design-system controlled.
 */
export function shouldShowCurrencyDecimals(): boolean {
  return true;
}
