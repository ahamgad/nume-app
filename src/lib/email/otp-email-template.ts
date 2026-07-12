/**
 * NUME OTP email — Supabase magic_link template.
 * Light layout is fixed; dark mode swaps foundation colors only.
 */

import {
  NUME_EMAIL_COLORS,
} from "@/lib/email/email-design-tokens";

export const OTP_EMAIL_SUBJECT = "Your NUME sign-in code";
export const OTP_EMAIL_TOKEN = "{{ .Token }}";
export const OTP_EMAIL_ICON_DISPLAY_PX = 80;

const { light, dark } = NUME_EMAIL_COLORS;

/** Every semantic color used by the OTP email — light and dark pairs. */
export const OTP_EMAIL_THEME = {
  light: {
    pageOuter: "#ececec",
    pageMain: light.background,
    headline: "#000000",
    support: light.mutedForeground,
    otpBackground: light.card,
    otpBorder: "#E8E8E8",
    otpCode: "#000000",
    defaultLink: "#000000",
    logoLink: "#ffffff",
    preheader: "#ffffff",
    outlookSpacer: "#dbdbdb",
  },
  dark: {
    pageOuter: dark.background,
    pageMain: dark.card,
    headline: dark.foreground,
    support: dark.mutedForeground,
    otpBackground: dark.card,
    otpBorder: dark.border,
    otpCode: dark.foreground,
    defaultLink: dark.foreground,
    logoLink: dark.foreground,
    preheader: dark.background,
    outlookSpacer: dark.background,
  },
} as const;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function emailThemeStyles() {
  const L = OTP_EMAIL_THEME.light;
  const D = OTP_EMAIL_THEME.dark;

  return `<style type="text/css">
    .email-page-outer { background-color: ${L.pageOuter} !important; }
    .email-page-main { background-color: ${L.pageMain} !important; }
    .email-headline { color: ${L.headline} !important; }
    .email-support { color: ${L.support} !important; }
    .email-otp-cell {
      background-color: ${L.otpBackground} !important;
      border-color: ${L.otpBorder} !important;
      color: ${L.otpCode} !important;
    }
    .email-logo-link,
    .email-logo-link:link,
    .email-logo-link:visited { color: ${L.logoLink} !important; }
    .email-preheader { color: ${L.preheader} !important; }
    .email-outlook-spacer {
      color: ${L.outlookSpacer} !important;
      background-color: ${L.outlookSpacer} !important;
    }
    .email-brand-light { display: inline-block !important; }
    .email-brand-dark { display: none !important; }
    @media (prefers-color-scheme: dark) {
      .email-page-outer { background-color: ${D.pageOuter} !important; }
      .email-page-main { background-color: ${D.pageMain} !important; }
      .email-headline { color: ${D.headline} !important; }
      .email-support { color: ${D.support} !important; }
      .email-otp-cell {
        background-color: ${D.otpBackground} !important;
        border-color: ${D.otpBorder} !important;
        color: ${D.otpCode} !important;
      }
      a,
      a:link,
      a:visited { color: ${D.defaultLink} !important; }
      .email-logo-link,
      .email-logo-link:link,
      .email-logo-link:visited { color: ${D.logoLink} !important; }
      .email-preheader { color: ${D.preheader} !important; }
      .email-outlook-spacer {
        color: ${D.outlookSpacer} !important;
        background-color: ${D.outlookSpacer} !important;
      }
      .email-brand-light { display: none !important; }
      .email-brand-dark { display: inline-block !important; }
    }
  </style>`;
}

export type OtpEmailTemplateOptions = {
  token?: string;
  siteUrl?: string;
};

export function renderOtpEmailTemplateHtml(
  options: OtpEmailTemplateOptions = {},
): string {
  const token = options.token ?? OTP_EMAIL_TOKEN;
  const siteUrl = options.siteUrl ?? "{{ .SiteURL }}";
  const iconSize = OTP_EMAIL_ICON_DISPLAY_PX;
  const L = OTP_EMAIL_THEME.light;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="EN">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="x-apple-disable-message-reformatting">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0 ">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<meta name="format-detection" content="telephone=no">
<link href="https://fonts.googleapis.com/css?family=Inter+Tight:300,400,600,700,800" rel="stylesheet">
<style type="text/css">
html,
body {
 Margin: 0 auto !important;
 padding: 0 !important;
 width: 100% !important;
 height: 100% !important;
}

* {
 -ms-text-size-adjust: 100%;
 -webkit-text-size-adjust: 100%;
 text-rendering: optimizeLegibility;
}

.ExternalClass {
 width: 100%;
}

.ExternalClass,
.ExternalClass p,
.ExternalClass span,
.ExternalClass font,
.ExternalClass td,
.ExternalClass div {
 line-height: 100%;
}

table,
th {
 mso-table-lspace: 0pt;
 mso-table-rspace: 0pt;
}

.ExternalClass,
.ExternalClass * {
 line-height: 100% !important;
}

table {
 border-spacing: 0 !important;
 border-collapse: collapse !important;
 border: none;
 Margin: 0 auto;
}

img {
 -ms-interpolation-mode: bicubic;
}

.yshortcuts a {
 border-bottom: none !important;
}

*[x-apple-data-detectors],
.x-gmail-data-detectors,
.x-gmail-data-detectors *,
.aBn {
 border-bottom: none !important;
 cursor: default !important;
 color: inherit !important;
 text-decoration: none !important;
 font-size: inherit !important;
 font-family: inherit !important;
 font-weight: inherit !important;
 line-height: inherit !important;
}

u #body a {
 color: inherit;
 text-decoration: none;
 font-size: inherit;
 font-family: inherit;
 font-weight: inherit;
 line-height: inherit;
}

.a6S {
 display: none !important;
 opacity: 0.01 !important;
}

img.g-img div {
 display: none !important;
}

a,
a:link,
a:visited {
 color: ${L.defaultLink};
}

img {
 border: none !important;
 outline: none !important;
 text-decoration: none !important;
 overflow: hidden !important;
}

#MessageViewBody,
#MessageWebViewDiv {
 width: 100% !important;
 min-width: 100vw;
 margin: 0 !important;
 zoom: 1 !important;
}

u+.me_body .glist {
 margin-left: 0 !important;
}

span.preheader {
 display: none !important;
}

p {
 margin: 0px !important;
 padding: 0px !important;
}

td,
a,
span {
 border-collapse: collapse;
 mso-line-height-rule: exactly;
}

@media only screen and (max-width:600px) {
 .me_main_table {
  width: 100% !important;
 }

 .me_wrapper {
  width: 100% !important;
  max-width: 100% !important;
 }

 .me_wrapper_two {
  width: 100% !important;
  max-width: 100% !important;
  display: block !important;
 }

 .me_hide {
  display: none !important;
 }

 .me_side_space {
  padding-left: 20px !important;
  padding-right: 20px !important;
 }

 u+.me_body .glist {
  margin-left: 25px !important;
 }

 u+.me_body .me_full_wrap {
  width: 100% !important;
  width: 100vw !important;
 }
}
</style>
${emailThemeStyles()}
</head>
<body class="me_body email-page-outer" style="min-width: 100%; background-color:${L.pageOuter};margin:0 auto !important;padding:0;">
<span class="preheader email-preheader" style="font-size:1px;color:${L.preheader};">Preheader Preview text here &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌ &nbsp;‌</span>
<table class="me_full_wrap email-page-outer" width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="background-color:${L.pageOuter};">
<tr>
<td align="center" valign="top">
<table align="center" class="me_main_table email-page-main" width="600" border="0" cellspacing="0" cellpadding="0" style="table-layout:fixed;background-color:${L.pageMain};">
<tr>
<td>
<table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr>
<td>
<table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr>
<td width="70" class="me_hide">&nbsp;</td>
<td valign="top" class="me_side_space">
<table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr>
<td height="10" class="me_hide" style="line-height:1px;font-size:1px;">&nbsp;</td>
</tr>
<tr>
<td height="34" style="line-height:1px;font-size:1px;">&nbsp;</td>
</tr>
<tr><td align="center"> <a target="_blank" class="email-logo-link" style="text-decoration: none;color: ${L.logoLink};" href="https://numeos.app">
<img alt="logo" src="${siteUrl}/email/nume-icon.png" width="${iconSize}" height="${iconSize}" class="email-brand-light" style="display:inline-block;border:none!important;outline:none!important;text-decoration:none!important;overflow:hidden!important;">
<img alt="logo" src="${siteUrl}/email/nume-icon-dark.png" width="${iconSize}" height="${iconSize}" class="email-brand-dark" style="display:none;border:none!important;outline:none!important;text-decoration:none!important;overflow:hidden!important;">
</a></td></tr>
<tr>
<td height="20" class="me_hide" style="line-height:1px;font-size:1px;">&nbsp;</td>
</tr>
<tr>
<td height="35" style="line-height:1px;font-size:1px;">&nbsp;</td>
</tr>
<tr>
<td class="email-headline" style="font-family:'Inter Tight', Arial, sans-serif;font-size:38px;text-align:center;color:${L.headline};font-weight:800;line-height: 48px;padding-bottom: 8px">Confirm Your Email to</td>
</tr>
<tr>
<td height="20" style="line-height:1px;font-size:1px;">&nbsp;</td>
</tr>
<tr>
<td class="email-support" style="font-family:'Inter Tight', Arial, sans-serif;font-size:18px;text-align:center;color:${L.support};font-weight:400;line-height: 30px;">Please confirm your email address using the code below</td>
</tr>
<tr>
<td height="40" style="line-height:1px;font-size:1px;">&nbsp;</td>
</tr>
</table>
</td>
<td width="70" class="me_hide">&nbsp;</td>
</tr>
</table>
</td>
</tr>
<tr>
<td>
<table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr>
<td width="50" class="me_hide">&nbsp;</td>
<td valign="top" class="me_side_space">
<table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr>
<td class="email-otp-cell" style="font-family:'Inter Tight', Arial, sans-serif;font-size:32px;text-align:center;color:${L.otpCode};font-weight:700;line-height: 40px;padding: 30px;display: block;border:1px solid ${L.otpBorder};" bgcolor="${L.otpBackground}">${escapeHtml(token)}</td>
</tr>
<tr>
<td height="40" style="line-height:1px;font-size:1px;">&nbsp;</td>
</tr>
<tr>
<td class="email-support" style="font-family:'Inter Tight', Arial, sans-serif;font-size:18px;text-align:center;color:${L.support};font-weight:400;line-height: 30px;">Didn’t sign up for this? No worries — simply <br class="me_hide">ignore this message. </td>
</tr>
<tr>
<td height="30" class="me_hide" style="line-height:1px;font-size:1px;">&nbsp;</td>
</tr>
<tr>
<td height="40" style="line-height:1px;font-size:1px;">&nbsp;</td>
</tr>
</table>
</td>
<td width="50" class="me_hide">&nbsp;</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>
<div class="email-outlook-spacer" style="display:none; white-space:nowrap; font:20px courier; color:${L.outlookSpacer}; background-color:${L.outlookSpacer};">- - - - - - - - - - - - - - - - - - - - - - -</div>
</body></html>`;
}

export function renderOtpEmailPreviewHtml(code = "847293") {
  return renderOtpEmailTemplateHtml({
    token: code,
    siteUrl: "https://numeos.app",
  });
}
