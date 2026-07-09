import { beforeEach, describe, expect, it, vi } from "vitest";

const exchangeCodeForSession = vi.fn();
const verifyOtp = vi.fn();
const getUser = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: {
      exchangeCodeForSession,
      verifyOtp,
      getUser,
    },
  }),
}));

import { completeAuthCallback } from "@/lib/auth/complete-auth-callback";

function createRequest() {
  return {
    cookies: {
      getAll: () => [],
    },
  } as never;
}

function createResponse() {
  const cookies = new Map<string, string>();
  return {
    cookies: {
      set: (name: string, value: string) => {
        cookies.set(name, value);
      },
    },
    _cookies: cookies,
  } as never;
}

describe("completeAuthCallback", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    exchangeCodeForSession.mockReset();
    verifyOtp.mockReset();
    getUser.mockReset();
  });

  it("returns true when code exchange succeeds", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });

    const result = await completeAuthCallback(createRequest(), createResponse(), {
      code: "pkce-code",
      tokenHash: null,
      type: null,
    });

    expect(result).toBe(true);
    expect(exchangeCodeForSession).toHaveBeenCalledWith("pkce-code");
  });

  it("returns true when exchange fails but a session already exists", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: new Error("already used") });
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const result = await completeAuthCallback(createRequest(), createResponse(), {
      code: "pkce-code",
      tokenHash: null,
      type: null,
    });

    expect(result).toBe(true);
  });

  it("returns false when exchange fails and no session exists", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: new Error("invalid") });
    getUser.mockResolvedValue({ data: { user: null } });

    const result = await completeAuthCallback(createRequest(), createResponse(), {
      code: "pkce-code",
      tokenHash: null,
      type: null,
    });

    expect(result).toBe(false);
  });

  it("verifies token_hash when code is absent", async () => {
    verifyOtp.mockResolvedValue({ error: null });

    const result = await completeAuthCallback(createRequest(), createResponse(), {
      code: null,
      tokenHash: "hash",
      type: "recovery",
    });

    expect(result).toBe(true);
    expect(verifyOtp).toHaveBeenCalledWith({
      token_hash: "hash",
      type: "recovery",
    });
  });

  it("returns false when params are missing and no session exists", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const result = await completeAuthCallback(createRequest(), createResponse(), {
      code: null,
      tokenHash: null,
      type: null,
    });

    expect(result).toBe(false);
  });
});
