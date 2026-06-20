import { describe, expect, it } from "vitest";

import {
  NUME_BOTTOM_SHEET_ENTER_CLASS,
  NUME_MODAL_OVERLAY_ENTER_CLASS,
  NUME_MOTION_EASE,
  NUME_MOTION_EASE_CLASS,
  NUME_OVERLAY_ENTER_CLASS,
  numeMotionSafeScreenEnterClass,
  numeScreenEnterClass,
  shouldUseStackScreenTransition,
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

    expect(numeScreenEnterClass(true)).toContain("slide-in-from-left-full");
    expect(numeScreenEnterClass(false)).toContain("slide-in-from-right-full");
    expect(numeScreenEnterClass(true)).toContain(NUME_MOTION_EASE_CLASS);

    expect(numeMotionSafeScreenEnterClass(true)).toContain(
      "slide-in-from-left-full",
    );
    expect(NUME_MODAL_OVERLAY_ENTER_CLASS).toContain("fixed inset-0 z-50");
  });

  it("animates stack navigation but not tab-root switches", () => {
    expect(
      shouldUseStackScreenTransition("/accounts", "/accounts/abc", "forward"),
    ).toBe(true);
    expect(
      shouldUseStackScreenTransition("/accounts/abc", "/accounts", "back"),
    ).toBe(true);
    expect(
      shouldUseStackScreenTransition("/accounts", "/goals", "forward"),
    ).toBe(false);
    expect(shouldUseStackScreenTransition("/", "/more", "forward")).toBe(false);
    expect(
      shouldUseStackScreenTransition("/accounts/abc", "/goals", "forward"),
    ).toBe(false);
    expect(
      shouldUseStackScreenTransition("/more/language", "/more", "back"),
    ).toBe(true);
  });
});
