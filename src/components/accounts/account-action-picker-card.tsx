"use client";

import type { ReactNode } from "react";

import { ACCOUNT_CARD_NAME_CLASS } from "@/lib/layout/account-card-chrome";
import {
  ACCOUNT_ACTION_PICKER_CARD_GAP_CLASS,
  ACCOUNT_TYPE_PICKER_ICON_FRAME_SIZE_PX,
  ACCOUNT_TYPE_PICKER_ICON_SIZE_PX,
} from "@/lib/layout/account-action-picker-chrome";
import { CARD_SURFACE_CLASS } from "@/lib/layout/card-surface";
import { cn } from "@/lib/utils";

interface AccountActionPickerCardProps {
  label: string;
  icon: ReactNode;
  onSelect: () => void;
}

/**
 * Compact action card for Add Record / Add Activity picker sheets.
 * Reuses account type picker card surface tokens — icon + label only.
 */
export function AccountActionPickerCard({
  label,
  icon,
  onSelect,
}: AccountActionPickerCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        CARD_SURFACE_CLASS,
        "flex min-w-0 flex-1 flex-col items-center gap-3 p-4 text-center transition-colors active:bg-muted",
      )}
    >
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
        style={{
          width: ACCOUNT_TYPE_PICKER_ICON_FRAME_SIZE_PX,
          height: ACCOUNT_TYPE_PICKER_ICON_FRAME_SIZE_PX,
        }}
      >
        <span
          className="inline-flex items-center justify-center"
          style={{
            width: ACCOUNT_TYPE_PICKER_ICON_SIZE_PX,
            height: ACCOUNT_TYPE_PICKER_ICON_SIZE_PX,
          }}
        >
          {icon}
        </span>
      </span>
      <span className={cn(ACCOUNT_CARD_NAME_CLASS, "w-full truncate")}>
        {label}
      </span>
    </button>
  );
}

interface AccountActionPickerRowProps {
  children: ReactNode;
  className?: string;
}

export function AccountActionPickerRow({
  children,
  className,
}: AccountActionPickerRowProps) {
  return (
    <div className={cn("flex px-2", ACCOUNT_ACTION_PICKER_CARD_GAP_CLASS, className)}>
      {children}
    </div>
  );
}
