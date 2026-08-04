"use client";

import type { ReactNode } from "react";

import { AccountTypeIcon } from "@/components/ui/account-type-icon";
import { CardChevron } from "@/components/ui/card-chevron";
import { getAccountTypeLabelKey } from "@/lib/finance/account-labels";
import type { AccountType } from "@/lib/finance/types";
import type { TranslationKey } from "@/lib/i18n";
import {
  ACCOUNT_CARD_NAME_CLASS,
  CARD_CHEVRON_ROW_CLASS,
} from "@/lib/layout/account-card-chrome";
import { ACCOUNT_TYPE_PICKER_ICON_FRAME_SIZE_PX } from "@/lib/layout/account-type-picker-chrome";
import { CARD_SURFACE_CLASS } from "@/lib/layout/card-surface";
import { cn } from "@/lib/utils";

interface AccountTypePickerCardRowProps {
  icon: ReactNode;
  label: string;
  onSelect?: () => void;
  disabled?: boolean;
  trailing?: ReactNode;
}

/**
 * Shared account type picker row surface — icon frame, label, chevron.
 * Source of truth for Add Account type cards and More menu rows.
 *
 * @see docs/FOUNDATION.md — Account type picker sheet foundation
 */
export function AccountTypePickerCardRow({
  icon,
  label,
  onSelect,
  disabled = false,
  trailing,
}: AccountTypePickerCardRowProps) {
  const isButton = typeof onSelect === "function";
  const Comp = isButton ? "button" : "div";

  return (
    <Comp
      type={isButton ? "button" : undefined}
      disabled={isButton ? disabled : undefined}
      onClick={isButton ? onSelect : undefined}
      className={cn(
        CARD_SURFACE_CLASS,
        "flex w-full items-center gap-3 p-4 text-start",
        isButton && !disabled && "transition-colors active:bg-muted",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
        style={{
          width: ACCOUNT_TYPE_PICKER_ICON_FRAME_SIZE_PX,
          height: ACCOUNT_TYPE_PICKER_ICON_FRAME_SIZE_PX,
        }}
      >
        {icon}
      </span>
      <div className={cn(CARD_CHEVRON_ROW_CLASS, "min-w-0 flex-1")}>
        <span className={cn(ACCOUNT_CARD_NAME_CLASS, "min-w-0 flex-1")}>
          {label}
        </span>
        {trailing ?? <CardChevron />}
      </div>
    </Comp>
  );
}

interface AccountTypePickerCardProps {
  type: AccountType;
  enabled: boolean;
  t: (key: TranslationKey) => string;
  onSelect: () => void;
}

/**
 * Single account type card in the Add Account type picker sheet.
 *
 * @see docs/FOUNDATION.md — Account type picker sheet foundation
 */
export function AccountTypePickerCard({
  type,
  enabled,
  t,
  onSelect,
}: AccountTypePickerCardProps) {
  return (
    <AccountTypePickerCardRow
      icon={<AccountTypeIcon type={type} className="size-6" />}
      label={t(getAccountTypeLabelKey(type))}
      onSelect={onSelect}
      disabled={!enabled}
      trailing={
        !enabled ? (
          <span className="shrink-0 text-xs text-muted-foreground">
            {t("accounts.add.comingSoon")}
          </span>
        ) : (
          <CardChevron />
        )
      }
    />
  );
}
