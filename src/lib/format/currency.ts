import { normalizeNumericInput } from "@/lib/format/numerals";

const DEFAULT_LOCALE = "en-EG";

export function formatCurrency(
  amount: number,
  locale: string = DEFAULT_LOCALE,
  currency = "EGP",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatSignedCurrency(
  amount: number,
  type: "income" | "expense" | "adjustment",
  locale: string = DEFAULT_LOCALE,
): string {
  const formatted = formatCurrency(Math.abs(amount), locale);
  if (type === "income") return `+${formatted}`;
  if (type === "expense") return `−${formatted}`;
  const sign = amount >= 0 ? "+" : "−";
  return `${sign}${formatCurrency(Math.abs(amount), locale)}`;
}

export function parseAmount(value: string): number | null {
  const normalized = normalizeNumericInput(value).trim();
  if (!normalized || normalized === ".") return null;
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Normalize typed input to an unformatted numeric string (no commas). */
export function sanitizeAmountInput(value: string): string {
  const stripped = normalizeNumericInput(value);
  if (!stripped) return "";

  const match = stripped.match(/^(\d*)(\.?\d{0,2})?/);
  if (!match) return "";

  const intPart = match[1] ?? "";
  const decPart = match[2] ?? "";
  return intPart + decPart;
}

/** Decimal input with configurable fractional digits (e.g. custom term years). */
export function sanitizeDecimalInput(
  value: string,
  maxFractionDigits = 1,
): string {
  const stripped = normalizeNumericInput(value);
  if (!stripped) return "";

  const match = stripped.match(/^(\d*)(\.?\d*)?/);
  if (!match) return "";

  const intPart = match[1] ?? "";
  let decPart = match[2] ?? "";
  if (decPart.startsWith(".")) {
    decPart = `.${decPart.slice(1, 1 + maxFractionDigits)}`;
  }
  return intPart + decPart;
}

/** Format an unformatted amount string for display in inputs. */
export function formatAmountInput(
  value: string,
  locale: string = "en-US",
): string {
  const amountInputFormat = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  });

  const sanitized = sanitizeAmountInput(value);
  if (!sanitized) return "";
  if (sanitized === ".") return ".";

  if (sanitized.endsWith(".")) {
    const intPart = sanitized.slice(0, -1);
    if (!intPart) return ".";
    return `${amountInputFormat.format(Number(intPart))}.`;
  }

  const [intPart, decPart] = sanitized.split(".");
  const formattedInt = amountInputFormat.format(Number(intPart || "0"));
  if (decPart !== undefined) {
    return `${formattedInt}.${decPart}`;
  }
  return formattedInt;
}
