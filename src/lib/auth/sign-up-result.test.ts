import type { AuthResponse } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { resolveSignUpResult } from "@/lib/auth/sign-up-result";

describe("resolveSignUpResult", () => {
  it("maps duplicate email via empty identities to emailInUse", () => {
    expect(
      resolveSignUpResult({
        data: {
          user: {
            id: "user-1",
            identities: [],
          },
          session: null,
        },
        error: null,
      } as unknown as AuthResponse),
    ).toEqual({ error: "emailInUse" });
  });

  it("returns null error for a new signup user", () => {
    expect(
      resolveSignUpResult({
        data: {
          user: {
            id: "user-2",
            identities: [{ id: "identity-1" }],
          },
          session: null,
        },
        error: null,
      } as unknown as AuthResponse),
    ).toEqual({ error: null });
  });

  it("maps Supabase errors", () => {
    expect(
      resolveSignUpResult({
        data: { user: null, session: null },
        error: {
          message: "User already registered",
          name: "AuthApiError",
          status: 400,
        },
      } as unknown as AuthResponse),
    ).toEqual({ error: "emailInUse" });
  });
});
