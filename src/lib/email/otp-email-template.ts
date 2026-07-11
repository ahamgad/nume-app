/**
 * NUME OTP email — standalone template (draft foundation candidate).
 *
 * Intentionally minimal: one centered card, brand lockup, title, supporting
 * sentence, OTP box, helper sentence, and a small footer outside the card.
 */

export const OTP_EMAIL_SUBJECT = "Your NUME sign-in code";
export const OTP_EMAIL_PREHEADER = "Use this code to continue to NUME";
export const OTP_EMAIL_TOKEN = "{{ .Token }}";

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO =
  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function emailStyles() {
  return `<style type="text/css">
    .email-page { background-color: #F7F7F7; }
    .email-card { background-color: #FFFFFF; border-color: #E8E8E8; }
    .email-title { color: #171717; }
    .email-support { color: #737373; }
    .email-code-box { background-color: #FFFFFF; border-color: #E8E8E8; color: #171717; }
    .email-helper { color: #8E8E8E; }
    .email-footer { color: #A3A3A3; }
    .email-wordmark { color: #171717; }
    .email-icon-light { display: inline-block !important; }
    .email-icon-dark { display: none !important; }
    @media (prefers-color-scheme: dark) {
      .email-page { background-color: #111111 !important; }
      .email-card { background-color: #1C1C1C !important; border-color: rgba(255,255,255,0.10) !important; }
      .email-title { color: #FAFAFA !important; }
      .email-support { color: #A3A3A3 !important; }
      .email-code-box { background-color: #1C1C1C !important; border-color: rgba(255,255,255,0.14) !important; color: #FAFAFA !important; }
      .email-helper { color: #737373 !important; }
      .email-footer { color: #525252 !important; }
      .email-wordmark { color: #FAFAFA !important; }
      .email-icon-light { display: none !important; }
      .email-icon-dark { display: inline-block !important; }
    }
  </style>`;
}

function renderBrandLockup(siteUrl: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" valign="middle" style="padding:0 8px 0 0;line-height:0;">
              <img src="${siteUrl}/email/nume-icon-light.png" width="20" height="20" alt="" class="email-icon-light" style="display:inline-block;border:0;outline:none;text-decoration:none;width:20px;height:20px;" />
              <img src="${siteUrl}/email/nume-icon-dark.png" width="20" height="20" alt="" class="email-icon-dark" style="display:none;border:0;outline:none;text-decoration:none;width:20px;height:20px;" />
            </td>
            <td align="left" valign="middle" class="email-wordmark" style="padding:0;font-family:${FONT};font-size:15px;font-weight:600;line-height:1;letter-spacing:0.08em;color:#171717;">
              NUME
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function renderOtpBox(code: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="email-code-box" style="border:1px solid #E8E8E8;border-radius:12px;background-color:#FFFFFF;">
    <tr>
      <td align="center" style="padding:24px 20px;font-family:${MONO};font-size:36px;font-weight:600;line-height:1.1;letter-spacing:0.32em;color:#171717;">
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
${emailStyles()}
<!--[if mso]>
<style type="text/css">
  body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
</style>
<![endif]-->
</head>
<body class="email-page" style="margin:0;padding:0;background-color:#F7F7F7;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    ${escapeHtml(OTP_EMAIL_PREHEADER)}
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="email-page" style="background-color:#F7F7F7;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:340px;width:100%;">
          <tr>
            <td align="center" class="email-card" style="background-color:#FFFFFF;border:1px solid #E8E8E8;border-radius:20px;padding:56px 28px 32px 28px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding:0 0 28px 0;">
                    ${renderBrandLockup(siteUrl)}
                  </td>
                </tr>
                <tr>
                  <td align="center" class="email-title" style="padding:0 0 12px 0;font-family:${FONT};font-size:32px;font-weight:700;line-height:1.15;letter-spacing:-0.02em;color:#171717;text-align:center;">
                    ${escapeHtml(title)}
                  </td>
                </tr>
                <tr>
                  <td align="center" class="email-support" style="padding:0 0 28px 0;font-family:${FONT};font-size:15px;font-weight:400;line-height:1.5;color:#737373;text-align:center;">
                    ${escapeHtml(supportingText)}
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0;">
                    ${renderOtpBox(token)}
                  </td>
                </tr>
                <tr>
                  <td align="center" class="email-helper" style="padding:20px 0 0 0;font-family:${FONT};font-size:13px;font-weight:400;line-height:1.45;color:#8E8E8E;text-align:center;">
                    ${escapeHtml(helperText)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" class="email-footer" style="padding:20px 0 0 0;font-family:${FONT};font-size:11px;font-weight:400;line-height:1.4;color:#A3A3A3;text-align:center;">
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
