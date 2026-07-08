import { describe, expect, it } from "vitest";

import {
  getSplashExitDelayMs,
  isSplashHandoffRoute,
  isSplashInitializationReady,
  shouldSkipSplashOnLoad,
} from "@/lib/app/splash-session";

describe("getSplashExitDelayMs", () => {
  it("waits until the minimum splash duration has elapsed", () => {
    expect(getSplashExitDelayMs(300)).toBe(700);
    expect(getSplashExitDelayMs(1100)).toBe(0);
  });

  it("uses a shorter minimum for reduced motion", () => {
    expect(getSplashExitDelayMs(100, true)).toBe(500);
  });
});

describe("isSplashInitializationReady", () => {
  it("waits for auth and finance before exit", () => {
    expect(
      isSplashInitializationReady({
        authLoading: true,
        user: null,
        isFinanceReady: false,
      }),
    ).toBe(false);
    expect(
      isSplashInitializationReady({
        authLoading: false,
        user: { id: "u1" },
        isFinanceReady: false,
      }),
    ).toBe(false);
    expect(
      isSplashInitializationReady({
        authLoading: false,
        user: { id: "u1" },
        isFinanceReady: true,
      }),
    ).toBe(true);
    expect(
      isSplashInitializationReady({
        authLoading: false,
        user: null,
        isFinanceReady: false,
      }),
    ).toBe(true);
  });
});

describe("isSplashHandoffRoute", () => {
  it("keeps the overlay until routing leaves /splash", () => {
    expect(isSplashHandoffRoute("/splash")).toBe(false);
    expect(isSplashHandoffRoute("/")).toBe(true);
    expect(isSplashHandoffRoute("/login")).toBe(true);
  });
});

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
