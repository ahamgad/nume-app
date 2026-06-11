"use client";

import { Button } from "@/components/ui/button";
import { useT } from "@/providers/i18n-provider";

interface DiscardDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DiscardDialog({ open, onConfirm, onCancel }: DiscardDialogProps) {
  const t = useT();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="discard-title"
        className="w-full max-w-sm rounded-xl border border-border bg-background p-5 shadow-sm"
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
      </div>
    </div>
  );
}
