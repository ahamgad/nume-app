import type { LucideIcon } from "lucide-react";
import {
  Archive,
  CircleHelp,
  RotateCcw,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import { cn } from "@/lib/utils";

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
