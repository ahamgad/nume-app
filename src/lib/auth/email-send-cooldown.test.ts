import { describe, expect, it } from "vitest";

import { remainingSecondsUntil } from "@/lib/auth/email-send-cooldown";

describe("remainingSecondsUntil", () => {
  it("returns whole seconds remaining, rounded up", () => {
    const endsAt = 1_000_000;
    expect(remainingSecondsUntil(endsAt, endsAt - 57_100)).toBe(58);
    expect(remainingSecondsUntil(endsAt, endsAt - 57_000)).toBe(57);
    expect(remainingSecondsUntil(endsAt, endsAt - 1)).toBe(1);
  });

  it("clamps at zero when the cooldown has elapsed", () => {
    const endsAt = 1_000_000;
    expect(remainingSecondsUntil(endsAt, endsAt)).toBe(0);
    expect(remainingSecondsUntil(endsAt, endsAt + 5_000)).toBe(0);
  });
});
