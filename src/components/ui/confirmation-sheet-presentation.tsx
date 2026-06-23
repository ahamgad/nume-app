import type { LucideIcon } from "lucide-react";
import {
  Archive,
  CircleHelp,
  RotateCcw,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CONFIRMATION_SHEET_ACTION_BUTTON_CLASS } from "@/lib/layout/form-action-chrome";

export type ConfirmationSheetIcon =
  | "archive"
  | "restore"
  | "discard"
  | "delete"
  | "confirm";

const CONFIRMATION_ICON_MAP: Record<ConfirmationSheetIcon, LucideIcon> = {
  archive: Archive,
  restore: RotateCcw,
  discard: TriangleAlert,
  delete: Trash2,
  confirm: CircleHelp,
};

const DESTRUCTIVE_CONFIRMATION_ICONS = new Set<ConfirmationSheetIcon>([
  "archive",
  "discard",
  "delete",
]);

export const CONFIRMATION_SHEET_TITLE_CLASS =
  "text-center text-xl font-bold";

export const CONFIRMATION_SHEET_DESCRIPTION_CLASS =
  "mt-2 text-center text-sm leading-relaxed text-muted-foreground";

export {
  CONFIRMATION_SHEET_ACTION_BUTTON_CLASS,
  FORM_PRIMARY_ACTION_BUTTON_CLASS,
} from "@/lib/layout/form-action-chrome";

interface ConfirmationSheetActionsProps {
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
  primaryDisabled?: boolean;
  primaryLoadingLabel?: string;
  primaryVariant?: "destructive" | "default";
}

/** Shared confirmation sheet action stack — matches form primary button height. */
export function ConfirmationSheetActions({
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  primaryDisabled = false,
  primaryLoadingLabel,
  primaryVariant = "destructive",
}: ConfirmationSheetActionsProps) {
  return (
    <div className="mt-5 flex flex-col gap-2">
      <Button
        variant={primaryVariant}
        className={CONFIRMATION_SHEET_ACTION_BUTTON_CLASS}
        disabled={primaryDisabled}
        onClick={onPrimary}
      >
        {primaryDisabled && primaryLoadingLabel
          ? primaryLoadingLabel
          : primaryLabel}
      </Button>
      <Button
        variant="ghost"
        className={CONFIRMATION_SHEET_ACTION_BUTTON_CLASS}
        disabled={primaryDisabled}
        onClick={onSecondary}
      >
        {secondaryLabel}
      </Button>
    </div>
  );
}

export function ConfirmationSheetIconBadge({
  icon,
}: {
  icon: ConfirmationSheetIcon;
}) {
  const Icon = CONFIRMATION_ICON_MAP[icon];
  const isDestructive = DESTRUCTIVE_CONFIRMATION_ICONS.has(icon);

  return (
    <div className="mb-4 flex justify-center">
      <div
        className={cn(
          "flex size-16 items-center justify-center rounded-full",
          isDestructive
            ? "bg-destructive/10 text-destructive"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Icon aria-hidden className="size-7" strokeWidth={2} />
      </div>
    </div>
  );
}
