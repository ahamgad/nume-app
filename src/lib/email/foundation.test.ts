import { describe, expect, it } from "vitest";

import {
  emailFoundationFooter,
  emailFoundationTokens,
  otpEmailContent,
  renderEmailFoundationHtml,
  renderOtpEmailHtml,
  renderOtpEmailPreviewHtml,
} from "@/lib/email/foundation";

describe("NUME Email Foundation V2", () => {
  it("uses approved layout tokens", () => {
    expect(emailFoundationTokens.light.canvas).toBe("#F7F7F7");
    expect(emailFoundationTokens.light.card).toBe("#FFFFFF");
    expect(emailFoundationTokens.light.border).toBe("#EFEFEF");
    expect(emailFoundationTokens.cardRadiusPx).toBe(16);
    expect(emailFoundationTokens.cardPaddingPx).toBe(16);
    expect(emailFoundationTokens.contentMaxWidthPx).toBe(400);
    expect(emailFoundationTokens.logoDisplayPx).toBe(48);
    expect(emailFoundationTokens.logoRadiusPx).toBe(8);
    expect(emailFoundationTokens.codeBlockMinHeightPx).toBe(56);
  });

  it("uses approved vertical rhythm", () => {
    const html = renderOtpEmailPreviewHtml();
    expect(html).toContain(`padding:${emailFoundationTokens.cardPaddingPx}px`);
    expect(html).toContain(`padding:0 0 ${emailFoundationTokens.space12Px}px 0`);
    expect(html).toContain(`padding:0 0 ${emailFoundationTokens.space16Px}px 0`);
    expect(html).toContain(`padding:${emailFoundationTokens.space24Px}px ${emailFoundationTokens.space16Px}px`);
  });

  it("supports light and dark mode hooks", () => {
    const html = renderOtpEmailPreviewHtml();
    expect(html).toContain('content="light dark"');
    expect(html).toContain("@media (prefers-color-scheme: dark)");
    expect(html).toContain("email-logo-light");
    expect(html).toContain("email-logo-dark");
    expect(html).toContain(emailFoundationTokens.dark.canvas);
    expect(html).toContain(emailFoundationTokens.light.canvas);
  });

  it("renders OTP foundation blocks and helper copy", () => {
    const html = renderOtpEmailPreviewHtml("123456");
    expect(html).toContain(otpEmailContent.title);
    expect(html).toContain(otpEmailContent.description);
    expect(html).toContain("123456");
    expect(html).toContain(otpEmailContent.helperText);
    expect(html).toContain(emailFoundationFooter);
    expect(html).toContain("/email/nume-mark-light.png");
    expect(html).toContain("/email/nume-mark-dark.png");
    expect(html).not.toContain("copy and paste");
  });

  it("renders Supabase OTP template token in production HTML", () => {
    const html = renderOtpEmailHtml();
    expect(html).toContain("{{ .Token }}");
    expect(html).toContain(otpEmailContent.subject);
  });

  it("escapes dynamic preview content", () => {
    const html = renderEmailFoundationHtml({
      subject: "Test",
      preheader: "Preview",
      title: "<script>",
      primaryBlockHtml: "<td>safe</td>",
      helperText: 'Say "hello"',
    });
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("Say &quot;hello&quot;");
    expect(html).not.toContain("<script>");
  });
});
