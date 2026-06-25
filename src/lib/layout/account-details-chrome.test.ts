import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  ACCOUNT_DETAILS_BODY_SURFACE_CLASS,
  ACCOUNT_DETAILS_HEADER_REGION_CONTENT_TOP_PADDING_CLASS,
  ACCOUNT_DETAILS_HEADER_REGION_PAINT_TOP_EXTENSION_CLASS,
  ACCOUNT_DETAILS_HEADER_REGION_VISUAL_INSET_PX,
  ACCOUNT_DETAILS_TITLE_CLASS,
  accountDetailsHeaderRegionContentClassName,
  accountDetailsHeaderRegionPaintClassName,
  accountDetailsHeaderRegionShellClassName,
} from "@/lib/layout/account-details-chrome";
import { PULL_TO_REFRESH_MAX_VISUAL_OFFSET_PX } from "@/lib/layout/pull-to-refresh";

describe("account details header region", () => {
  it("omits bottom corner radius on the hero paint layer", () => {
    expect(accountDetailsHeaderRegionPaintClassName()).not.toContain(
      "rounded-b-",
    );
  });

  it("uses paint-only chrome with extended top reach for PTR", () => {
    expect(ACCOUNT_DETAILS_HEADER_REGION_VISUAL_INSET_PX).toBe(24);
    expect(PULL_TO_REFRESH_MAX_VISUAL_OFFSET_PX).toBe(88);
    expect(ACCOUNT_DETAILS_HEADER_REGION_PAINT_TOP_EXTENSION_CLASS).toBe(
      "-top-[calc(88px+24px)]",
    );
    expect(accountDetailsHeaderRegionShellClassName()).not.toContain("py-6");
    expect(accountDetailsHeaderRegionPaintClassName()).toContain("absolute");
    expect(accountDetailsHeaderRegionPaintClassName()).toContain("bg-card");
    expect(accountDetailsHeaderRegionPaintClassName()).toContain(
      ACCOUNT_DETAILS_HEADER_REGION_PAINT_TOP_EXTENSION_CLASS,
    );
  });

  it("uses 18px account details title typography", () => {
    expect(ACCOUNT_DETAILS_TITLE_CLASS).toContain("text-[1.125rem]");
    expect(ACCOUNT_DETAILS_TITLE_CLASS).toContain("font-semibold");

    const summary = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/components/accounts/account-details-summary.tsx",
      ),
      "utf8",
    );

    expect(summary).toContain("ACCOUNT_DETAILS_TITLE_CLASS");
    expect(summary).toContain("ACCOUNT_DETAILS_SUMMARY_LOGO_SIZE_PX = 48");
    expect(summary).toContain("size-12");
  });

  it("adds 16px top and 48px bottom padding in the title section", () => {
    expect(ACCOUNT_DETAILS_HEADER_REGION_CONTENT_TOP_PADDING_CLASS).toBe(
      "pt-4",
    );
    expect(accountDetailsHeaderRegionContentClassName()).toContain("pt-4");
    expect(accountDetailsHeaderRegionContentClassName()).toContain("pb-12");
  });

  it("overlaps balance content with app-background body surface", () => {
    expect(ACCOUNT_DETAILS_BODY_SURFACE_CLASS).toContain("-mt-8");
    expect(ACCOUNT_DETAILS_BODY_SURFACE_CLASS).toContain("rounded-t-[36px]");
    expect(ACCOUNT_DETAILS_BODY_SURFACE_CLASS).toContain("bg-background");
    expect(ACCOUNT_DETAILS_BODY_SURFACE_CLASS).toContain("z-[1]");
    expect(ACCOUNT_DETAILS_BODY_SURFACE_CLASS).toContain("pt-6");
    expect(accountDetailsHeaderRegionShellClassName()).not.toContain("mb-6");
  });

  it("sits flush below the page header via shell negative margin", () => {
    expect(accountDetailsHeaderRegionShellClassName()).toContain("-mt-4");
  });

  it("moves with PTR content and does not use counter-transform or bridge", () => {
    const chrome = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/components/accounts/account-details-chrome.tsx",
      ),
      "utf8",
    );

    expect(chrome).not.toContain("AccountDetailsHeaderPullBridge");
    expect(chrome).not.toContain("z-[35]");
    expect(chrome).not.toContain("pullToRefreshCounterTransformStyle");
    expect(chrome).not.toContain("usePullToRefreshVisual");
    expect(chrome).not.toContain("fixed");
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
