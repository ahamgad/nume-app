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
import {
  FIELD_EDITOR_KEYBOARD_CHIP_GAP_PX,
  FIELD_EDITOR_SIGN_CHIP_GAP_PX,
} from "@/lib/field-editor/field-editor-chrome";
import type { FieldEditorOpenConfig } from "@/lib/field-editor/types";
import { cn } from "@/lib/utils";
import { useCallback, useRef, useState } from "react";
import { useT } from "@/providers/i18n-provider";

interface FieldEditorBottomSheetProps {
  config: FieldEditorOpenConfig;
  onDismiss: () => void;
}

/**
 * Workspace bottom sheet for inline field editing.
 *
 * @see docs/FOUNDATION.md § 5 — Inline field editor (frozen)
 */
export function FieldEditorBottomSheet({
  config,
  onDismiss,
}: FieldEditorBottomSheetProps) {
  const t = useT();
  const editorRef = useRef<FieldEditorSurfaceHandle>(null);
  const headerLabel = config.label ?? config.title ?? "";
  const [sign, setSign] = useState<BalanceSign>(() =>
    parseBalanceSignFromValue(config.value),
  );
  const [draft, setDraft] = useState(() =>
    config.showSignToggle ? stripBalanceSign(config.value) : config.value,
  );
  const [sheetError, setSheetError] = useState<string | undefined>();
  const keyboardInsetPx = useFieldEditorKeyboardInset(true);

  const handleConfirm = useCallback(() => {
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
  }, [config, draft, onDismiss, sign]);

  function handleDraftChange(raw: string) {
    const next = config.sanitizeInput ? config.sanitizeInput(raw) : raw;
    setDraft(next);
    if (sheetError) setSheetError(undefined);
  }

  const displayValue = config.formatDisplay
    ? config.formatDisplay(draft)
    : draft;

  const bottomPaddingPx = config.showSignToggle
    ? FIELD_EDITOR_KEYBOARD_CHIP_GAP_PX
    : 32;

  const bodyPaddingBottom = `calc(${bottomPaddingPx}px + env(safe-area-inset-bottom) + ${keyboardInsetPx}px)`;

  return (
    <ImmersiveBottomSheet
      title={headerLabel}
      onDismiss={onDismiss}
      onConfirm={handleConfirm}
      variant="workspace"
      ariaLabel={headerLabel}
      bodyClassName={cn(
        "flex min-h-0 flex-col px-6 py-8",
        config.showSignToggle ? "justify-end" : "items-center justify-center",
      )}
      bodyStyle={{ paddingBottom: bodyPaddingBottom }}
    >
      <div
        className={cn(
          "flex w-full min-w-0 flex-col",
          config.showSignToggle
            ? "min-h-0 flex-1 justify-center"
            : "items-center justify-center",
        )}
      >
        <FieldEditorSurface
          ref={editorRef}
          mode={config.mode}
          inputMode={config.inputMode}
          displayValue={displayValue}
          placeholder={config.placeholder}
          onSubmit={handleConfirm}
          onChange={handleDraftChange}
        />
        {sheetError ? (
          <p className="mt-4 text-center text-sm text-destructive" role="alert">
            {sheetError}
          </p>
        ) : null}
      </div>
      {config.showSignToggle ? (
        <>
          <div
            className="w-full shrink-0"
            style={{ height: FIELD_EDITOR_SIGN_CHIP_GAP_PX }}
            aria-hidden
          />
          <FieldSignToggle
            value={sign}
            onChange={setSign}
            positiveLabel={t("common.sign.positiveLabel")}
            negativeLabel={t("common.sign.negativeLabel")}
            onAfterChange={() => editorRef.current?.focus()}
          />
        </>
      ) : null}
    </ImmersiveBottomSheet>
  );
}
