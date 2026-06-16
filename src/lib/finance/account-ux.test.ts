import { describe, expect, it, vi } from "vitest";

import { formatAccountListSubtitle } from "@/lib/finance/account-display";
import {
  isMoneyAccountFormDirty,
  moneyAccountFormValuesFromAccount,
  showsBalanceField,
  supportsQuickBalanceEdit,
  validateMoneyAccountForm,
} from "@/lib/finance/account-form";
import {
  computeFittedFontSizePx,
} from "@/lib/format/responsive-currency";
import { formatInstitutionEntityLabel } from "@/lib/institutions/catalog";

const t = vi.fn((key: string, params?: Record<string, string>) => {
  if (key === "accounts.list.meta" && params) {
    return `${params.institution} · ${params.type}`;
  }
  const labels: Record<string, string> = {
    "accounts.types.currentAccount": "Current account",
    "accounts.types.cash": "Cash account",
    "accounts.types.wallet": "Wallet",
    "accounts.types.certificate": "Certificate",
    "institutions.banks.cib": "Commercial International Bank",
  };
  return labels[key] ?? key;
});

describe("formatAccountListSubtitle", () => {
  it("shows institution shortcut and localized account type", () => {
    expect(
      formatAccountListSubtitle(
        { type: "current_account", institution: "CIB" },
        t,
      ),
    ).toBe("CIB · Current account");
  });

  it("shows type only when institution is missing (e.g. cash)", () => {
    expect(
      formatAccountListSubtitle({ type: "cash", institution: null }, t),
    ).toBe("Cash account");
  });

  it("uses custom institution text when not in catalog", () => {
    expect(
      formatAccountListSubtitle(
        { type: "wallet", institution: "Lucky" },
        t,
      ),
    ).toBe("Lucky · Wallet");
  });
});

describe("formatInstitutionEntityLabel", () => {
  it("returns catalog shortcut for known institutions", () => {
    expect(formatInstitutionEntityLabel("CIB", t)).toBe("CIB");
    expect(formatInstitutionEntityLabel("Banque Misr", t)).toBe("Banque Misr");
  });
});

describe("supportsQuickBalanceEdit", () => {
  it("enables quick balance editing for money accounts only", () => {
    expect(supportsQuickBalanceEdit("current_account")).toBe(true);
    expect(supportsQuickBalanceEdit("cash")).toBe(true);
    expect(supportsQuickBalanceEdit("wallet")).toBe(true);
    expect(supportsQuickBalanceEdit("certificate")).toBe(false);
    expect(supportsQuickBalanceEdit("loan")).toBe(false);
  });
});

describe("edit form balance field", () => {
  it("hides balance on edit for all money account types", () => {
    expect(showsBalanceField("current_account", "edit")).toBe(false);
    expect(showsBalanceField("cash", "edit")).toBe(false);
    expect(showsBalanceField("wallet", "edit")).toBe(false);
  });

  it("shows balance on create for money account types", () => {
    expect(showsBalanceField("current_account", "create")).toBe(true);
    expect(showsBalanceField("cash", "create")).toBe(true);
  });

  it("does not include balance in edit form initial values", () => {
    const values = moneyAccountFormValuesFromAccount(
      {
        name: "Cash",
        institution: null,
        currentBalance: 8005,
      },
      "cash",
    );
    expect(values.balance).toBe("");
  });

  it("does not treat balance as dirty on edit", () => {
    const initial = moneyAccountFormValuesFromAccount(
      { name: "Main", institution: "CIB", currentBalance: 1000 },
      "current_account",
    );
    expect(isMoneyAccountFormDirty(initial, initial, "current_account")).toBe(
      false,
    );
  });

  it("skips balance validation on edit", () => {
    const errors = validateMoneyAccountForm(
      { name: "Main", institution: "CIB", balance: "" },
      "current_account",
      t,
      "edit",
    );
    expect(errors.balance).toBeUndefined();
  });
});

describe("responsive currency scaling", () => {
  it("keeps max size when text fits", () => {
    expect(computeFittedFontSizePx(200, 300, 36, 14)).toBe(36);
  });
});
