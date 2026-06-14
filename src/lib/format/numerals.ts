/**
 * Normalize user-entered numerals and separators to western digits for parsing.
 *
 * Accepts Arabic-Indic (٠–٩), Extended Arabic-Indic (۰–۹), ASCII digits,
 * Arabic decimal (٫), and thousands separators (٬, comma).
 * Internal storage and parsing always use 0-9 and `.` as the decimal separator.
 */
export function normalizeNumericInput(value: string): string {
  return value
    .replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (digit) =>
      String(digit.charCodeAt(0) & 0x0f),
    )
    .replace(/\u066B/g, ".")
    .replace(/[\u066C,]/g, "");
}
