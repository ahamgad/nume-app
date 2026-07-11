import { describe, expect, it } from "vitest";

import {
  formatEmailSendRateLimitMessage,
  mapSupabaseAuthError,
  parseEmailRateLimitSeconds,
} from "@/lib/auth/errors";

describe("mapSupabaseAuthError", () => {
  it("maps email send rate-limit errors and parses remaining seconds", () => {
    expect(
      mapSupabaseAuthError({
        code: "over_email_send_rate_limit",
        message:
          "For security purposes, you can only request this after 57 seconds.",
      }),
    ).toEqual({ code: "emailSendRateLimit", retryAfterSeconds: 57 });

    expect(
      mapSupabaseAuthError(
        "For security purposes, you can only request this after 57 seconds.",
      ),
    ).toEqual({ code: "emailSendRateLimit", retryAfterSeconds: 57 });
  });

  it("maps rate-limit code without parseable seconds", () => {
    expect(mapSupabaseAuthError({ code: "over_email_send_rate_limit" })).toEqual(
      { code: "emailSendRateLimit" },
    );
  });

  it("falls back to generic", () => {
    expect(mapSupabaseAuthError("Network error")).toEqual({ code: "generic" });
    expect(mapSupabaseAuthError(undefined)).toEqual({ code: "generic" });
  });
});

describe("parseEmailRateLimitSeconds", () => {
  it("parses remaining seconds from Supabase messages", () => {
    expect(
      parseEmailRateLimitSeconds(
        "For security purposes, you can only request this after 57 seconds.",
      ),
    ).toBe(57);
    expect(
      parseEmailRateLimitSeconds(
        "For security purposes, you can only request this after 1 second.",
      ),
    ).toBe(1);
  });

  it("returns undefined when seconds cannot be extracted", () => {
    expect(parseEmailRateLimitSeconds(undefined)).toBeUndefined();
    expect(parseEmailRateLimitSeconds("Rate limit exceeded")).toBeUndefined();
    expect(
      parseEmailRateLimitSeconds(
        "For security purposes, you can only request this after 0 seconds.",
      ),
    ).toBeUndefined();
  });
});

describe("formatEmailSendRateLimitMessage", () => {
  const catalog: Record<string, string> = {
    "auth.errors.emailSendRateLimit":
      "Wait a minute before requesting another email",
    "auth.errors.emailSendRateLimitRetrySecond": "Try again in {count} second",
    "auth.errors.emailSendRateLimitRetrySeconds":
      "Try again in {count} seconds",
    "auth.errors.emailSendRateLimitRetryMinute": "Try again in {count} minute",
    "auth.errors.emailSendRateLimitRetryMinutes":
      "Try again in {count} minutes",
  };

  const t = (key: string, params?: Record<string, string | number>) => {
    let value = catalog[key] ?? key;
    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        value = value.replace(`{${paramKey}}`, String(paramValue));
      }
    }
    return value;
  };

  it("falls back when remaining time is unknown", () => {
    expect(formatEmailSendRateLimitMessage(t)).toBe(
      "Wait a minute before requesting another email",
    );
  });

  it("formats seconds with singular and plural", () => {
    expect(formatEmailSendRateLimitMessage(t, 1)).toBe("Try again in 1 second");
    expect(formatEmailSendRateLimitMessage(t, 57)).toBe(
      "Try again in 57 seconds",
    );
    expect(formatEmailSendRateLimitMessage(t, 60)).toBe(
      "Try again in 60 seconds",
    );
  });

  it("formats minutes when longer than 60 seconds", () => {
    expect(formatEmailSendRateLimitMessage(t, 61)).toBe(
      "Try again in 1 minute",
    );
    expect(formatEmailSendRateLimitMessage(t, 90)).toBe(
      "Try again in 2 minutes",
    );
    expect(formatEmailSendRateLimitMessage(t, 120)).toBe(
      "Try again in 2 minutes",
    );
  });
});
