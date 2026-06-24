import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { ACCOUNT_DETAILS_RECENT_RECORDS_LIMIT } from "@/lib/finance/recent-records-display";

describe("balance timestamp foundation", () => {
  it("updates accounts.updated_at only when current_balance changes", () => {
    const migration = fs.readFileSync(
      path.join(
        process.cwd(),
        "supabase/migrations/016_accounts_balance_updated_at.sql",
      ),
      "utf8",
    );

    expect(migration).toContain("set_accounts_updated_at");
    expect(migration).toContain("current_balance is distinct from old.current_balance");
    expect(migration).toContain("new.updated_at = old.updated_at");
  });
});

describe("account records history foundation", () => {
  it("limits recent records to three on detail screens", () => {
    expect(ACCOUNT_DETAILS_RECENT_RECORDS_LIMIT).toBe(3);

    for (const screen of [
      "account-details-screen.tsx",
      "savings-details-screen.tsx",
      "credit-card-details-screen.tsx",
    ]) {
      const source = fs.readFileSync(
        path.join(process.cwd(), "src/components/screens", screen),
        "utf8",
      );
      expect(source).toContain("ACCOUNT_DETAILS_RECENT_RECORDS_LIMIT");
      expect(source).toContain("totalRecordCount={allRecords.length}");
    }
  });

  it("uses account details header and card-wrapped record rows on history screen", () => {
    const source = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/components/screens/account-records-history-screen.tsx",
      ),
      "utf8",
    );

    expect(source).toContain("AccountDetailsStackHeader");
    expect(source).toContain("AccountDetailsHeaderRegion");
    expect(source).toContain("AccountDetailsContentHeader");
    expect(source).toContain("ScrollChipSelect");
    expect(source).toContain("CARD_SURFACE_CLASS");
    expect(source).toContain("RecordRow");
    expect(source).toContain("EmptyState");
    expect(source).toContain("ACCOUNT_RECORDS_HISTORY_SECTION_GAP_CLASS");
    expect(source).toContain("ACCOUNT_RECORDS_HISTORY_CARD_GAP_CLASS");
    expect(source).toContain('accounts.recordsHistory.filters.thisMonth');
    expect(source).toContain("onRefresh={refresh}");
  });

  it("removes new balance preview from income and expense forms only", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "src/components/records/record-form-fields.tsx"),
      "utf8",
    );

    expect(source).toContain('type === "adjustment"');
    expect(source).toContain("records.preview.newBalance");
    expect(source).not.toContain('type !== "transfer"');
  });
});
