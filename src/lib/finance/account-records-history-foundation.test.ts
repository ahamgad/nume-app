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
    expect(source).toContain("AccountDetailsBodySurface");
    expect(source).toContain("AccountDetailsBalanceCard");
    expect(source).toContain("ScrollChipSelect");
    expect(source).toContain("CARD_SURFACE_CLASS");
    expect(source).toContain("RecordRow");
    expect(source).toContain("EmptyState");
    expect(source).not.toContain("ACCOUNT_RECORDS_HISTORY_SECTION_GAP_CLASS");
    expect(source).toContain("ACCOUNT_RECORDS_HISTORY_CARD_GAP_CLASS");
    expect(source).toContain('accounts.recordsHistory.filters.thisMonth');
    expect(source).toContain("onRefresh={refresh}");
  });

  it("removes informational amount feedback from record creation forms", () => {
    const recordFields = fs.readFileSync(
      path.join(process.cwd(), "src/components/records/record-form-fields.tsx"),
      "utf8",
    );
    const addRecordScreen = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/components/screens/add-record-form-screen.tsx",
      ),
      "utf8",
    );

    expect(recordFields).not.toContain("records.insufficientBalance");
    expect(addRecordScreen).not.toContain("records.insufficientBalance");
    expect(recordFields).toContain('type !== "adjustment"');
    expect(recordFields).toContain("records.preview.newBalance");
  });

  it("uses shared record row typography foundation", () => {
    const recordRow = fs.readFileSync(
      path.join(process.cwd(), "src/components/patterns/index.tsx"),
      "utf8",
    );

    expect(recordRow).toContain("RECORD_ROW_LABEL_CLASS");
    expect(recordRow).toContain("RECORD_ROW_SUBLINE_CLASS");
    expect(recordRow).toContain("RECORD_ROW_DATE_CLASS");
    expect(recordRow).toContain('variant="detail"');
    expect(recordRow).toContain("text-foreground");
  });

  it("uses account-context record subline helpers on detail screens", () => {
    for (const screen of [
      "account-details-screen.tsx",
      "savings-details-screen.tsx",
      "credit-card-details-screen.tsx",
      "account-records-history-screen.tsx",
    ]) {
      const source = fs.readFileSync(
        path.join(process.cwd(), "src/components/screens", screen),
        "utf8",
      );
      expect(source).toContain("formatRecordSubline");
    }
  });

  it("uses overlapping account details body surface on all detail screens", () => {
    for (const screen of [
      "account-details-screen.tsx",
      "savings-details-screen.tsx",
      "credit-card-details-screen.tsx",
      "certificate-details-screen.tsx",
      "account-records-history-screen.tsx",
    ]) {
      const source = fs.readFileSync(
        path.join(process.cwd(), "src/components/screens", screen),
        "utf8",
      );
      expect(source).toContain("AccountDetailsBodySurface");
    }

    const chrome = fs.readFileSync(
      path.join(process.cwd(), "src/lib/layout/account-details-chrome.ts"),
      "utf8",
    );
    expect(chrome).toContain("ACCOUNT_DETAILS_BODY_SURFACE_CLASS");
    expect(chrome).toContain("-mt-8");
    expect(chrome).toContain("BOTTOM_SHEET_TOP_RADIUS_CLASS");
    expect(chrome).toContain("ACCOUNT_DETAILS_BODY_SURFACE_TOP_PADDING_CLASS");
    expect(chrome).toContain("pb-12");
    expect(chrome).not.toContain("ACCOUNT_DETAILS_HEADER_REGION_BOTTOM_RADIUS_CLASS");
  });
});
