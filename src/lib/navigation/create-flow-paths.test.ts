import { describe, expect, it } from "vitest";

import { isFreshCreateFlowPath } from "@/lib/navigation/create-flow-paths";

describe("isFreshCreateFlowPath", () => {
  it("matches account type create routes", () => {
    expect(isFreshCreateFlowPath("/accounts/new")).toBe(true);
    expect(isFreshCreateFlowPath("/accounts/new/credit_card")).toBe(true);
    expect(isFreshCreateFlowPath("/accounts/new/savings_account")).toBe(true);
    expect(isFreshCreateFlowPath("/accounts/new/certificate")).toBe(true);
  });

  it("does not match existing-state routes", () => {
    expect(isFreshCreateFlowPath("/accounts")).toBe(false);
    expect(isFreshCreateFlowPath("/accounts/abc-123")).toBe(false);
    expect(isFreshCreateFlowPath("/accounts/abc-123/edit")).toBe(false);
    expect(isFreshCreateFlowPath("/accounts/abc-123/records/new")).toBe(false);
  });
});
