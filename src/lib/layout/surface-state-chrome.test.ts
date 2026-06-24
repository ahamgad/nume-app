import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { CARD_SURFACE_BG_CLASS } from "@/lib/layout/card-surface";
import {
  SURFACE_STATE_ACCENT_ON_CANVAS_CLASS,
  SURFACE_STATE_ACCENT_ON_CARD_CLASS,
  surfaceStateAccentBackgroundClass,
} from "@/lib/layout/surface-state-chrome";

describe("surface-state foundation", () => {
  it("uses card surface background on canvas", () => {
    expect(SURFACE_STATE_ACCENT_ON_CANVAS_CLASS).toBe(CARD_SURFACE_BG_CLASS);
    expect(surfaceStateAccentBackgroundClass("canvas")).toContain("bg-card");
  });

  it("uses app background inside card surfaces", () => {
    expect(SURFACE_STATE_ACCENT_ON_CARD_CLASS).toBe("bg-background");
    expect(surfaceStateAccentBackgroundClass("card")).toBe("bg-background");
  });

  it("propagates through HeaderIconButton, secondary Button, and balance edit", () => {
    const headerButton = fs.readFileSync(
      path.join(process.cwd(), "src/components/layout/header-icon-button.tsx"),
      "utf8",
    );
    const button = fs.readFileSync(
      path.join(process.cwd(), "src/components/ui/button.tsx"),
      "utf8",
    );
    const balanceCard = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/components/accounts/account-details-balance-card.tsx",
      ),
      "utf8",
    );

    expect(headerButton).toContain("surfaceStateAccentBackgroundClass");
    expect(headerButton).toContain("useSurfaceState");
    expect(button).toContain('variant === "secondary"');
    expect(button).toContain("surfaceStateAccentBackgroundClass");
    expect(balanceCard).toContain('SurfaceStateProvider value="card"');
  });
});
