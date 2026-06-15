"use client";

import { Check, ChevronLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { FieldEditorSurface } from "@/components/field-editor/field-editor-surface";
import {
  SCREEN_HEADER_BAR_CLASS,
  SCREEN_HEADER_ICON_CLASS,
  SCREEN_HEADER_TITLE_CLASS,
} from "@/components/layout/screen-header";
import {
  BOTTOM_SHEET_BACKDROP_CLASS,
  BOTTOM_SHEET_ENTER_CLASS,
} from "@/components/ui/bottom-sheet-chrome";
import { useFieldEditorKeyboardInset } from "@/hooks/use-field-editor-keyboard-inset";
import type { FieldEditorOpenConfig } from "@/lib/field-editor/types";
import { FIELD_EDITOR_SHEET_HEIGHT } from "@/lib/layout/field-editor-sheet";
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
  const [focusReady, setFocusReady] = useState(false);
  const keyboardInsetPx = useFieldEditorKeyboardInset(focusReady);

  useModalLayerLock(true);

  const markFocusReady = useCallback(() => {
    setFocusReady(true);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(markFocusReady, 240);
    return () => clearTimeout(timer);
  }, [markFocusReady]);

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

  const bodyPaddingBottom = `calc(2rem + env(safe-area-inset-bottom) + ${keyboardInsetPx}px)`;

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
        style={{ height: FIELD_EDITOR_SHEET_HEIGHT, maxHeight: FIELD_EDITOR_SHEET_HEIGHT }}
        onAnimationEnd={markFocusReady}
        className={cn(
          "absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-lg flex-col overflow-hidden rounded-t-xl bg-background shadow-sm",
          BOTTOM_SHEET_ENTER_CLASS,
        )}
      >
        <header className="shrink-0 border-b border-border">
          <div className={SCREEN_HEADER_BAR_CLASS}>
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex size-11 items-center justify-center rounded-md text-foreground"
              aria-label={t("common.back")}
            >
              <ChevronLeft className={cn(SCREEN_HEADER_ICON_CLASS, "rtl:rotate-180")} />
            </button>
            <h2
              className={cn(SCREEN_HEADER_TITLE_CLASS, "text-center")}
            >
              {config.title}
            </h2>
            <button
              type="button"
              onClick={handleConfirm}
              className="inline-flex size-11 items-center justify-center rounded-md text-foreground"
              aria-label={t("fieldEditor.confirm")}
            >
              <Check className={SCREEN_HEADER_ICON_CLASS} strokeWidth={2.25} />
            </button>
          </div>
        </header>

        <div
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-6 py-8"
          style={{ paddingBottom: bodyPaddingBottom }}
        >
          <FieldEditorSurface
            focusReady={focusReady}
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
