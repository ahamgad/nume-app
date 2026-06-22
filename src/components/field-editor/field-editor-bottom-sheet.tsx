"use client";

import { FieldEditorSurface, type FieldEditorSurfaceHandle } from "@/components/field-editor/field-editor-surface";
import { FieldSignToggle } from "@/components/field-editor/field-sign-toggle";
import { ImmersiveBottomSheet } from "@/components/ui/immersive-bottom-sheet";
import { useFieldEditorKeyboardInset } from "@/hooks/use-field-editor-keyboard-inset";
import {
  applyBalanceSign,
  parseBalanceSignFromValue,
  stripBalanceSign,
  type BalanceSign,
} from "@/lib/field-editor/balance-sign";
import type { FieldEditorOpenConfig } from "@/lib/field-editor/types";
import { useRef, useState } from "react";
import { useT } from "@/providers/i18n-provider";

interface FieldEditorBottomSheetProps {
  config: FieldEditorOpenConfig;
  onDismiss: () => void;
}

export function FieldEditorBottomSheet({
  config,
  onDismiss,
}: FieldEditorBottomSheetProps) {
  const t = useT();
  const editorRef = useRef<FieldEditorSurfaceHandle>(null);
  const [sign, setSign] = useState<BalanceSign>(() =>
    parseBalanceSignFromValue(config.value),
  );
  const [draft, setDraft] = useState(() =>
    config.showSignToggle ? stripBalanceSign(config.value) : config.value,
  );
  const [sheetError, setSheetError] = useState<string | undefined>();
  const keyboardInsetPx = useFieldEditorKeyboardInset(true);

  function handleConfirm() {
    const valueToSave = config.showSignToggle
      ? applyBalanceSign(draft, sign)
      : draft;
    const validationError = config.validate?.(valueToSave);
    if (validationError) {
      setSheetError(validationError);
      return;
    }

    config.onSave(valueToSave);
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
      bodyClassName="flex flex-col items-center justify-center px-6 py-8"
      bodyStyle={{ paddingBottom: bodyPaddingBottom }}
    >
      {config.showSignToggle ? (
        <div className="mb-6 w-full">
          <FieldSignToggle
            value={sign}
            onChange={setSign}
            positiveLabel={t("common.sign.positiveLabel")}
            negativeLabel={t("common.sign.negativeLabel")}
            onAfterChange={() => editorRef.current?.focus()}
          />
        </div>
      ) : null}
      <FieldEditorSurface
        ref={editorRef}
        mode={config.mode}
        inputMode={config.inputMode}
        displayValue={displayValue}
        placeholder={config.placeholder}
        suffixLabel={config.suffixLabel}
        onChange={handleDraftChange}
      />
      {sheetError ? (
        <p className="mt-4 text-center text-sm text-destructive" role="alert">
          {sheetError}
        </p>
      ) : null}
    </ImmersiveBottomSheet>
  );
}
