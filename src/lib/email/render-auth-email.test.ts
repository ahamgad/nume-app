import { describe, expect, it } from "vitest";

import {
  confirmEmailContent,
  emailDesignTokens,
  recoveryEmailContent,
} from "@/lib/email/design-tokens";
import { renderAuthEmailHtml } from "@/lib/email/render-auth-email";

describe("auth email rendering target", () => {
  it("uses Design System canvas and card tokens", () => {
    expect(emailDesignTokens.canvas).toBe("#F7F7F7");
    expect(emailDesignTokens.card).toBe("#FFFFFF");
    expect(emailDesignTokens.border).toBe("#EFEFEF");
    expect(emailDesignTokens.cardRadiusPx).toBe(16);
  });

  it("renders shared shell structure without link fallback", () => {
    const html = renderAuthEmailHtml(confirmEmailContent);
    expect(html).toContain(confirmEmailContent.headline);
    expect(html).toContain(confirmEmailContent.ctaLabel);
    expect(html).toContain(confirmEmailContent.oneTimeNote);
    expect(html).toContain(confirmEmailContent.securityNote);
    expect(html).toContain("© NUME");
    expect(html).toContain("/email/nume-mark.png");
    expect(html).not.toContain("copy and paste");
    expect(html).not.toContain("If the button");
  });

  it("keeps recovery CTA href with TokenHash callback", () => {
    const html = renderAuthEmailHtml(recoveryEmailContent);
    expect(html).toContain("type=recovery");
    expect(html).toContain("next=/reset-password");
    expect(html).toContain("{{ .TokenHash }}");
  });
});
