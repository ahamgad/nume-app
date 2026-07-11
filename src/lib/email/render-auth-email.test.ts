import { describe, expect, it } from "vitest";

import {
  authEmailFooter,
  emailDesignTokens,
  type AuthEmailContent,
} from "@/lib/email/design-tokens";
import { renderAuthEmailHtml } from "@/lib/email/render-auth-email";

const sampleEmailContent: AuthEmailContent = {
  id: "otp",
  subject: "Your NUME sign-in code",
  preheader: "Use this code to continue to NUME",
  headline: "Your sign-in code",
  body: "Enter this code in the app to continue",
  ctaLabel: "Continue to NUME",
  ctaHref: "{{ .SiteURL }}/continue",
  securityNote: "If you didn't request this code, you can safely ignore this email",
  oneTimeNote: "This code can only be used once",
  footer: authEmailFooter,
};

describe("NUME Email Design System — auth baseline", () => {
  it("uses approved layout tokens", () => {
    expect(emailDesignTokens.canvas).toBe("#F7F7F7");
    expect(emailDesignTokens.card).toBe("#FFFFFF");
    expect(emailDesignTokens.border).toBe("#EFEFEF");
    expect(emailDesignTokens.cardRadiusPx).toBe(16);
    expect(emailDesignTokens.cardPaddingPx).toBe(20);
    expect(emailDesignTokens.contentMaxWidthPx).toBe(400);
    expect(emailDesignTokens.logoDisplayPx).toBe(48);
    expect(emailDesignTokens.logoRadiusPx).toBe(8);
    expect(emailDesignTokens.ctaHeightPx).toBe(44);
  });

  it("uses approved vertical rhythm", () => {
    const html = renderAuthEmailHtml(sampleEmailContent);
    expect(html).toContain(`padding:${emailDesignTokens.cardPaddingPx}px`);
    expect(html).toContain(`padding:0 0 ${emailDesignTokens.space16Px}px 0`);
    expect(html).toContain(`padding:0 0 ${emailDesignTokens.space24Px}px 0`);
    expect(html).toContain(`padding:0 0 ${emailDesignTokens.space32Px}px 0`);
    expect(html).toContain(`padding:0 0 ${emailDesignTokens.space36Px}px 0`);
    expect(html).toContain(`padding:${emailDesignTokens.space24Px}px 0 0 0`);
    expect(html).toContain(
      `padding:0 0 ${emailDesignTokens.space12Px}px 0`,
    );
    expect(html).toContain(`height:${emailDesignTokens.ctaHeightPx}px`);
    expect(html).toContain(
      `padding:${emailDesignTokens.ctaPadYPx}px ${emailDesignTokens.space16Px}px`,
    );
  });

  it("renders mark-only logo and outside-card footer", () => {
    const html = renderAuthEmailHtml(sampleEmailContent);
    expect(html).toContain(`width="${emailDesignTokens.logoDisplayPx}"`);
    expect(html).toContain(`border-radius:${emailDesignTokens.logoRadiusPx}px`);
    expect(html).toContain("/email/nume-mark.png");
    expect(html).toContain(sampleEmailContent.securityNote);
    expect(html).toContain(sampleEmailContent.oneTimeNote);
    expect(html).toContain(authEmailFooter);
    expect(html).not.toContain(">NUME</td>");
    expect(html).not.toContain("copy and paste");
    expect(html).not.toContain("If the button");
  });
});
