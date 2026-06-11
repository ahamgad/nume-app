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
  if (!normalized) return null;
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}
