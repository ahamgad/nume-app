import { describe, expect, it } from "vitest";

import { NUME_EMAIL_COLORS } from "@/lib/email/email-design-tokens";
import {
  OTP_EMAIL_CONTENT_MAX_WIDTH_PX,
  OTP_EMAIL_SUBJECT,
  OTP_EMAIL_TOKEN,
  renderOtpEmailPreviewHtml,
  renderOtpEmailTemplateHtml,
} from "@/lib/email/otp-email-template";

describe("NUME OTP email template", () => {
  it("renders a centered minimal card layout", () => {
    const html = renderOtpEmailPreviewHtml("123456");
    expect(html).toContain(`max-width:${OTP_EMAIL_CONTENT_MAX_WIDTH_PX}px`);
    expect(html).toContain("padding:64px 36px 40px 36px");
    expect(html).toContain("Enter your code");
    expect(html).toContain("123456");
    expect(html).toContain("2026 © NUME");
    expect(html).toContain('alt="NUME"');
    expect(html).toContain("/email/nume-icon.png");
    expect(html).toContain("/email/nume-icon-dark.png");
    expect(html).toContain("/email/nume-wordmark.png");
    expect(html).toContain("/email/nume-wordmark-dark.png");
  });

  it("uses foundation design tokens and typography", () => {
    const html = renderOtpEmailPreviewHtml();
    expect(html).toContain(NUME_EMAIL_COLORS.light.background);
    expect(html).toContain(NUME_EMAIL_COLORS.light.card);
    expect(html).toContain(NUME_EMAIL_COLORS.light.foreground);
    expect(html).toContain(NUME_EMAIL_COLORS.light.mutedForeground);
    expect(html).toContain(NUME_EMAIL_COLORS.light.border);
    expect(html).toContain(NUME_EMAIL_COLORS.dark.background);
    expect(html).toContain(NUME_EMAIL_COLORS.dark.card);
    expect(html).toContain("'Geist Sans'");
    expect(html).toContain("'Geist Mono'");
    expect(html).toContain("/fonts/geist-sans/Geist-Bold.woff2");
  });

  it("uses the brand lockup and OTP box styling", () => {
    const html = renderOtpEmailPreviewHtml();
    expect(html).toContain("width:24px;height:24px");
    expect(html).toContain("font-size:36px");
    expect(html).toContain("font-size:42px");
    expect(html).toContain("border-radius:14px");
    expect(html).toContain("padding:32px 28px");
    expect(html).toContain("font-variant-numeric:tabular-nums");
  });

  it("excludes buttons, links, and extra sections", () => {
    const html = renderOtpEmailPreviewHtml();
    expect(html).not.toContain("<a ");
    expect(html).not.toContain("<button");
    expect(html).not.toContain("Follow this link");
    expect(html).not.toContain("Sign in");
    expect(html).not.toContain("fonts.googleapis.com");
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
    expect(html).toContain(".email-brand-light");
    expect(html).toContain(".email-brand-dark");
  });
});
