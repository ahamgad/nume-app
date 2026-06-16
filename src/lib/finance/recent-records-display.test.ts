import { describe, expect, it } from "vitest";

import { shouldShowRecentRecordsSection } from "@/lib/finance/recent-records-display";

describe("shouldShowRecentRecordsSection", () => {
  it("shows empty state for active accounts with no records", () => {
    expect(shouldShowRecentRecordsSection(false, 0)).toBe(true);
  });

  it("shows records for active accounts with records", () => {
    expect(shouldShowRecentRecordsSection(false, 3)).toBe(true);
  });

  it("shows records for archived accounts with records", () => {
    expect(shouldShowRecentRecordsSection(true, 2)).toBe(true);
  });

  it("hides the section for archived accounts with no records", () => {
    expect(shouldShowRecentRecordsSection(true, 0)).toBe(false);
  });
});
