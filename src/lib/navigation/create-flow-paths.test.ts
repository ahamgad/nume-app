import { describe, expect, it } from "vitest";

import {
  isAddAccountFlowPath,
  isFreshCreateFlowPath,
} from "@/lib/navigation/create-flow-paths";

describe("isAddAccountFlowPath", () => {
  it("matches all add account routes", () => {
    expect(isAddAccountFlowPath("/accounts/new")).toBe(true);
    expect(isAddAccountFlowPath("/accounts/new/credit_card")).toBe(true);
    expect(isAddAccountFlowPath("/accounts/new/savings_account")).toBe(true);
    expect(isAddAccountFlowPath("/accounts/new/certificate")).toBe(true);
    expect(isAddAccountFlowPath("/accounts/new/current_account")).toBe(true);
    expect(isAddAccountFlowPath("/accounts/new/lending")).toBe(true);
  });

  it("does not match non-add-account routes", () => {
    expect(isAddAccountFlowPath("/accounts")).toBe(false);
    expect(isAddAccountFlowPath("/accounts/abc-123")).toBe(false);
    expect(isAddAccountFlowPath("/accounts/abc/activity/new")).toBe(false);
  });
});

describe("isFreshCreateFlowPath", () => {
  it("matches account create routes", () => {
    expect(isFreshCreateFlowPath("/accounts/new")).toBe(true);
    expect(isFreshCreateFlowPath("/accounts/new/credit_card")).toBe(true);
    expect(isFreshCreateFlowPath("/accounts/new/savings_account")).toBe(true);
  });

  it("matches credit card activity and record create routes", () => {
    expect(isFreshCreateFlowPath("/accounts/abc/activity/new")).toBe(true);
    expect(isFreshCreateFlowPath("/accounts/abc/activity/new/purchase")).toBe(true);
    expect(isFreshCreateFlowPath("/accounts/abc/activity/new/payment")).toBe(true);
    expect(isFreshCreateFlowPath("/accounts/abc/records/new")).toBe(true);
    expect(isFreshCreateFlowPath("/accounts/abc/records/new/expense")).toBe(true);
  });

  it("does not match existing-state routes", () => {
    expect(isFreshCreateFlowPath("/accounts")).toBe(false);
    expect(isFreshCreateFlowPath("/accounts/abc-123")).toBe(false);
    expect(isFreshCreateFlowPath("/accounts/abc-123/edit")).toBe(false);
    expect(isFreshCreateFlowPath("/")).toBe(false);
  });
});
