/**
 * NUME Email Design System — authentication email rendering target.
 *
 * Official baseline for Confirm, Reset, and every future auth email.
 * Values are resolved from application foundations (`globals.css`,
 * `card-surface.ts`, CONTENT/FOUNDATION) and baked as inline hex/px
 * because most email clients strip CSS custom properties.
 *
 * Limitations (documented, not new design decisions):
 * - CSS custom properties are inlined as hex/px (Gmail/Outlook strip vars).
 * - Card radius uses FOUNDATION-documented 16px for `rounded-2xl` card surfaces
 *   (theme `--radius-2xl` computes ~18px; product foundation states 16px).
 * - Button radius uses `--radius` / `rounded-lg` → 10px.
 * - Logo is PNG with 8px corner radius (inline SVG unsupported in Gmail/Outlook).
 * - Authored for light product tokens; `color-scheme: light` meta reduces
 *   aggressive client inversion where supported. No separate dark email brand.
 */

export const emailDesignTokens = {
  /** `--background` */
  canvas: "#F7F7F7",
  /** `--card` */
  card: "#FFFFFF",
  /** `--border` */
  border: "#EFEFEF",
  /** `--foreground` / `--card-foreground` — oklch(0.145 0 0) */
  foreground: "#252525",
  /** `--primary` — oklch(0.205 0 0) */
  primary: "#343434",
  /** `--primary-foreground` — oklch(0.985 0 0) */
  primaryForeground: "#FBFBFB",
  /** `--muted-foreground` — oklch(0.556 0 0) */
  mutedForeground: "#8E8E8E",

  /** FOUNDATION card surface radius (16px / rounded-2xl) */
  cardRadiusPx: 16,
  /** Email card inner padding — approved baseline */
  cardPaddingPx: 20,
  /** `--radius` / rounded-lg on primary Button */
  buttonRadiusPx: 10,
  /** Logo mark corner radius */
  logoRadiusPx: 8,

  /** Spacing scale (product 8px + email-only 20 / 36) */
  space12Px: 12,
  space16Px: 16,
  space20Px: 20,
  space24Px: 24,
  space32Px: 32,
  /** Primary action → in-card helper (security note) */
  space36Px: 36,

  /**
   * Primary CTA — approved email control.
   * Slightly lighter than in-app `h-12` (48); do not enlarge unless requested.
   */
  ctaHeightPx: 44,
  ctaPadYPx: 12,

  /** Logo display size; asset is 3× for sharpness */
  logoDisplayPx: 48,
  logoAssetPx: 144,

  /** Content column — mobile-first */
  contentMaxWidthPx: 400,

  /** Typography roles (app hierarchy, email-safe sizes) — frozen */
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  headlineSizePx: 22,
  headlineLineHeight: 1.3,
  bodySizePx: 16,
  bodyLineHeight: 1.5,
  captionSizePx: 13,
  captionLineHeight: 1.45,
  footerSizePx: 12,

  /** Hosted brand mark — generated from Design System SVG */
  logoPath: "{{ .SiteURL }}/email/nume-mark.png",
} as const;

export type EmailDesignTokens = typeof emailDesignTokens;

export type AuthEmailContent = {
  id: string;
  subject: string;
  preheader: string;
  headline: string;
  body: string;
  ctaLabel: string;
  /** Go-template href for the primary CTA */
  ctaHref: string;
  securityNote: string;
  oneTimeNote: string;
  footer: string;
};

/** Shared copyright line for all auth emails (outside card). */
export const authEmailFooter = "2026 © NUME";
