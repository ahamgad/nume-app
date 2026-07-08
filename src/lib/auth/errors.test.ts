import { describe, expect, it } from "vitest";

import { mapSupabaseAuthError } from "@/lib/auth/errors";

describe("mapSupabaseAuthError", () => {
  it("maps invalid login credentials", () => {
    expect(mapSupabaseAuthError("Invalid login credentials")).toBe(
      "invalidCredentials",
    );
  });

  it("maps duplicate registration", () => {
    expect(mapSupabaseAuthError("User already registered")).toBe("emailInUse");
  });

  it("maps weak password messages", () => {
    expect(
      mapSupabaseAuthError("Password should be at least 8 characters"),
    ).toBe("weakPassword");
  });

  it("falls back to generic", () => {
    expect(mapSupabaseAuthError("Network error")).toBe("generic");
    expect(mapSupabaseAuthError(undefined)).toBe("generic");
  });
});
