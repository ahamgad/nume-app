import { describe, expect, it } from "vitest";

import {
  INACTIVITY_SPLASH_THRESHOLD_MS,
  shouldShowSplashOnColdStart,
} from "@/lib/app/splash-session";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("shouldShowSplashOnColdStart", () => {
  const now = Date.UTC(2026, 5, 9);

  it("shows splash on first launch", () => {
    expect(shouldShowSplashOnColdStart(null, now)).toBe(true);
  });

  it("shows splash after 3 or more days of inactivity", () => {
    const lastOpened = now - 3 * DAY_MS;
    expect(shouldShowSplashOnColdStart(lastOpened, now)).toBe(true);
    expect(shouldShowSplashOnColdStart(now - 4 * DAY_MS, now)).toBe(true);
  });

  it("skips splash when opened within 3 days", () => {
    expect(shouldShowSplashOnColdStart(now - 2 * DAY_MS, now)).toBe(false);
    expect(shouldShowSplashOnColdStart(now - DAY_MS, now)).toBe(false);
    expect(
      shouldShowSplashOnColdStart(
        now - INACTIVITY_SPLASH_THRESHOLD_MS + 60_000,
        now,
      ),
    ).toBe(false);
  });

  it("treats invalid timestamps as first launch", () => {
    expect(shouldShowSplashOnColdStart(Number.NaN, now)).toBe(true);
  });
});
