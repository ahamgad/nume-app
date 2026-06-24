import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  ACCOUNT_DETAILS_HEADER_REGION_BOTTOM_RADIUS_CLASS,
  ACCOUNT_DETAILS_HEADER_REGION_VISUAL_INSET_CLASS,
  ACCOUNT_DETAILS_HEADER_REGION_VISUAL_INSET_PX,
  accountDetailsHeaderRegionPaintClassName,
  accountDetailsHeaderRegionShellClassName,
} from "@/lib/layout/account-details-chrome";
import {
  BOTTOM_SHEET_BOTTOM_RADIUS_CLASS,
  BOTTOM_SHEET_TOP_RADIUS_PX,
} from "@/lib/layout/bottom-sheet";
import { pullToRefreshCounterTransformStyle } from "@/lib/layout/pull-to-refresh";

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

  it("uses paint-only visual inset without layout padding", () => {
    expect(ACCOUNT_DETAILS_HEADER_REGION_VISUAL_INSET_PX).toBe(24);
    expect(ACCOUNT_DETAILS_HEADER_REGION_VISUAL_INSET_CLASS).toBe(
      "-top-6 -bottom-6",
    );
    expect(accountDetailsHeaderRegionShellClassName()).not.toContain("py-6");
    expect(accountDetailsHeaderRegionPaintClassName()).toContain("absolute");
    expect(accountDetailsHeaderRegionPaintClassName()).toContain("bg-card");
    expect(accountDetailsHeaderRegionPaintClassName()).toContain(
      ACCOUNT_DETAILS_HEADER_REGION_VISUAL_INSET_CLASS,
    );
  });

  it("sits flush below the page header via shell negative margin", () => {
    expect(accountDetailsHeaderRegionShellClassName()).toContain("-mt-4");
  });

  it("applies PTR counter-transform on the hero shell", () => {
    const chrome = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/components/accounts/account-details-chrome.tsx",
      ),
      "utf8",
    );

    expect(chrome).not.toContain("AccountDetailsHeaderPullBridge");
    expect(chrome).not.toContain("z-[35]");
    expect(chrome).toContain("pullToRefreshCounterTransformStyle");
    expect(chrome).toContain("usePullToRefreshVisual");

    const counter = pullToRefreshCounterTransformStyle(40, false);
    expect(counter?.transform).toBe("translate3d(0, -40px, 0)");
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
    expect(chrome).not.toContain("scrollTop");
    expect(chrome).not.toContain("useLayoutEffect");
  });
});
