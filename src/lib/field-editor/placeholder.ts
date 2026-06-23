/**
 * Strips currency codes and unit suffixes from field-editor placeholder text.
 * Units belong in labels, suffix labels, or formatting — not placeholders.
 */
export function sanitizeFieldEditorPlaceholder(
  placeholder?: string,
): string | undefined {
  if (!placeholder) return undefined;

  let result = placeholder.trim();
  if (!result) return undefined;

  // Parenthetical units: "Amount (EGP)", "Rate (%)"
  result = result.replace(/\s*\([^)]*(?:EGP|%)[^)]*\)\s*/gi, " ").trim();

  // Trailing / leading currency or percent tokens
  result = result.replace(/\s+EGP\s*$/i, "").trim();
  result = result.replace(/^EGP\s+/i, "").trim();
  result = result.replace(/\s+%\s*$/i, "").trim();
  result = result.replace(/^%\s+/i, "").trim();

  // "0 EGP" → "0"
  result = result.replace(/^([\d,.]+)\s+EGP$/i, "$1").trim();

  return result || undefined;
}
