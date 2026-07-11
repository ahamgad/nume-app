import { describe, expect, it } from "vitest";

import {
  OTP_EMAIL_SUBJECT,
  OTP_EMAIL_TOKEN,
  renderOtpEmailPreviewHtml,
  renderOtpEmailTemplateHtml,
} from "@/lib/email/otp-email-template";

describe("NUME OTP email template", () => {
  it("renders a centered minimal card layout", () => {
    const html = renderOtpEmailPreviewHtml("123456");
    expect(html).toContain('max-width:340px');
    expect(html).toContain("padding:56px 28px 32px 28px");
    expect(html).toContain("Enter your code");
    expect(html).toContain("123456");
    expect(html).toContain("2026 © NUME");
    expect(html).toContain('alt="NUME"');
    expect(html).toContain("/email/nume-icon.png");
    expect(html).toContain("/email/nume-wordmark.png");
    expect(html).not.toContain("/email/nume-logo.png");
  });

  it("uses the brand lockup and OTP box styling", () => {
    const html = renderOtpEmailPreviewHtml();
    expect(html).toContain("width:20px;height:20px");
    expect(html).toContain("width:45px;height:15px");
    expect(html).toContain("font-size:32px");
    expect(html).toContain("font-size:36px");
    expect(html).toContain("border-radius:12px");
    expect(html).toContain("ui-monospace");
  });

  it("excludes buttons, links, and extra sections", () => {
    const html = renderOtpEmailPreviewHtml();
    expect(html).not.toContain("<a ");
    expect(html).not.toContain("<button");
    expect(html).not.toContain("Follow this link");
    expect(html).not.toContain("Sign in");
  });

  it("keeps the Supabase OTP token in production HTML", () => {
    const html = renderOtpEmailTemplateHtml();
    expect(html).toContain(OTP_EMAIL_TOKEN);
    expect(html).toContain(OTP_EMAIL_SUBJECT);
    expect(html).toContain("{{ .SiteURL }}");
  });

  it("supports light and dark mode hooks", () => {
    const html = renderOtpEmailPreviewHtml();
    expect(html).toContain('content="light dark"');
    expect(html).toContain("@media (prefers-color-scheme: dark)");
  });
});
