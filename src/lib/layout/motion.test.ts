import { describe, expect, it } from "vitest";

import {
  NUME_BOTTOM_SHEET_ENTER_CLASS,
  NUME_MODAL_OVERLAY_ENTER_CLASS,
  NUME_MOTION_EASE,
  NUME_MOTION_EASE_CLASS,
  NUME_OVERLAY_ENTER_CLASS,
  NUME_SCREEN_ENTER_CLASS,
  numeMotionSafeScreenEnterClass,
} from "@/lib/layout/motion";

describe("NUME motion tokens", () => {
  it("uses the splash-aligned deceleration curve without overshoot easings", () => {
    expect(NUME_MOTION_EASE).toBe("cubic-bezier(0.45, 0.05, 0.2, 1)");
    expect(NUME_MOTION_EASE_CLASS).toContain(NUME_MOTION_EASE);
    expect(NUME_MOTION_EASE).not.toMatch(/back|bounce|elastic|spring/i);
  });

  it("applies unified enter classes to navigation surfaces", () => {
    expect(NUME_OVERLAY_ENTER_CLASS).toContain("fade-in-0");
    expect(NUME_OVERLAY_ENTER_CLASS).toContain("duration-200");
    expect(NUME_OVERLAY_ENTER_CLASS).toContain(NUME_MOTION_EASE_CLASS);

    expect(NUME_BOTTOM_SHEET_ENTER_CLASS).toContain("slide-in-from-bottom-4");
    expect(NUME_BOTTOM_SHEET_ENTER_CLASS).toContain(NUME_MOTION_EASE_CLASS);

    expect(NUME_SCREEN_ENTER_CLASS).toContain("fade-in-0");
    expect(NUME_SCREEN_ENTER_CLASS).not.toContain("slide-in-from");
    expect(NUME_SCREEN_ENTER_CLASS).toContain(NUME_MOTION_EASE_CLASS);

    expect(numeMotionSafeScreenEnterClass()).toContain("fade-in-0");
    expect(numeMotionSafeScreenEnterClass()).not.toContain("slide-in-from");
    expect(NUME_MODAL_OVERLAY_ENTER_CLASS).toContain("fixed inset-0 z-50");
  });
});
