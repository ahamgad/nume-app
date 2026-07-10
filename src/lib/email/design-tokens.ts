/**
 * Email rendering target for the NUME Design System.
 *
 * Values are resolved from application foundations (`globals.css`,
 * `card-surface.ts`, `form-action-chrome.ts`, CONTENT/FOUNDATION).
 * HTML email cannot use CSS variables in most clients, so this module
 * bakes the resolved light-theme token values for inline styles.
 *
 * Limitations (documented, not new design decisions):
 * - CSS custom properties are inlined as hex/px (Gmail/Outlook strip vars).
 * - Card radius uses FOUNDATION-documented 16px for `rounded-2xl` card surfaces
 *   (theme `--radius-2xl` computes ~18px; product foundation states 16px).
 * - Button radius uses `--radius` / `rounded-lg` → 10px.
 * - Logo is PNG (inline SVG unsupported in Gmail/Outlook).
 * - Authored for light product tokens; no separate dark email brand.
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
  /** `--radius` / rounded-lg on primary Button */
  buttonRadiusPx: 10,

  /** Foundation spacing */
  space16Px: 16,
  space24Px: 24,

  /** `FORM_PRIMARY_ACTION_BUTTON_CLASS` h-12 */
  ctaHeightPx: 48,

  /** Logo display size; asset is 3× for sharpness */
  logoDisplayPx: 40,
  logoAssetPx: 120,

  /** Content column — mobile auth card mental model */
  contentMaxWidthPx: 400,

  /** Typography roles (app hierarchy, email-safe sizes) */
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  headlineSizePx: 22,
  headlineLineHeight: 1.3,
  bodySizePx: 16,
  bodyLineHeight: 1.5,
  captionSizePx: 13,
  captionLineHeight: 1.45,
  wordmarkSizePx: 16,
  footerSizePx: 12,

  /** Hosted brand mark — generated from Design System SVG */
  logoPath: "{{ .SiteURL }}/email/nume-mark.png",
} as const;

export type EmailDesignTokens = typeof emailDesignTokens;

export type AuthEmailContent = {
  id: "confirm" | "recovery";
  subject: string;
  preheader: string;
  headline: string;
  body: string;
  ctaLabel: string;
  /** Go-template href for the primary CTA */
  ctaHref: string;
  oneTimeNote: string;
  securityNote: string;
  footer: string;
};

export const confirmEmailContent: AuthEmailContent = {
  id: "confirm",
  subject: "Confirm your email address",
  preheader: "Tap the link to finish creating your NUME account",
  headline: "Confirm your email address",
  body: "Follow the link below to confirm this email address and finish signing up",
  ctaLabel: "Confirm email address",
  ctaHref:
    "{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next=/splash",
  oneTimeNote: "This link can only be used once to confirm your email",
  securityNote:
    "If you didn't create a NUME account, you can safely ignore this email",
  footer: "© NUME",
};

export const recoveryEmailContent: AuthEmailContent = {
  id: "recovery",
  subject: "Reset your password",
  preheader: "Tap the link to choose a new password for your NUME account",
  headline: "Reset your password",
  body: "Choose a new password to regain access to your account",
  ctaLabel: "Reset password",
  ctaHref:
    "{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password",
  oneTimeNote: "This link can only be used once to reset your password",
  securityNote:
    "If you didn't request a password reset, you can safely ignore this email",
  footer: "© NUME",
};
