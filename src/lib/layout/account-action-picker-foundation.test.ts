import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  ACCOUNT_ACTION_PICKER_CARD_GAP_CLASS,
  ACCOUNT_ACTION_PICKER_CARD_GAP_PX,
} from "@/lib/layout/account-action-picker-chrome";
import { CARD_SURFACE_CLASS } from "@/lib/layout/card-surface";

describe("account action picker sheet foundation", () => {
  it("uses picker bottom sheet with foundation header for add record", () => {
    const source = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/components/accounts/add-record-action-sheet.tsx",
      ),
      "utf8",
    );

    expect(source).toContain("PickerBottomSheet");
    expect(source).toContain('t("records.add.title")');
    expect(source).toContain("AccountActionPickerCard");
    expect(source).not.toContain("PickerListOption");
  });

  it("uses picker bottom sheet with foundation header for add activity", () => {
    const source = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/components/accounts/add-activity-action-sheet.tsx",
      ),
      "utf8",
    );

    expect(source).toContain("PickerBottomSheet");
    expect(source).toContain('t("creditCards.activity.title")');
    expect(source).toContain("creditCards.activity.purchase.title");
    expect(source).toContain("AccountActionPickerCard");
  });

  it("reuses account type card surface tokens without chevron or description", () => {
    expect(ACCOUNT_ACTION_PICKER_CARD_GAP_PX).toBe(16);
    expect(ACCOUNT_ACTION_PICKER_CARD_GAP_CLASS).toBe("gap-4");

    const cardSource = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/components/accounts/account-action-picker-card.tsx",
      ),
      "utf8",
    );

    expect(cardSource).toContain("CARD_SURFACE_CLASS");
    expect(cardSource).toContain("ACCOUNT_CARD_NAME_CLASS");
    expect(cardSource).toContain("bg-muted");
    expect(cardSource).toContain("flex-1");
    expect(cardSource).toContain("ACCOUNT_TYPE_PICKER_ICON_FRAME_SIZE_PX");
    expect(cardSource).toContain("ACCOUNT_TYPE_PICKER_ICON_SIZE_PX");
    expect(cardSource).not.toContain("CardChevron");
    expect(cardSource).not.toContain("CARD_CHEVRON_ROW_CLASS");
    expect(cardSource).not.toContain("comingSoon");
    expect(CARD_SURFACE_CLASS).toContain("rounded-2xl");
    expect(CARD_SURFACE_CLASS).toContain("border-border");
  });

  it("opens sheets from account details header actions before navigation", () => {
    for (const screen of [
      "account-details-screen.tsx",
      "savings-details-screen.tsx",
    ]) {
      const source = fs.readFileSync(
        path.join(process.cwd(), "src/components/screens", screen),
        "utf8",
      );

      expect(source).toContain("AddRecordActionSheet");
      expect(source).toContain("setShowAddRecordSheet(true)");
      expect(source).not.toContain("/records/new`)");
    }

    const creditCardSource = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/components/screens/credit-card-details-screen.tsx",
      ),
      "utf8",
    );

    expect(creditCardSource).toContain("AddActivityActionSheet");
    expect(creditCardSource).toContain("setShowAddActivitySheet(true)");
    expect(creditCardSource).not.toContain("/activity/new`)");
  });
});
