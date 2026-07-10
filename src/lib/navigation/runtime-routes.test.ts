import { describe, expect, it } from "vitest";

import {
  isApplicationRoute,
  isDistributionRoute,
  isTransportRoute,
} from "@/lib/navigation/runtime-routes";

describe("isDistributionRoute", () => {
  it("matches the landing page only", () => {
    expect(isDistributionRoute("/")).toBe(true);
    expect(isDistributionRoute("/login")).toBe(false);
  });
});

describe("isTransportRoute", () => {
  it("matches transport and callback routes", () => {
    expect(isTransportRoute("/verify-email")).toBe(true);
    expect(isTransportRoute("/reset-password")).toBe(true);
    expect(isTransportRoute("/auth/callback")).toBe(true);
    expect(isTransportRoute("/login")).toBe(false);
  });
});

describe("isApplicationRoute", () => {
  it("matches auth entry and tab roots", () => {
    expect(isApplicationRoute("/continue")).toBe(true);
    expect(isApplicationRoute("/login")).toBe(true);
    expect(isApplicationRoute("/register")).toBe(true);
    expect(isApplicationRoute("/forgot-password")).toBe(true);
    expect(isApplicationRoute("/dashboard")).toBe(true);
    expect(isApplicationRoute("/planning")).toBe(true);
    expect(isApplicationRoute("/accounts")).toBe(true);
    expect(isApplicationRoute("/goals")).toBe(true);
    expect(isApplicationRoute("/more")).toBe(true);
  });

  it("matches stack routes under application prefixes", () => {
    expect(isApplicationRoute("/accounts/new")).toBe(true);
    expect(isApplicationRoute("/accounts/abc-123/edit")).toBe(true);
    expect(isApplicationRoute("/more/profile")).toBe(true);
    expect(isApplicationRoute("/splash")).toBe(true);
    expect(isApplicationRoute("/splash-debug")).toBe(true);
  });

  it("excludes distribution and transport routes", () => {
    expect(isApplicationRoute("/")).toBe(false);
    expect(isApplicationRoute("/verify-email")).toBe(false);
    expect(isApplicationRoute("/reset-password")).toBe(false);
    expect(isApplicationRoute("/auth/callback")).toBe(false);
  });
});
