"use client";

import { Check, ChevronLeft } from "lucide-react";
import { useState } from "react";

import { FieldEditorSurface } from "@/components/field-editor/field-editor-surface";
import {
  BOTTOM_SHEET_BACKDROP_CLASS,
  BOTTOM_SHEET_ENTER_CLASS,
  BOTTOM_SHEET_PANEL_CLASS,
  BottomSheetDragHandle,
} from "@/components/ui/bottom-sheet-chrome";
import type { FieldEditorOpenConfig } from "@/lib/field-editor/types";
import { cn } from "@/lib/utils";
import { useT } from "@/providers/i18n-provider";
import { useModalLayerLock } from "@/providers/modal-layer-provider";

interface FieldEditorBottomSheetProps {
  config: FieldEditorOpenConfig;
  onDismiss: () => void;
}

export function FieldEditorBottomSheet({
  config,
  onDismiss,
}: FieldEditorBottomSheetProps) {
  const t = useT();
  const [draft, setDraft] = useState(config.value);
  const [sheetError, setSheetError] = useState<string | undefined>();

  useModalLayerLock(true);

  function handleBack() {
    onDismiss();
  }

  function handleConfirm() {
    const validationError = config.validate?.(draft);
    if (validationError) {
      setSheetError(validationError);
      return;
    }

    config.onSave(draft);
    onDismiss();
  }

  function handleDraftChange(raw: string) {
    const next = config.sanitizeInput ? config.sanitizeInput(raw) : raw;
    setDraft(next);
    if (sheetError) setSheetError(undefined);
  }

  const displayValue = config.formatDisplay
    ? config.formatDisplay(draft)
    : draft;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 animate-in fade-in-0 duration-200",
        BOTTOM_SHEET_BACKDROP_CLASS,
      )}
    >
      <button
        type="button"
        aria-label={t("common.back")}
        className="absolute inset-0"
        onClick={handleBack}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={config.title}
        className={cn(
          BOTTOM_SHEET_PANEL_CLASS,
          BOTTOM_SHEET_ENTER_CLASS,
        )}
      >
        <BottomSheetDragHandle />
        <header className="shrink-0 border-b border-border">
          <div className="flex h-14 items-center px-2">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex size-11 items-center justify-center rounded-md text-foreground"
              aria-label={t("common.back")}
            >
              <ChevronLeft className="size-6 rtl:rotate-180" />
            </button>
            <h2 className="min-w-0 flex-1 truncate px-1 text-center text-base font-semibold">
              {config.title}
            </h2>
            <button
              type="button"
              onClick={handleConfirm}
              className="inline-flex size-11 items-center justify-center rounded-md text-foreground"
              aria-label={t("fieldEditor.confirm")}
            >
              <Check className="size-6" strokeWidth={2.25} />
            </button>
          </div>
        </header>

        <div className="px-6 py-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
          <FieldEditorSurface
            mode={config.mode}
            inputMode={config.inputMode}
            displayValue={displayValue}
            placeholder={config.placeholder}
            prefixLabel={config.prefixLabel}
            suffixLabel={config.suffixLabel}
            onChange={handleDraftChange}
          />
          {sheetError ? (
            <p className="mt-4 text-sm text-destructive" role="alert">
              {sheetError}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
