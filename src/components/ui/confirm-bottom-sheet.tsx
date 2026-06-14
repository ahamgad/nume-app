"use client";

import { Button } from "@/components/ui/button";
import { ConfirmationBottomSheet } from "@/components/ui/confirmation-bottom-sheet";

interface ConfirmBottomSheetProps {
  open: boolean;
  title: string;
  titleId: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
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
      <h2 id={titleId} className="text-base font-semibold">
        {title}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
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
