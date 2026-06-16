import { describe, expect, it } from "vitest";

import { shouldSkipSplashOnLoad } from "@/lib/app/splash-session";

describe("shouldSkipSplashOnLoad", () => {
  it("always allows the splash route", () => {
    expect(
      shouldSkipSplashOnLoad({
        pathname: "/splash",
        splashComplete: false,
        bgResumeEligible: false,
        wasDiscarded: false,
      }),
    ).toBe(true);
  });

  it("shows splash on cold start without a completed session", () => {
    expect(
      shouldSkipSplashOnLoad({
        pathname: "/",
        splashComplete: false,
        bgResumeEligible: false,
        wasDiscarded: false,
      }),
    ).toBe(false);
  });

  it("shows splash when the session was complete but not backgrounded", () => {
    expect(
      shouldSkipSplashOnLoad({
        pathname: "/",
        splashComplete: true,
        bgResumeEligible: false,
        wasDiscarded: false,
      }),
    ).toBe(false);
  });

  it("skips splash on background resume reload", () => {
    expect(
      shouldSkipSplashOnLoad({
        pathname: "/accounts",
        splashComplete: true,
        bgResumeEligible: true,
        wasDiscarded: false,
      }),
    ).toBe(true);
  });

  it("shows splash after the browser discards the page", () => {
    expect(
      shouldSkipSplashOnLoad({
        pathname: "/",
        splashComplete: true,
        bgResumeEligible: true,
        wasDiscarded: true,
      }),
    ).toBe(false);
  });
});
