"use client";

import { forwardRef, useCallback, useImperativeHandle, useLayoutEffect, useRef } from "react";

import { FIELD_EDITOR_SURFACE_INPUT_CLASS } from "@/lib/field-editor/field-editor-chrome";
import { isFieldEditorKeyboardSubmitKey } from "@/lib/field-editor/editor-display";
import type { FieldEditorInputMode, FieldEditorMode } from "@/lib/field-editor/types";
import { cn } from "@/lib/utils";

export interface FieldEditorSurfaceHandle {
  focus: () => void;
}

interface FieldEditorSurfaceProps {
  mode: FieldEditorMode;
  inputMode?: FieldEditorInputMode;
  displayValue: string;
  placeholder?: string;
  /** Same path as the sheet Save action — validation and submit. */
  onSubmit: () => void;
  onChange: (raw: string) => void;
}

/**
 * Borderless, caret-first editing surface for the field editor sheet.
 * Center-aligned with natural wrapping — only sheet inline inputs use this behavior.
 *
 * @see docs/FOUNDATION.md § 5 — Inline field editor (frozen)
 */
export const FieldEditorSurface = forwardRef<
  FieldEditorSurfaceHandle,
  FieldEditorSurfaceProps
>(function FieldEditorSurface(
  {
    mode,
    inputMode,
    displayValue,
    placeholder,
    onSubmit,
    onChange,
  },
  ref,
) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isNumeric = mode === "numeric";
  const resolvedInputMode =
    inputMode ?? (isNumeric ? "decimal" : "text");

  const syncHeight = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${input.scrollHeight}px`;
  }, []);

  useImperativeHandle(ref, () => ({
    focus: () => {
      const input = inputRef.current;
      if (!input) return;
      input.focus({ preventScroll: true });
      const length = input.value.length;
      input.setSelectionRange(length, length);
    },
  }));

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.focus({ preventScroll: true });
    const length = input.value.length;
    input.setSelectionRange(length, length);
    syncHeight();
  }, [syncHeight]);

  useLayoutEffect(() => {
    syncHeight();
  }, [displayValue, placeholder, syncHeight]);

  function handleChange(raw: string) {
    onChange(raw);
    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) return;
      const length = input.value.length;
      input.setSelectionRange(length, length);
      syncHeight();
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!isFieldEditorKeyboardSubmitKey(event.nativeEvent)) return;
    event.preventDefault();
    onSubmit();
  }

  return (
    <div className="flex w-full min-w-0 shrink-0 touch-auto flex-col items-center justify-center text-center">
      <div className="flex w-full min-w-0 flex-wrap items-baseline justify-center gap-x-2 gap-y-1">
        <textarea
          ref={inputRef}
          rows={1}
          inputMode={resolvedInputMode}
          value={displayValue}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect={isNumeric ? "off" : undefined}
          spellCheck={isNumeric ? false : undefined}
          enterKeyHint="done"
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            FIELD_EDITOR_SURFACE_INPUT_CLASS,
            isNumeric && "tabular-nums tracking-tight",
          )}
        />
      </div>
    </div>
  );
});
