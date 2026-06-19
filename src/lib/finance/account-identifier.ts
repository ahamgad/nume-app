/** Last-4 identifier validation — optional, exactly four digits when provided. */
export const IDENTIFIER_LAST4_REGEX = /^\d{4}$/;

export function sanitizeIdentifierLast4Input(value: string): string {
  return value.replace(/\D/g, "").slice(0, 4);
}

export function isValidIdentifierLast4(value: string): boolean {
  return IDENTIFIER_LAST4_REGEX.test(value);
}

/** Returns null for empty input; throws if non-empty but invalid. */
export function parseOptionalIdentifierLast4(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!isValidIdentifierLast4(trimmed)) {
    throw new Error("Identifier must be exactly 4 digits");
  }
  return trimmed;
}
