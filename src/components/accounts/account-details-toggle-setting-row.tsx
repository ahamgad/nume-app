"use client";

import { Switch } from "@/components/ui/switch";
import {
  ACCOUNT_DETAILS_TOGGLE_DESCRIPTION_CLASS,
  ACCOUNT_DETAILS_TOGGLE_LABEL_CLASS,
} from "@/lib/layout/account-details-chrome";
import { cn } from "@/lib/utils";

interface AccountDetailsToggleSettingRowProps {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/** Settings toggle row — Savings Daily Interest typography. */
export function AccountDetailsToggleSettingRow({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  className,
}: AccountDetailsToggleSettingRowProps) {
  return (
    <div
      className={cn(
        "flex min-h-14 items-center justify-between gap-4 py-0",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <p className={ACCOUNT_DETAILS_TOGGLE_LABEL_CLASS}>{label}</p>
        <p className={ACCOUNT_DETAILS_TOGGLE_DESCRIPTION_CLASS}>{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="shrink-0"
      />
    </div>
  );
}
