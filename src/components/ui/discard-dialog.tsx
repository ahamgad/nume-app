"use client";

import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useT } from "@/providers/i18n-provider";

interface DiscardDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DiscardDialog({ open, onConfirm, onCancel }: DiscardDialogProps) {
  const t = useT();

  return (
    <BottomSheet
      open={open}
      onClose={onCancel}
      variant="compact"
      ariaLabelledBy="discard-title"
    >
      <h2 id="discard-title" className="text-base font-semibold">
        {t("common.discardChanges.title")}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("common.discardChanges.description")}
      </p>
      <div className="mt-5 flex flex-col gap-2">
        <Button
          variant="destructive"
          className="h-11 w-full"
          onClick={onConfirm}
        >
          {t("common.discardChanges.confirm")}
        </Button>
        <Button variant="ghost" className="h-11 w-full" onClick={onCancel}>
          {t("common.discardChanges.cancel")}
        </Button>
      </div>
    </BottomSheet>
  );
}
