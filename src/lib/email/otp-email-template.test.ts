import { describe, expect, it } from "vitest";

import {
  OTP_EMAIL_ICON_DISPLAY_PX,
  OTP_EMAIL_SUBJECT,
  OTP_EMAIL_THEME,
  OTP_EMAIL_TOKEN,
  renderOtpEmailPreviewHtml,
  renderOtpEmailTemplateHtml,
} from "@/lib/email/otp-email-template";

describe("NUME OTP email template", () => {
  it("renders the Inter Tight table layout from the approved source HTML", () => {
    const html = renderOtpEmailPreviewHtml("123456");
    expect(html).toContain('class="me_main_table email-page-main"');
    expect(html).toContain('width="600"');
    expect(html).toContain("Confirm Your Email to");
    expect(html).toContain(
      "Please confirm your email address using the code below",
    );
    expect(html).toContain("123456");
    expect(html).toContain("Didn’t sign up for this?");
    expect(html).toContain("Inter Tight");
  });

  it("maps every semantic light color to a dark equivalent", () => {
    const html = renderOtpEmailPreviewHtml();
    const darkBlock = html.slice(
      html.indexOf("@media (prefers-color-scheme: dark)"),
    );

    for (const [key, lightColor] of Object.entries(OTP_EMAIL_THEME.light)) {
      const darkColor =
        OTP_EMAIL_THEME.dark[key as keyof typeof OTP_EMAIL_THEME.dark];
      expect(html).toContain(lightColor);
      expect(darkBlock).toContain(darkColor);
    }
  });

  it("swaps light and dark brand icons at 80px", () => {
    const html = renderOtpEmailPreviewHtml();
    expect(html).toContain(`/email/nume-icon.png`);
    expect(html).toContain(`/email/nume-icon-dark.png`);
    expect(html).toContain(`width="${OTP_EMAIL_ICON_DISPLAY_PX}"`);
    expect(html).toContain(`height="${OTP_EMAIL_ICON_DISPLAY_PX}"`);
    expect(html).toContain(".email-brand-light");
    expect(html).toContain(".email-brand-dark");
  });

  it("keeps the Supabase OTP token and site URL placeholders", () => {
    const html = renderOtpEmailTemplateHtml();
    expect(html).toContain(OTP_EMAIL_TOKEN);
    expect(html).toContain("{{ .SiteURL }}");
  });

  it("supports light and dark mode email client hooks", () => {
    const html = renderOtpEmailPreviewHtml();
    expect(html).toContain('content="light dark"');
    expect(html).toContain('name="supported-color-schemes"');
    expect(html).toContain("@media (prefers-color-scheme: dark)");
    expect(html).toContain(".email-page-outer");
    expect(html).toContain(".email-page-main");
    expect(html).toContain(".email-headline");
    expect(html).toContain(".email-support");
    expect(html).toContain(".email-otp-cell");
    expect(html).toContain(".email-logo-link");
    expect(html).toContain(".email-preheader");
    expect(html).toContain(".email-outlook-spacer");
  });

  it("preserves Outlook and mobile compatibility markup", () => {
    const html = renderOtpEmailPreviewHtml();
    expect(html).toContain("XHTML 1.0 Transitional");
    expect(html).toContain("mso-table-lspace");
    expect(html).toContain("mso-line-height-rule");
    expect(html).toContain('class="me_hide"');
    expect(html).toContain("@media only screen and (max-width:600px)");
    expect(html).toContain('bgcolor="');
  });

  it("exports the Supabase mailer subject", () => {
    expect(OTP_EMAIL_SUBJECT).toBe("Your NUME sign-in code");
  });
});
