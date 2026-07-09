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

  it("maps unconfirmed email errors", () => {
    expect(mapSupabaseAuthError({ code: "email_not_confirmed" })).toBe(
      "emailNotConfirmed",
    );
    expect(mapSupabaseAuthError("Email not confirmed")).toBe("emailNotConfirmed");
  });

  it("maps same-password update errors", () => {
    expect(mapSupabaseAuthError({ code: "same_password" })).toBe("samePassword");
    expect(
      mapSupabaseAuthError(
        "New password should be different from the old password.",
      ),
    ).toBe("samePassword");
  });

  it("maps email send rate-limit errors", () => {
    expect(mapSupabaseAuthError({ code: "over_email_send_rate_limit" })).toBe(
      "emailSendRateLimit",
    );
    expect(
      mapSupabaseAuthError(
        "For security purposes, you can only request this after 57 seconds.",
      ),
    ).toBe("emailSendRateLimit");
  });

  it("falls back to generic", () => {
    expect(mapSupabaseAuthError("Network error")).toBe("generic");
    expect(mapSupabaseAuthError(undefined)).toBe("generic");
  });
});
