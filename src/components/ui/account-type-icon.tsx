"use client";

import {
  BadgePercent,
  Banknote,
  CreditCard,
  Gem,
  Hand,
  Hourglass,
  Landmark,
  LineChart,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { MetadataChip } from "@/components/accounts/metadata-chip";
import { getAccountTypeLabelKey } from "@/lib/finance/account-labels";
import type { AccountType } from "@/lib/finance/types";
import { useT } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";

const ACCOUNT_TYPE_ICONS: Partial<Record<AccountType, LucideIcon>> = {
  current_account: Landmark,
  cash: Banknote,
  wallet: Wallet,
  savings_account: Hourglass,
  certificate: BadgePercent,
  gold: Gem,
  loan: Hand,
  credit_card: CreditCard,
  stocks: LineChart,
};

interface AccountTypeIconProps {
  type: AccountType;
  className?: string;
}

export function AccountTypeIcon({ type, className }: AccountTypeIconProps) {
  const Icon = ACCOUNT_TYPE_ICONS[type] ?? Landmark;
  return <Icon className={cn("size-4 shrink-0", className)} aria-hidden />;
}

interface AccountTypeBadgeProps {
  type: AccountType;
  className?: string;
}

export function AccountTypeBadge({ type, className }: AccountTypeBadgeProps) {
  const t = useT();
  return (
    <MetadataChip className={className}>
      <AccountTypeIcon type={type} className="size-3" />
      {t(getAccountTypeLabelKey(type))}
    </MetadataChip>
  );
}
