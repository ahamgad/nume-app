import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  CARD_CHEVRON_CLASS,
  CARD_CHEVRON_ROW_CLASS,
} from "@/lib/layout/account-card-chrome";

describe("card chevron foundation", () => {
  it("exports account card chevron tokens", () => {
    expect(CARD_CHEVRON_CLASS).toContain("size-5");
    expect(CARD_CHEVRON_CLASS).toContain("text-muted-foreground");
    expect(CARD_CHEVRON_ROW_CLASS).toContain("gap-2");
  });

  it("is consumed by account cards and account type picker cards", () => {
    const accountCard = fs.readFileSync(
      path.join(process.cwd(), "src/components/accounts/account-card.tsx"),
      "utf8",
    );
    const typePickerCard = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/components/accounts/account-type-picker-card.tsx",
      ),
      "utf8",
    );

    expect(accountCard).not.toContain("CardChevron");
    expect(typePickerCard).toContain("CardChevron");
    expect(typePickerCard).not.toContain("ChevronRight");
  });
});
