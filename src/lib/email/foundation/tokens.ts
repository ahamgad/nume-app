/**
 * NUME Email Foundation V2 — design tokens.
 *
 * Hex/rgba values are inlined in HTML because most email clients strip CSS
 * variables. Light values are the default inline fallback; dark values are
 * applied through prefers-color-scheme rules in the foundation renderer.
 */

export const emailFoundationTokens = {
  light: {
    canvas: "#F7F7F7",
    card: "#FFFFFF",
    border: "#EFEFEF",
    foreground: "#252525",
    mutedForeground: "#8E8E8E",
    codeSurface: "#FFFFFF",
    codeBorder: "#EFEFEF",
  },
  dark: {
    canvas: "#1A1A1A",
    card: "#262626",
    border: "rgba(255,255,255,0.10)",
    foreground: "#FAFAFA",
    mutedForeground: "#B0B0B0",
    codeSurface: "#262626",
    codeBorder: "rgba(255,255,255,0.15)",
  },

  contentMaxWidthPx: 400,
  cardRadiusPx: 16,
  cardPaddingPx: 16,
  logoDisplayPx: 48,
  logoAssetPx: 144,
  logoRadiusPx: 8,
  codeBlockRadiusPx: 8,
  codeBlockMinHeightPx: 56,

  space12Px: 12,
  space16Px: 16,
  space24Px: 24,

  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  titleSizePx: 24,
  titleLineHeight: 1.25,
  descriptionSizePx: 15,
  descriptionLineHeight: 1.5,
  codeSizePx: 32,
  codeLineHeight: 1.2,
  codeLetterSpacingEm: 0.28,
  helperSizePx: 13,
  helperLineHeight: 1.45,
  footerSizePx: 12,
  footerLineHeight: 1.4,

  logoLightPath: "{{ .SiteURL }}/email/nume-mark-light.png",
  logoDarkPath: "{{ .SiteURL }}/email/nume-mark-dark.png",
} as const;

export type EmailFoundationTokens = typeof emailFoundationTokens;

export const emailFoundationFooter = "2026 © NUME";
