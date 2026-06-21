import {
  CURRENCY_CODE,
  shouldShowCurrencyDecimals,
} from "@/lib/format/currency-display-settings";
import type { RecordType } from "@/lib/finance/types";

const DEFAULT_LOCALE = "en-EG";

/** Decimal suffix scale relative to the main amount (design system). */
export const CURRENCY_DECIMAL_SCALE = 0.72;

export type CurrencySignMode = "unsigned" | "signed";

export interface CurrencyDisplayParts {
  signPrefix: string;
  integerText: string;
  decimalText: string;
  code: string;
  fullText: string;
  hasDecimals: boolean;
}

export interface FormatCurrencyOptions {
  locale?: string;
  showDecimals?: boolean;
  /** Widget/metric displays use explicit +/- prefixes. */
  signMode?: CurrencySignMode;
}

function resolveShowDecimals(showDecimals?: boolean): boolean {
  return showDecimals ?? shouldShowCurrencyDecimals();
}

function resolveSignMode(signMode?: CurrencySignMode): CurrencySignMode {
  return signMode ?? "unsigned";
}

/** Absolute display amount for unsigned contexts. */
export function toDisplayCurrencyAmount(amount: number): number {
  return Math.abs(amount);
}

function signPrefixForAmount(amount: number, signMode: CurrencySignMode): string {
  if (signMode !== "signed") return "";
  if (amount > 0) return "+ ";
  if (amount < 0) return "− ";
  return "";
}

function formatAmountDigits(
  amount: number,
  locale: string,
  showDecimals: boolean,
): Pick<CurrencyDisplayParts, "integerText" | "decimalText" | "hasDecimals"> {
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: showDecimals ? 0 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  const formattedParts = formatter.formatToParts(Math.abs(amount));
  let integerText = "";
  let decimalText = "";

  for (const part of formattedParts) {
    if (part.type === "integer" || part.type === "group") {
      integerText += part.value;
    } else if (part.type === "decimal" || part.type === "fraction") {
      decimalText += part.value;
    }
  }

  return {
    integerText,
    decimalText,
    hasDecimals: decimalText.length > 0,
  };
}

export function getCurrencyDisplayParts(
  amount: number,
  locale: string = DEFAULT_LOCALE,
  options?: FormatCurrencyOptions,
): CurrencyDisplayParts {
  const showDecimals = resolveShowDecimals(options?.showDecimals);
  const signMode = resolveSignMode(options?.signMode);
  const signPrefix = signPrefixForAmount(amount, signMode);
  const { integerText, decimalText, hasDecimals } = formatAmountDigits(
    amount,
    locale,
    showDecimals,
  );
  const amountText = hasDecimals ? `${integerText}${decimalText}` : integerText;
  const fullText = `${signPrefix}${CURRENCY_CODE} ${amountText}`;

  return {
    signPrefix,
    integerText,
    decimalText,
    code: CURRENCY_CODE,
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

/** Dashboard/widget metrics — explicit +/- prefix. */
export function formatMetricCurrency(
  amount: number,
  locale: string = DEFAULT_LOCALE,
  options?: Omit<FormatCurrencyOptions, "signMode">,
): string {
  return formatCurrency(amount, locale, { ...options, signMode: "signed" });
}

/** Record and account balance displays — no sign prefix. */
export function formatSignedCurrency(
  amount: number,
  _type?: RecordType,
  locale: string = DEFAULT_LOCALE,
  options?: FormatCurrencyOptions,
): string {
  return formatCurrency(amount, locale, { ...options, signMode: "unsigned" });
}
