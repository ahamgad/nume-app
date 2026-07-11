import { beforeEach, describe, expect, it, vi } from "vitest";

const signInWithOtp = vi.fn();
const verifyOtp = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithOtp,
      verifyOtp,
    },
  }),
}));

import { sendEmailOtp, verifyEmailOtp } from "@/lib/auth/email-otp";

describe("sendEmailOtp", () => {
  beforeEach(() => {
    signInWithOtp.mockReset();
  });

  it("requests an email OTP for new and existing users", async () => {
    signInWithOtp.mockResolvedValue({ error: null });

    const result = await sendEmailOtp("user@example.com");

    expect(result.error).toBeNull();
    expect(signInWithOtp).toHaveBeenCalledWith({
      email: "user@example.com",
      options: { shouldCreateUser: true },
    });
  });

  it("maps Supabase errors", async () => {
    signInWithOtp.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });

    const result = await sendEmailOtp("user@example.com");

    expect(result.error).toEqual({ code: "generic" });
  });
});

describe("verifyEmailOtp", () => {
  beforeEach(() => {
    verifyOtp.mockReset();
  });

  it("verifies the email OTP and creates a session", async () => {
    verifyOtp.mockResolvedValue({ error: null });

    const result = await verifyEmailOtp("user@example.com", "123456");

    expect(result.error).toBeNull();
    expect(verifyOtp).toHaveBeenCalledWith({
      email: "user@example.com",
      token: "123456",
      type: "email",
    });
  });

  it("maps Supabase errors", async () => {
    verifyOtp.mockResolvedValue({
      error: { message: "Token has expired or is invalid" },
    });

    const result = await verifyEmailOtp("user@example.com", "000000");

    expect(result.error).toEqual({ code: "generic" });
  });
});
