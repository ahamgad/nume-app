import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("RecentRecordsSection", () => {
  it("uses boxed empty state with separate title and description keys", () => {
    const source = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/components/accounts/recent-records-section.tsx",
      ),
      "utf8",
    );

    expect(source).toContain("accounts.details.records.emptyTitle");
    expect(source).toContain("accounts.details.records.emptyDescription");
    expect(source).toContain("AccountDetailsSection");
    expect(source).not.toContain('"accounts.details.records.empty"');
  });

  it("is used on account detail screens but not certificates", () => {
    const accountDetails = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/components/screens/account-details-screen.tsx",
      ),
      "utf8",
    );
    const certificateDetails = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/components/screens/certificate-details-screen.tsx",
      ),
      "utf8",
    );

    expect(accountDetails).toContain("RecentRecordsSection");
    expect(accountDetails).toContain("isArchived={isArchived}");
    expect(certificateDetails).not.toContain("RecentRecordsSection");
  });

  it("hides archived empty states via shared visibility helper", () => {
    const source = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/components/accounts/recent-records-section.tsx",
      ),
      "utf8",
    );

    expect(source).toContain("shouldShowRecentRecordsSection");
    expect(source).toContain("return null");
    expect(source).toContain("ACCOUNT_DETAILS_RECENT_RECORDS_LIMIT");
    expect(source).toContain("FormSectionActionButton");
    expect(source).toContain("ACCOUNT_DETAILS_RECORD_SEPARATOR_MARGIN_CLASS");
    expect(source).toContain("ACCOUNT_DETAILS_VIEW_ALL_BUTTON_MARGIN_TOP_CLASS");
    expect(source).toContain("showViewAll ?");
    expect(source).toContain("accounts.details.records.viewAll");
  });
});

describe("splash screen spacing", () => {
  it("uses the rebuilt splash wordmark typography and spacing", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "src/components/screens/splash-animation.tsx"),
      "utf8",
    );

    expect(source).toContain("WORDMARK_GAP_PX = 8");
    expect(source).toContain("WORDMARK_SIZE_PX = 42");
    expect(source).toContain("NUME_SPLASH_LOGO_SIZE_PX");
    expect(source).toContain("tracking-[0.1em]");
    expect(source).toContain("text-[2.625rem] font-bold");
  });
});
