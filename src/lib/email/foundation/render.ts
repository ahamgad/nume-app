import {
  emailFoundationFooter,
  emailFoundationTokens as t,
} from "./tokens";

export type EmailFoundationContent = {
  subject: string;
  preheader: string;
  title: string;
  description?: string;
  primaryBlockHtml: string;
  helperText?: string;
  footer?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function foundationStyles() {
  const { light, dark } = t;

  return `<style type="text/css">
    .email-body { background-color: ${light.canvas}; }
    .email-card { background-color: ${light.card}; border-color: ${light.border}; }
    .email-title { color: ${light.foreground}; }
    .email-description { color: ${light.foreground}; }
    .email-helper { color: ${light.mutedForeground}; }
    .email-footer { color: ${light.mutedForeground}; }
    .email-code-block { background-color: ${light.codeSurface}; border-color: ${light.codeBorder}; color: ${light.foreground}; }
    .email-logo-light { display: block !important; }
    .email-logo-dark { display: none !important; }
    @media (prefers-color-scheme: dark) {
      .email-body { background-color: ${dark.canvas} !important; }
      .email-card { background-color: ${dark.card} !important; border-color: ${dark.border} !important; }
      .email-title { color: ${dark.foreground} !important; }
      .email-description { color: ${dark.foreground} !important; }
      .email-helper { color: ${dark.mutedForeground} !important; }
      .email-footer { color: ${dark.mutedForeground} !important; }
      .email-code-block { background-color: ${dark.codeSurface} !important; border-color: ${dark.codeBorder} !important; color: ${dark.foreground} !important; }
      .email-logo-light { display: none !important; }
      .email-logo-dark { display: block !important; }
    }
  </style>`;
}

function renderLogoRow() {
  const logoStyle = `display:block;border:0;outline:none;text-decoration:none;width:${t.logoDisplayPx}px;height:${t.logoDisplayPx}px;border-radius:${t.logoRadiusPx}px;`;

  return `<tr>
    <td style="padding:0 0 ${t.space12Px}px 0;">
      <img src="${t.logoLightPath}" width="${t.logoDisplayPx}" height="${t.logoDisplayPx}" alt="NUME" class="email-logo-light" style="${logoStyle}" />
      <img src="${t.logoDarkPath}" width="${t.logoDisplayPx}" height="${t.logoDisplayPx}" alt="NUME" class="email-logo-dark" style="${logoStyle}" />
    </td>
  </tr>`;
}

/** Render reusable OTP code block markup. */
export function renderOtpCodeBlock(code: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="email-code-block" style="border:1px solid ${t.light.codeBorder};border-radius:${t.codeBlockRadiusPx}px;background-color:${t.light.codeSurface};">
    <tr>
      <td align="center" style="min-height:${t.codeBlockMinHeightPx}px;padding:${t.space16Px}px ${t.space12Px}px;font-family:${t.fontFamily};font-size:${t.codeSizePx}px;font-weight:600;line-height:${t.codeLineHeight};letter-spacing:${t.codeLetterSpacingEm}em;color:${t.light.foreground};">
        ${escapeHtml(code)}
      </td>
    </tr>
  </table>`;
}

/** Build production HTML for any NUME email from foundation blocks. */
export function renderEmailFoundationHtml(content: EmailFoundationContent): string {
  const footer = content.footer ?? emailFoundationFooter;
  const descriptionRow = content.description
    ? `<tr>
                  <td class="email-description" style="padding:0 0 ${t.space16Px}px 0;font-family:${t.fontFamily};font-size:${t.descriptionSizePx}px;font-weight:400;line-height:${t.descriptionLineHeight};color:${t.light.foreground};">
                    ${escapeHtml(content.description)}
                  </td>
                </tr>`
    : "";
  const helperRow = content.helperText
    ? `<tr>
                  <td class="email-helper" style="padding:${t.space16Px}px 0 0 0;font-family:${t.fontFamily};font-size:${t.helperSizePx}px;font-weight:400;line-height:${t.helperLineHeight};color:${t.light.mutedForeground};">
                    ${escapeHtml(content.helperText)}
                  </td>
                </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>${escapeHtml(content.subject)}</title>
${foundationStyles()}
<!--[if mso]>
<style type="text/css">
  body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
</style>
<![endif]-->
</head>
<body class="email-body" style="margin:0;padding:0;background-color:${t.light.canvas};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    ${escapeHtml(content.preheader)}
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="email-body" style="background-color:${t.light.canvas};">
    <tr>
      <td align="center" style="padding:${t.space24Px}px ${t.space16Px}px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:${t.contentMaxWidthPx}px;width:100%;">
          <tr>
            <td class="email-card" style="background-color:${t.light.card};border:1px solid ${t.light.border};border-radius:${t.cardRadiusPx}px;padding:${t.cardPaddingPx}px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                ${renderLogoRow()}
                <tr>
                  <td class="email-title" style="padding:0 0 ${content.description ? t.space12Px : t.space16Px}px 0;font-family:${t.fontFamily};font-size:${t.titleSizePx}px;font-weight:600;line-height:${t.titleLineHeight};color:${t.light.foreground};">
                    ${escapeHtml(content.title)}
                  </td>
                </tr>
                ${descriptionRow}
                <tr>
                  <td style="padding:0;">
                    ${content.primaryBlockHtml}
                  </td>
                </tr>
                ${helperRow}
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" class="email-footer" style="padding:${t.space24Px}px 0 0 0;font-family:${t.fontFamily};font-size:${t.footerSizePx}px;font-weight:400;line-height:${t.footerLineHeight};color:${t.light.mutedForeground};">
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
