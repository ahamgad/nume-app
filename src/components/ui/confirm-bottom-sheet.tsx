"use client";

import { Button } from "@/components/ui/button";
import { ConfirmationBottomSheet } from "@/components/ui/confirmation-bottom-sheet";
import {
  CONFIRMATION_SHEET_DESCRIPTION_CLASS,
  CONFIRMATION_SHEET_TITLE_CLASS,
  ConfirmationSheetIconBadge,
  type ConfirmationSheetIcon,
} from "@/components/ui/confirmation-sheet-presentation";

interface ConfirmBottomSheetProps {
  open: boolean;
  title: string;
  titleId: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  icon: ConfirmationSheetIcon;
  onConfirm: () => void;
  onCancel: () => void;
  confirmDisabled?: boolean;
  confirmLoadingLabel?: string;
  confirmVariant?: "destructive" | "default";
}

export function ConfirmBottomSheet({
  open,
  title,
  titleId,
  description,
  confirmLabel,
  cancelLabel,
  icon,
  onConfirm,
  onCancel,
  confirmDisabled = false,
  confirmLoadingLabel,
  confirmVariant = "destructive",
}: ConfirmBottomSheetProps) {
  return (
    <ConfirmationBottomSheet
      open={open}
      onClose={onCancel}
      ariaLabelledBy={titleId}
    >
      <ConfirmationSheetIconBadge icon={icon} />
      <h2 id={titleId} className={CONFIRMATION_SHEET_TITLE_CLASS}>
        {title}
      </h2>
      <p className={CONFIRMATION_SHEET_DESCRIPTION_CLASS}>{description}</p>
      <div className="mt-5 flex flex-col gap-2">
        <Button
          variant={confirmVariant}
          className="h-11 w-full"
          disabled={confirmDisabled}
          onClick={onConfirm}
        >
          {confirmDisabled && confirmLoadingLabel
            ? confirmLoadingLabel
            : confirmLabel}
        </Button>
        <Button
          variant="ghost"
          className="h-11 w-full"
          disabled={confirmDisabled}
          onClick={onCancel}
        >
          {cancelLabel}
        </Button>
      </div>
    </ConfirmationBottomSheet>
  );
}
