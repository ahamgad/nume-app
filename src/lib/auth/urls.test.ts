import { afterEach, describe, expect, it } from "vitest";

import { getAuthCallbackUrl } from "@/lib/auth/urls";

describe("getAuthCallbackUrl", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  it("builds callback URLs from getAppUrl", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://numeos.app";
    expect(getAuthCallbackUrl("/verify-email")).toBe(
      "https://numeos.app/auth/callback?next=%2Fverify-email",
    );
  });
});
