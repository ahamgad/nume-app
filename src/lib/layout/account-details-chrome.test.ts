import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  ACCOUNT_DETAILS_HEADER_REGION_BOTTOM_RADIUS_CLASS,
  ACCOUNT_DETAILS_HEADER_REGION_PADDING_CLASS,
  accountDetailsHeaderRegionClassName,
} from "@/lib/layout/account-details-chrome";
import {
  BOTTOM_SHEET_BOTTOM_RADIUS_CLASS,
  BOTTOM_SHEET_TOP_RADIUS_PX,
} from "@/lib/layout/bottom-sheet";

describe("account details header region", () => {
  it("reuses bottom sheet radius token for bottom corners", () => {
    expect(BOTTOM_SHEET_TOP_RADIUS_PX).toBe(36);
    expect(ACCOUNT_DETAILS_HEADER_REGION_BOTTOM_RADIUS_CLASS).toBe(
      BOTTOM_SHEET_BOTTOM_RADIUS_CLASS,
    );
    expect(ACCOUNT_DETAILS_HEADER_REGION_BOTTOM_RADIUS_CLASS).toBe(
      "rounded-b-[36px]",
    );
  });

  it("applies 24px vertical padding when expanded", () => {
    expect(ACCOUNT_DETAILS_HEADER_REGION_PADDING_CLASS).toBe("py-6");
    expect(accountDetailsHeaderRegionClassName(false)).toContain("py-6");
  });

  it("sits flush below the page header and omits padding when collapsed", () => {
    expect(accountDetailsHeaderRegionClassName(false)).toContain("-mt-4");
    expect(accountDetailsHeaderRegionClassName(true)).not.toContain("py-6");
    expect(accountDetailsHeaderRegionClassName(true)).not.toContain("rounded-b");
  });

  it("preserves collapse wiring in account details chrome", () => {
    const chrome = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/components/accounts/account-details-chrome.tsx",
      ),
      "utf8",
    );

    expect(chrome).toContain("useScreenTitleCollapse");
    expect(chrome).toContain("surfaceState={collapsed ? \"canvas\" : \"card\"}");
  });
});
