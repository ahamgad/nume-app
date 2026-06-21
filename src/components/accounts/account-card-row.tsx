"use client";

import { ChevronRight } from "lucide-react";

import { AccountRowContent } from "@/components/accounts/account-row-content";
import type { Account } from "@/lib/finance/types";
import type { TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface AccountCardRowProps {
  account: Account;
  formatLocale: string;
  onClick: () => void;
  t: (key: TranslationKey) => string;
}

export function AccountCardRow({
  account,
  formatLocale,
  onClick,
  t,
}: AccountCardRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-16 w-full gap-3 px-4 py-3 text-start transition-colors active:bg-muted",
      )}
    >
      <AccountRowContent
        account={account}
        formatLocale={formatLocale}
        t={t}
        trailing={
          <ChevronRight className="size-5 shrink-0 text-muted-foreground rtl:rotate-180" />
        }
      />
    </button>
  );
}
