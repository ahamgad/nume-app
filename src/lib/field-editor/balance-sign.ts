export type BalanceSign = "positive" | "negative";

export function parseBalanceSignFromValue(value: string): BalanceSign {
  const trimmed = value.trim();
  if (trimmed.startsWith("-")) return "negative";
  return "positive";
}

export function stripBalanceSign(value: string): string {
  return value.trim().replace(/^[+-]/, "").trim();
}

export function applyBalanceSign(value: string, sign: BalanceSign): string {
  const digits = stripBalanceSign(value);
  if (!digits) return "";
  return sign === "negative" ? `-${digits}` : digits;
}

export function formatBalanceTriggerDisplay(
  value: string,
  formatAmount: (unsigned: string) => string,
): string {
  const sign = parseBalanceSignFromValue(value);
  const digits = stripBalanceSign(value);
  if (!digits) return "";
  const formatted = formatAmount(digits);
  return sign === "negative" ? `− ${formatted}` : formatted;
}
