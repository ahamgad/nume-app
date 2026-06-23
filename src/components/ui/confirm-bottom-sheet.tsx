"use client";

import { ConfirmationBottomSheet } from "@/components/ui/confirmation-bottom-sheet";
import {
  CONFIRMATION_SHEET_DESCRIPTION_CLASS,
  CONFIRMATION_SHEET_TITLE_CLASS,
  ConfirmationSheetActions,
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
      <ConfirmationSheetActions
        primaryLabel={confirmLabel}
        secondaryLabel={cancelLabel}
        onPrimary={onConfirm}
        onSecondary={onCancel}
        primaryDisabled={confirmDisabled}
        primaryLoadingLabel={confirmLoadingLabel}
        primaryVariant={confirmVariant}
      />
    </ConfirmationBottomSheet>
  );
}
