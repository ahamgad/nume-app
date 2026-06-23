"use client";

import { ConfirmationBottomSheet } from "@/components/ui/confirmation-bottom-sheet";
import {
  CONFIRMATION_SHEET_DESCRIPTION_CLASS,
  CONFIRMATION_SHEET_TITLE_CLASS,
  ConfirmationSheetActions,
  ConfirmationSheetIconBadge,
} from "@/components/ui/confirmation-sheet-presentation";
import { useT } from "@/providers/i18n-provider";

interface DiscardDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DiscardDialog({ open, onConfirm, onCancel }: DiscardDialogProps) {
  const t = useT();

  return (
    <ConfirmationBottomSheet
      open={open}
      onClose={onCancel}
      ariaLabelledBy="discard-title"
    >
      <ConfirmationSheetIconBadge icon="discard" />
      <h2 id="discard-title" className={CONFIRMATION_SHEET_TITLE_CLASS}>
        {t("common.discardChanges.title")}
      </h2>
      <p className={CONFIRMATION_SHEET_DESCRIPTION_CLASS}>
        {t("common.discardChanges.description")}
      </p>
      <ConfirmationSheetActions
        primaryLabel={t("common.discardChanges.confirm")}
        secondaryLabel={t("common.discardChanges.cancel")}
        onPrimary={onConfirm}
        onSecondary={onCancel}
      />
    </ConfirmationBottomSheet>
  );
}
