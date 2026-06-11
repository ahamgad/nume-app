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
  const normalized = value.replace(/,/g, "").trim();
  if (!normalized || normalized === ".") return null;
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

const AMOUNT_INPUT_FORMAT = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

/** Normalize typed input to an unformatted numeric string (no commas). */
export function sanitizeAmountInput(value: string): string {
  const stripped = value.replace(/,/g, "");
  if (!stripped) return "";

  const match = stripped.match(/^(\d*)(\.?\d{0,2})?/);
  if (!match) return "";

  const intPart = match[1] ?? "";
  const decPart = match[2] ?? "";
  return intPart + decPart;
}

/** Format an unformatted amount string for display in inputs. */
export function formatAmountInput(value: string): string {
  const sanitized = sanitizeAmountInput(value);
  if (!sanitized) return "";
  if (sanitized === ".") return ".";

  if (sanitized.endsWith(".")) {
    const intPart = sanitized.slice(0, -1);
    if (!intPart) return ".";
    return `${AMOUNT_INPUT_FORMAT.format(Number(intPart))}.`;
  }

  const [intPart, decPart] = sanitized.split(".");
  const formattedInt = AMOUNT_INPUT_FORMAT.format(Number(intPart || "0"));
  if (decPart !== undefined) {
    return `${formattedInt}.${decPart}`;
  }
  return formattedInt;
}
