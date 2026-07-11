/**
 * NUME OTP email — standalone template (draft foundation candidate).
 *
 * Intentionally minimal: one centered card, brand lockup, title, supporting
 * sentence, OTP box, helper sentence, and a small footer outside the card.
 */

import {
  NUME_EMAIL_COLORS,
  NUME_EMAIL_FONT_FAMILY,
  NUME_EMAIL_MONO_FAMILY,
} from "@/lib/email/email-design-tokens";

export const OTP_EMAIL_SUBJECT = "Your NUME sign-in code";
export const OTP_EMAIL_PREHEADER = "Use this code to continue to NUME";
export const OTP_EMAIL_TOKEN = "{{ .Token }}";

export const OTP_EMAIL_CONTENT_MAX_WIDTH_PX = 400;
export const OTP_EMAIL_CARD_RADIUS_PX = 16;
export const OTP_EMAIL_CARD_PADDING_X_PX = 36;
export const OTP_EMAIL_CARD_PADDING_TOP_PX = 64;
export const OTP_EMAIL_CARD_PADDING_BOTTOM_PX = 40;
export const OTP_EMAIL_ICON_DISPLAY_PX = 24;
export const OTP_EMAIL_WORDMARK_DISPLAY_WIDTH_PX = 54;
export const OTP_EMAIL_WORDMARK_DISPLAY_HEIGHT_PX = 18;
export const OTP_EMAIL_BRAND_LOCKUP_GAP_PX = 8;
export const OTP_EMAIL_BRAND_TO_TITLE_GAP_PX = 36;
export const OTP_EMAIL_TITLE_SIZE_PX = 36;
export const OTP_EMAIL_SUPPORT_SIZE_PX = 16;
export const OTP_EMAIL_OTP_SIZE_PX = 42;
export const OTP_EMAIL_HELPER_SIZE_PX = 12;
export const OTP_EMAIL_FOOTER_SIZE_PX = 11;

const { light, dark } = NUME_EMAIL_COLORS;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderFontFaces(siteUrl: string) {
  return `<style type="text/css">
    @font-face {
      font-family: 'Geist Sans';
      font-style: normal;
      font-weight: 400;
      src: url('${siteUrl}/fonts/geist-sans/Geist-Regular.woff2') format('woff2');
    }
    @font-face {
      font-family: 'Geist Sans';
      font-style: normal;
      font-weight: 600;
      src: url('${siteUrl}/fonts/geist-sans/Geist-SemiBold.woff2') format('woff2');
    }
    @font-face {
      font-family: 'Geist Sans';
      font-style: normal;
      font-weight: 700;
      src: url('${siteUrl}/fonts/geist-sans/Geist-Bold.woff2') format('woff2');
    }
    @font-face {
      font-family: 'Geist Mono';
      font-style: normal;
      font-weight: 600;
      src: url('${siteUrl}/fonts/geist-mono/GeistMono-SemiBold.woff2') format('woff2');
    }
  </style>`;
}

function emailStyles() {
  return `<style type="text/css">
    .email-page { background-color: ${light.background}; }
    .email-card { background-color: ${light.card}; border-color: ${light.border}; }
    .email-title { color: ${light.foreground}; }
    .email-support { color: ${light.mutedForeground}; }
    .email-code-box { background-color: ${light.card}; border-color: ${light.border}; color: ${light.foreground}; }
    .email-helper { color: ${light.mutedForeground}; }
    .email-footer { color: ${light.mutedForeground}; }
    .email-brand-light { display: inline-block !important; }
    .email-brand-dark { display: none !important; }
    @media (prefers-color-scheme: dark) {
      .email-page { background-color: ${dark.background} !important; }
      .email-card { background-color: ${dark.card} !important; border-color: ${dark.border} !important; }
      .email-title { color: ${dark.foreground} !important; }
      .email-support { color: ${dark.mutedForeground} !important; }
      .email-code-box { background-color: ${dark.card} !important; border-color: ${dark.border} !important; color: ${dark.foreground} !important; }
      .email-helper { color: ${dark.mutedForeground} !important; }
      .email-footer { color: ${dark.mutedForeground} !important; }
      .email-brand-light { display: none !important; }
      .email-brand-dark { display: inline-block !important; }
    }
  </style>`;
}

function renderBrandLockup(siteUrl: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" valign="middle" style="padding:0 ${OTP_EMAIL_BRAND_LOCKUP_GAP_PX}px 0 0;line-height:0;">
              <img src="${siteUrl}/email/nume-icon.png" width="${OTP_EMAIL_ICON_DISPLAY_PX}" height="${OTP_EMAIL_ICON_DISPLAY_PX}" alt="" class="email-brand-light" style="display:inline-block;border:0;outline:none;text-decoration:none;width:${OTP_EMAIL_ICON_DISPLAY_PX}px;height:${OTP_EMAIL_ICON_DISPLAY_PX}px;" />
              <img src="${siteUrl}/email/nume-icon-dark.png" width="${OTP_EMAIL_ICON_DISPLAY_PX}" height="${OTP_EMAIL_ICON_DISPLAY_PX}" alt="" class="email-brand-dark" style="display:none;border:0;outline:none;text-decoration:none;width:${OTP_EMAIL_ICON_DISPLAY_PX}px;height:${OTP_EMAIL_ICON_DISPLAY_PX}px;" />
            </td>
            <td align="left" valign="middle" style="padding:0;line-height:0;">
              <img src="${siteUrl}/email/nume-wordmark.png" width="${OTP_EMAIL_WORDMARK_DISPLAY_WIDTH_PX}" height="${OTP_EMAIL_WORDMARK_DISPLAY_HEIGHT_PX}" alt="NUME" class="email-brand-light" style="display:inline-block;border:0;outline:none;text-decoration:none;width:${OTP_EMAIL_WORDMARK_DISPLAY_WIDTH_PX}px;height:${OTP_EMAIL_WORDMARK_DISPLAY_HEIGHT_PX}px;" />
              <img src="${siteUrl}/email/nume-wordmark-dark.png" width="${OTP_EMAIL_WORDMARK_DISPLAY_WIDTH_PX}" height="${OTP_EMAIL_WORDMARK_DISPLAY_HEIGHT_PX}" alt="NUME" class="email-brand-dark" style="display:none;border:0;outline:none;text-decoration:none;width:${OTP_EMAIL_WORDMARK_DISPLAY_WIDTH_PX}px;height:${OTP_EMAIL_WORDMARK_DISPLAY_HEIGHT_PX}px;" />
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function renderOtpBox(code: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="email-code-box" style="border:1px solid ${light.border};border-radius:14px;background-color:${light.card};">
    <tr>
      <td align="center" style="padding:32px 28px;font-family:${NUME_EMAIL_MONO_FAMILY};font-size:${OTP_EMAIL_OTP_SIZE_PX}px;font-weight:600;line-height:1.15;letter-spacing:0.28em;color:${light.foreground};font-variant-numeric:tabular-nums;">
        ${escapeHtml(code)}
      </td>
    </tr>
  </table>`;
}

export type OtpEmailTemplateOptions = {
  token?: string;
  siteUrl?: string;
  title?: string;
  supportingText?: string;
  helperText?: string;
  footer?: string;
};

export function renderOtpEmailTemplateHtml(
  options: OtpEmailTemplateOptions = {},
): string {
  const token = options.token ?? OTP_EMAIL_TOKEN;
  const siteUrl = options.siteUrl ?? "{{ .SiteURL }}";
  const title = options.title ?? "Enter your code";
  const supportingText =
    options.supportingText ?? "Use this code to continue signing in to NUME";
  const helperText =
    options.helperText ??
    "If you didn't request this code, you can safely ignore this email";
  const footer = options.footer ?? "2026 © NUME";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>${escapeHtml(OTP_EMAIL_SUBJECT)}</title>
${renderFontFaces(siteUrl)}
${emailStyles()}
<!--[if mso]>
<style type="text/css">
  body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
</style>
<![endif]-->
</head>
<body class="email-page" style="margin:0;padding:0;background-color:${light.background};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    ${escapeHtml(OTP_EMAIL_PREHEADER)}
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="email-page" style="background-color:${light.background};">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:${OTP_EMAIL_CONTENT_MAX_WIDTH_PX}px;width:100%;">
          <tr>
            <td align="center" class="email-card" style="background-color:${light.card};border:1px solid ${light.border};border-radius:${OTP_EMAIL_CARD_RADIUS_PX}px;padding:${OTP_EMAIL_CARD_PADDING_TOP_PX}px ${OTP_EMAIL_CARD_PADDING_X_PX}px ${OTP_EMAIL_CARD_PADDING_BOTTOM_PX}px ${OTP_EMAIL_CARD_PADDING_X_PX}px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding:0 0 ${OTP_EMAIL_BRAND_TO_TITLE_GAP_PX}px 0;">
                    ${renderBrandLockup(siteUrl)}
                  </td>
                </tr>
                <tr>
                  <td align="center" class="email-title" style="padding:0 0 14px 0;font-family:${NUME_EMAIL_FONT_FAMILY};font-size:${OTP_EMAIL_TITLE_SIZE_PX}px;font-weight:700;line-height:1.2;letter-spacing:-0.02em;color:${light.foreground};text-align:center;">
                    ${escapeHtml(title)}
                  </td>
                </tr>
                <tr>
                  <td align="center" class="email-support" style="padding:0 0 32px 0;font-family:${NUME_EMAIL_FONT_FAMILY};font-size:${OTP_EMAIL_SUPPORT_SIZE_PX}px;font-weight:400;line-height:1.6;color:${light.mutedForeground};text-align:center;">
                    ${escapeHtml(supportingText)}
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0;">
                    ${renderOtpBox(token)}
                  </td>
                </tr>
                <tr>
                  <td align="center" class="email-helper" style="padding:28px 0 0 0;font-family:${NUME_EMAIL_FONT_FAMILY};font-size:${OTP_EMAIL_HELPER_SIZE_PX}px;font-weight:400;line-height:1.5;color:${light.mutedForeground};text-align:center;">
                    ${escapeHtml(helperText)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" class="email-footer" style="padding:28px 0 0 0;font-family:${NUME_EMAIL_FONT_FAMILY};font-size:${OTP_EMAIL_FOOTER_SIZE_PX}px;font-weight:400;line-height:1.4;color:${light.mutedForeground};text-align:center;">
              ${escapeHtml(footer)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderOtpEmailPreviewHtml(code = "847293") {
  return renderOtpEmailTemplateHtml({
    token: code,
    siteUrl: "https://numeos.app",
  });
}
