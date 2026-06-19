import type { ReactNode } from "react";

import type { AccountDetailHeaderStatusTone } from "@/lib/finance/account-header-status";
import { cn } from "@/lib/utils";

export const METADATA_CHIP_BASE =
  "inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-medium";

export const METADATA_CHIP_TONES: Record<AccountDetailHeaderStatusTone, string> = {
  neutral: "bg-muted text-muted-foreground",
  positive: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  info: "bg-primary/10 text-primary",
  inactive: "bg-muted text-muted-foreground",
};

export interface MetadataChipProps {
  children: ReactNode;
  tone?: AccountDetailHeaderStatusTone;
  className?: string;
}

export function MetadataChip({
  children,
  tone = "neutral",
  className,
}: MetadataChipProps) {
  return (
    <span className={cn(METADATA_CHIP_BASE, METADATA_CHIP_TONES[tone], className)}>
      {children}
    </span>
  );
}
