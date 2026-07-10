/**
 * Shared NUME auth email shell — rendering target of the Design System.
 * Structure: Logo → Headline → Body → Primary CTA → One-time note → Security note → Footer
 */

import {
  emailDesignTokens as t,
  type AuthEmailContent,
} from "./design-tokens";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Build production HTML for a NUME auth email from Design System tokens + content. */
export function renderAuthEmailHtml(content: AuthEmailContent): string {
  const pad = t.space16Px;
  const gapAfterLogo = t.space24Px;
  const gapAfterBody = t.space24Px;
  const gapAfterCta = t.space24Px;
  const gapNotes = t.space16Px;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${escapeHtml(content.subject)}</title>
<!--[if mso]>
<style type="text/css">
  body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
</style>
<![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${t.canvas};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <!-- Preheader -->
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    ${escapeHtml(content.preheader)}
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${t.canvas};">
    <tr>
      <td align="center" style="padding:${t.space24Px}px ${t.space16Px}px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:${t.contentMaxWidthPx}px;width:100%;">
          <!-- Card -->
          <tr>
            <td style="background-color:${t.card};border:1px solid ${t.border};border-radius:${t.cardRadiusPx}px;padding:${pad}px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <!-- Logo -->
                <tr>
                  <td style="padding:0 0 ${gapAfterLogo}px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;padding:0 ${t.space16Px}px 0 0;">
                          <img src="${t.logoPath}" width="${t.logoDisplayPx}" height="${t.logoDisplayPx}" alt="NUME" style="display:block;border:0;outline:none;text-decoration:none;width:${t.logoDisplayPx}px;height:${t.logoDisplayPx}px;" />
                        </td>
                        <td style="vertical-align:middle;font-family:${t.fontFamily};font-size:${t.wordmarkSizePx}px;font-weight:600;line-height:1.2;color:${t.foreground};">
                          NUME
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Headline -->
                <tr>
                  <td style="padding:0 0 ${t.space16Px}px 0;font-family:${t.fontFamily};font-size:${t.headlineSizePx}px;font-weight:600;line-height:${t.headlineLineHeight};color:${t.foreground};">
                    ${escapeHtml(content.headline)}
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:0 0 ${gapAfterBody}px 0;font-family:${t.fontFamily};font-size:${t.bodySizePx}px;font-weight:400;line-height:${t.bodyLineHeight};color:${t.foreground};">
                    ${escapeHtml(content.body)}
                  </td>
                </tr>
                <!-- Primary CTA -->
                <tr>
                  <td style="padding:0 0 ${gapAfterCta}px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="center" bgcolor="${t.primary}" style="background-color:${t.primary};border-radius:${t.buttonRadiusPx}px;height:${t.ctaHeightPx}px;">
                          <a href="${content.ctaHref}" style="display:block;width:100%;box-sizing:border-box;padding:14px 16px;font-family:${t.fontFamily};font-size:${t.bodySizePx}px;font-weight:500;line-height:1.25;color:${t.primaryForeground};text-decoration:none;text-align:center;">
                            ${escapeHtml(content.ctaLabel)}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- One-time link note -->
                <tr>
                  <td style="padding:0 0 ${gapNotes}px 0;font-family:${t.fontFamily};font-size:${t.captionSizePx}px;font-weight:400;line-height:${t.captionLineHeight};color:${t.mutedForeground};">
                    ${escapeHtml(content.oneTimeNote)}
                  </td>
                </tr>
                <!-- Security note -->
                <tr>
                  <td style="padding:0;font-family:${t.fontFamily};font-size:${t.captionSizePx}px;font-weight:400;line-height:${t.captionLineHeight};color:${t.mutedForeground};">
                    ${escapeHtml(content.securityNote)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding:${t.space24Px}px 0 0 0;font-family:${t.fontFamily};font-size:${t.footerSizePx}px;font-weight:400;line-height:1.4;color:${t.mutedForeground};">
              ${escapeHtml(content.footer)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
