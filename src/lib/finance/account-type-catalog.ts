import type { AccountType } from "@/lib/finance/types";
import type { TranslationKey } from "@/lib/i18n";

export type AccountTypeGroupId =
  | "money"
  | "savings"
  | "lending"
  | "investments";

export interface AccountTypeCatalogEntry {
  type: AccountType;
  /** When false, shown in picker but not selectable (coming soon). */
  enabled: boolean;
}

export interface AccountTypeGroup {
  id: AccountTypeGroupId;
  labelKey: TranslationKey;
  types: AccountTypeCatalogEntry[];
}

/** Grouped account types for the Add Account picker sheet. */
export const ACCOUNT_TYPE_GROUPS: AccountTypeGroup[] = [
  {
    id: "money",
    labelKey: "accounts.typeGroups.money",
    types: [
      { type: "current_account", enabled: true },
      { type: "wallet", enabled: true },
      { type: "cash", enabled: true },
    ],
  },
  {
    id: "savings",
    labelKey: "accounts.typeGroups.savings",
    types: [
      { type: "savings_account", enabled: true },
      { type: "certificate", enabled: true },
    ],
  },
  {
    id: "lending",
    labelKey: "accounts.typeGroups.lending",
    types: [
      { type: "credit_card", enabled: true },
      { type: "loan", enabled: false },
    ],
  },
  {
    id: "investments",
    labelKey: "accounts.typeGroups.investments",
    types: [
      { type: "gold", enabled: false },
      { type: "stocks", enabled: false },
    ],
  },
];

export function getAccountTypeCreatePath(type: AccountType): string {
  return `/accounts/new/${type}`;
}

export function isCreatableAccountType(type: AccountType): boolean {
  return ACCOUNT_TYPE_GROUPS.some((group) =>
    group.types.some((entry) => entry.type === type && entry.enabled),
  );
}

export function parseCreatableAccountType(
  value: string,
): AccountType | null {
  if (!isCreatableAccountType(value as AccountType)) return null;
  return value as AccountType;
}
