"use client";

import { AccountRowContent } from "@/components/accounts/account-row-content";
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
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onClick}
      className={cn(
        "flex min-h-16 w-full gap-3 px-3 py-3 text-start transition-colors",
        selected ? "bg-muted font-medium" : "hover:bg-muted/60 active:bg-muted",
      )}
    >
      <AccountRowContent
        account={account}
        formatLocale={formatLocale}
        t={t}
      />
    </button>
  );
}
