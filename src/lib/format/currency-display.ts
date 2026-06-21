import {
  CURRENCY_SYMBOL,
  shouldShowCurrencyDecimals,
} from "@/lib/format/currency-display-settings";

const DEFAULT_LOCALE = "en-EG";

/** Decimal suffix scale relative to the main amount (design system). */
export const CURRENCY_DECIMAL_SCALE = 0.72;

export interface CurrencyDisplayParts {
  integerText: string;
  decimalText: string;
  symbol: string;
  fullText: string;
  hasDecimals: boolean;
}

export interface FormatCurrencyOptions {
  locale?: string;
  showDecimals?: boolean;
}

function resolveShowDecimals(showDecimals?: boolean): boolean {
  return showDecimals ?? shouldShowCurrencyDecimals();
}

/** Absolute display amount — never negative in UI. */
export function toDisplayCurrencyAmount(amount: number): number {
  return Math.abs(amount);
}

export function getCurrencyDisplayParts(
  amount: number,
  locale: string = DEFAULT_LOCALE,
  options?: FormatCurrencyOptions,
): CurrencyDisplayParts {
  const showDecimals = resolveShowDecimals(options?.showDecimals);
  const absAmount = toDisplayCurrencyAmount(amount);

  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: showDecimals ? 0 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  const formattedParts = formatter.formatToParts(absAmount);
  let integerText = "";
  let decimalText = "";

  for (const part of formattedParts) {
    if (part.type === "integer" || part.type === "group") {
      integerText += part.value;
    } else if (part.type === "decimal") {
      decimalText += part.value;
    } else if (part.type === "fraction") {
      decimalText += part.value;
    }
  }

  const hasDecimals = decimalText.length > 0;
  const fullText = hasDecimals
    ? `${integerText}${decimalText} ${CURRENCY_SYMBOL}`
    : `${integerText} ${CURRENCY_SYMBOL}`;

  return {
    integerText,
    decimalText,
    symbol: CURRENCY_SYMBOL,
    fullText,
    hasDecimals,
  };
}

/** Formatted currency string for labels and non-component contexts. */
export function formatCurrency(
  amount: number,
  locale: string = DEFAULT_LOCALE,
  options?: FormatCurrencyOptions,
): string {
  return getCurrencyDisplayParts(amount, locale, options).fullText;
}

/** Record and list amounts — no sign prefix; semantics come from type and color. */
export function formatSignedCurrency(
  amount: number,
  _type?: unknown,
  locale: string = DEFAULT_LOCALE,
  options?: FormatCurrencyOptions,
): string {
  return formatCurrency(amount, locale, options);
}
