import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  ACCOUNT_TYPE_PICKER_CARD_GAP_PX,
  ACCOUNT_TYPE_PICKER_CATEGORY_GAP_PX,
  ACCOUNT_TYPE_PICKER_CATEGORY_TO_FIRST_GAP_PX,
  ACCOUNT_TYPE_PICKER_ICON_FRAME_SIZE_PX,
  ACCOUNT_TYPE_PICKER_ICON_SIZE_PX,
} from "@/lib/layout/account-type-picker-chrome";
import { CARD_SURFACE_CLASS } from "@/lib/layout/card-surface";

describe("account type picker sheet foundation", () => {
  it("uses dedicated card components instead of picker list rows", () => {
    const source = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/components/accounts/account-type-picker-sheet.tsx",
      ),
      "utf8",
    );

    expect(source).toContain("AccountTypePickerCard");
    expect(source).toContain("AccountTypePickerSection");
    expect(source).not.toContain("PickerListOption");
    expect(source).not.toContain("PickerListDivider");
  });

  it("freezes spacing and card surface tokens", () => {
    expect(ACCOUNT_TYPE_PICKER_CATEGORY_TO_FIRST_GAP_PX).toBe(8);
    expect(ACCOUNT_TYPE_PICKER_CARD_GAP_PX).toBe(8);
    expect(ACCOUNT_TYPE_PICKER_CATEGORY_GAP_PX).toBe(16);
    expect(ACCOUNT_TYPE_PICKER_ICON_FRAME_SIZE_PX).toBe(40);
    expect(ACCOUNT_TYPE_PICKER_ICON_SIZE_PX).toBe(28);

    const cardSource = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/components/accounts/account-type-picker-card.tsx",
      ),
      "utf8",
    );

    expect(cardSource).toContain("CARD_SURFACE_CLASS");
    expect(cardSource).toContain("ACCOUNT_CARD_NAME_CLASS");
    expect(cardSource).toContain("bg-muted");
    expect(cardSource).toContain("CardChevron");
    expect(cardSource).toContain("CARD_CHEVRON_ROW_CLASS");
    expect(cardSource).not.toContain("size-4");
    expect(CARD_SURFACE_CLASS).toContain("rounded-lg");
    expect(CARD_SURFACE_CLASS).toContain("border-border");
  });
});
