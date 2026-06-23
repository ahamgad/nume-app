"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

import { FIELD_EDITOR_SURFACE_INPUT_CLASS } from "@/lib/field-editor/field-editor-chrome";
import {
  createFieldEditorKeyboardSubmitDebouncer,
  isFieldEditorKeyboardSubmitKey,
  shouldFieldEditorSubmitOnBlur,
} from "@/lib/field-editor/keyboard-submit";
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
  /** When true, blur must not commit (backdrop / back discard in progress). */
  isDiscardIntent?: () => boolean;
  onChange: (raw: string) => void;
}

/**
 * Borderless, caret-first editing surface for the field editor sheet.
 * Center-aligned with natural wrapping — only sheet inline inputs use this behavior.
 *
 * Keyboard submit paths (all route to `onSubmit`):
 * - Enter / Return / keyCode 13 (text keyboard Done, Android Go)
 * - Form submit (hidden submit control)
 * - Blur after keyboard Done on iOS numeric / decimal pads (no Enter key)
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
    isDiscardIntent,
    onChange,
  },
  ref,
) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isNumeric = mode === "numeric";
  const resolvedInputMode =
    inputMode ?? (isNumeric ? "decimal" : "text");

  const submitOnce = useMemo(
    () => createFieldEditorKeyboardSubmitDebouncer(onSubmit),
    [onSubmit],
  );

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

  function handleKeyboardSubmit(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!isFieldEditorKeyboardSubmitKey(event.nativeEvent)) return;
    event.preventDefault();
    submitOnce();
  }

  function handleBlur() {
    // Defer so discard pointerdown on backdrop / back runs before blur submit.
    requestAnimationFrame(() => {
      const discardIntent = isDiscardIntent?.() ?? false;
      if (!shouldFieldEditorSubmitOnBlur(discardIntent)) return;
      submitOnce();
    });
  }

  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitOnce();
  }

  return (
    <form
      noValidate
      className="flex w-full min-w-0 shrink-0 touch-auto flex-col items-center justify-center text-center"
      onSubmit={handleFormSubmit}
    >
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
          onKeyDown={handleKeyboardSubmit}
          onKeyUp={handleKeyboardSubmit}
          onBlur={handleBlur}
          className={cn(
            FIELD_EDITOR_SURFACE_INPUT_CLASS,
            isNumeric && "tabular-nums tracking-tight",
          )}
        />
        <button
          type="submit"
          tabIndex={-1}
          aria-hidden
          className="sr-only"
        >
          Save
        </button>
      </div>
    </form>
  );
});
