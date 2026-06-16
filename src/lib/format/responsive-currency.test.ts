import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  CURRENCY_AMOUNT_TRAILING_GAP_PX,
  computeFittedFontSizePx,
  fitFontSizeToWidth,
  getAvailableAmountWidth,
  getTierFontBounds,
  remToPx,
} from "@/lib/format/responsive-currency";

describe("getAvailableAmountWidth", () => {
  it("reserves trailing button width and 8px gap", () => {
    expect(getAvailableAmountWidth(300, 28, true)).toBe(
      300 - 28 - CURRENCY_AMOUNT_TRAILING_GAP_PX,
    );
  });

  it("uses full width when no trailing action", () => {
    expect(getAvailableAmountWidth(300, 0, false)).toBe(300);
  });
});

describe("fitFontSizeToWidth", () => {
  it("returns max size when text fits", () => {
    const size = fitFontSizeToWidth(() => 200, 300, 36, 14);
    expect(size).toBe(36);
  });

  it("binary-searches down for overflowing text", () => {
    const size = fitFontSizeToWidth(
      (fontSize) => (fontSize / 36) * 400,
      200,
      36,
      14,
    );
    expect(size).toBeLessThan(36);
    expect(size).toBeGreaterThanOrEqual(14);
  });

  it("never returns below minimum readable size", () => {
    const size = fitFontSizeToWidth(() => 2000, 50, 36, 14);
    expect(size).toBe(14);
  });

  it("fits large amounts when trailing space is reserved", () => {
    const available = getAvailableAmountWidth(320, 28, true);
    const size = fitFontSizeToWidth(
      (fontSize) => (fontSize / 36) * 600,
      available,
      36,
      14,
    );
    expect((size / 36) * 600).toBeLessThanOrEqual(available);
  });
});

describe("computeFittedFontSizePx", () => {
  it("keeps max size when text fits", () => {
    expect(computeFittedFontSizePx(200, 300, 36, 14)).toBe(36);
  });
});

describe("responsive currency tiers", () => {
  it("defines hero tier bounds from rem", () => {
    const { maxPx, minPx } = getTierFontBounds("hero");
    expect(maxPx).toBe(remToPx(2.25));
    expect(minPx).toBe(remToPx(0.875));
  });
});

describe("dashboard upcoming interest widget", () => {
  it("is not rendered by the dashboard screen module", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "src/components/screens/dashboard-screen.tsx"),
      "utf8",
    );

    expect(source).not.toContain("dashboard.certificates.upcomingInterest.title");
    expect(source).not.toContain("upcomingInterestAmount");
  });
});

describe("balance edit icon button", () => {
  it("uses the shared IconButton component", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "src/components/accounts/balance-metric-card.tsx"),
      "utf8",
    );

    expect(source).toContain("IconButton");
    expect(source).toContain('size="sm"');
    expect(source).not.toContain("rounded-md text-muted-foreground");
  });

  it("IconButton defaults to secondary circular styling", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "src/components/ui/icon-button.tsx"),
      "utf8",
    );

    expect(source).toContain('variant = "secondary"');
    expect(source).toContain("rounded-full");
    expect(source).toContain("icon-sm");
  });
});
