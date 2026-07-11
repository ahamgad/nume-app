import { describe, expect, it } from "vitest";

import {
  isApplicationRoute,
  isDistributionRoute,
  isTransportRoute,
} from "@/lib/navigation/runtime-routes";

describe("isDistributionRoute", () => {
  it("matches the landing page only", () => {
    expect(isDistributionRoute("/")).toBe(true);
    expect(isDistributionRoute("/continue")).toBe(false);
  });
});

describe("isTransportRoute", () => {
  it("matches no routes after legacy transport removal", () => {
    expect(isTransportRoute("/verify-email")).toBe(false);
    expect(isTransportRoute("/auth/callback")).toBe(false);
  });
});

describe("isApplicationRoute", () => {
  it("matches auth entry and tab roots", () => {
    expect(isApplicationRoute("/continue")).toBe(true);
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

  it("excludes distribution routes", () => {
    expect(isApplicationRoute("/")).toBe(false);
  });
});
