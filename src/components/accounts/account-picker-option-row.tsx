"use client";

import { AccountRowContent } from "@/components/accounts/account-row-content";
import { PickerListOption } from "@/components/ui/picker-list";
import { resolveAccountNumberLast4 } from "@/lib/finance/account-identity-validation";
import type { Account } from "@/lib/finance/types";
import { useFinance } from "@/lib/finance/store";
import type { TranslationKey } from "@/lib/i18n";
import { PICKER_ROW_OPTION_LAYOUT_CLASS } from "@/lib/layout/picker-option-row";

interface AccountPickerOptionRowProps {
  account: Account;
  selected?: boolean;
  t: (key: TranslationKey) => string;
  onClick: () => void;
}

export function AccountPickerOptionRow({
  account,
  selected = false,
  t,
  onClick,
}: AccountPickerOptionRowProps) {
  const { certificates, creditCards, loans } = useFinance();
  const identifierLast4 = resolveAccountNumberLast4(account, {
    certificates,
    creditCards,
    loans,
  });

  return (
    <PickerListOption
      selected={selected}
      onSelect={onClick}
      className={PICKER_ROW_OPTION_LAYOUT_CLASS}
    >
      <AccountRowContent
        account={account}
        identifierLast4={identifierLast4}
        t={t}
      />
    </PickerListOption>
  );
}
