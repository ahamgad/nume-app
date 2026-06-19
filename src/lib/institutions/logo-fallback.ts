/**
 * Derives the single-character label for institution avatar fallbacks.
 * Used when no logo asset is available (including custom "Other" institutions).
 *
 * Examples: CIB → C, NBE → N, Telda → T, OPay → O, valU → V
 */
export function getInstitutionFallbackInitial(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return "?";

  const match = trimmed.match(/[A-Za-z0-9\u0600-\u06FF]/);
  if (!match) return "?";

  const char = match[0];
  if (/[a-z]/.test(char)) return char.toUpperCase();
  if (/[A-Z0-9]/.test(char)) return char;
  return char;
}
