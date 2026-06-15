"use client";

import { useState } from "react";

import { FieldEditorSurface } from "@/components/field-editor/field-editor-surface";
import { ImmersiveBottomSheet } from "@/components/ui/immersive-bottom-sheet";
import { useFieldEditorKeyboardInset } from "@/hooks/use-field-editor-keyboard-inset";
import type { FieldEditorOpenConfig } from "@/lib/field-editor/types";

interface FieldEditorBottomSheetProps {
  config: FieldEditorOpenConfig;
  onDismiss: () => void;
}

export function FieldEditorBottomSheet({
  config,
  onDismiss,
}: FieldEditorBottomSheetProps) {
  const [draft, setDraft] = useState(config.value);
  const [sheetError, setSheetError] = useState<string | undefined>();
  const keyboardInsetPx = useFieldEditorKeyboardInset(true);

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
    <ImmersiveBottomSheet
      title={config.title}
      onDismiss={onDismiss}
      onConfirm={handleConfirm}
      variant="workspace"
      ariaLabel={config.title}
      bodyClassName="px-6 py-8"
      bodyStyle={{ paddingBottom: bodyPaddingBottom }}
    >
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
    </ImmersiveBottomSheet>
  );
}
