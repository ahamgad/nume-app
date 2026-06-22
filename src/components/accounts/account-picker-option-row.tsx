"use client";

import { AccountRowContent } from "@/components/accounts/account-row-content";
import { PickerListOption } from "@/components/ui/picker-list";
import type { Account } from "@/lib/finance/types";
import type { TranslationKey } from "@/lib/i18n";
import { useFormatLocale } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";

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
  const formatLocale = useFormatLocale();

  return (
    <PickerListOption
      selected={selected}
      onSelect={onClick}
      className={cn("min-h-16 gap-3 py-3")}
    >
      <AccountRowContent
        account={account}
        formatLocale={formatLocale}
        t={t}
      />
    </PickerListOption>
  );
}
