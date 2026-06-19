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
    expect(source).toContain("rounded-lg border border-border");
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
  });
});

describe("splash screen spacing", () => {
  it("uses reduced spacing between logo and wordmark", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "src/components/screens/splash-screen.tsx"),
      "utf8",
    );

    expect(source).toContain("mt-1");
    expect(source).not.toContain("mt-2.5");
    expect(source).not.toContain("mt-4 text-xl font-semibold tracking-[0.24em]");
  });
});
