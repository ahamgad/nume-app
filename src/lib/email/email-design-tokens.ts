/**
 * NUME foundation colors for email — mirrors `src/app/globals.css`.
 * Resolved sRGB hex values for achromatic oklch tokens.
 */
export const NUME_EMAIL_COLORS = {
  light: {
    background: "#F7F7F7",
    card: "#FFFFFF",
    foreground: "#0A0A0A",
    mutedForeground: "#737373",
    border: "#EFEFEF",
  },
  dark: {
    background: "#0A0A0A",
    card: "#171717",
    foreground: "#FAFAFA",
    mutedForeground: "#A1A1A1",
    border: "#2E2E2E",
  },
} as const;

/** App sans stack — Geist Sans self-hosted with system fallbacks. */
export const NUME_EMAIL_FONT_FAMILY =
  "'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

/** Tabular OTP numerals — Geist Mono self-hosted with system monospace fallbacks. */
export const NUME_EMAIL_MONO_FAMILY =
  "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
