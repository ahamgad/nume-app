"use client";

import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from "react";

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
  suffixLabel?: string;
  onChange: (raw: string) => void;
}

/**
 * Borderless, caret-first editing surface for the field editor sheet.
 * Center-aligned with wrapping — only sheet inline inputs use this behavior.
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
    suffixLabel,
    onChange,
  },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isNumeric = mode === "numeric";
  const resolvedInputMode =
    inputMode ?? (isNumeric ? "decimal" : "text");

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
  }, []);

  function handleChange(raw: string) {
    onChange(raw);
    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) return;
      const length = input.value.length;
      input.setSelectionRange(length, length);
    });
  }

  return (
    <div className="flex w-full min-w-0 shrink-0 touch-auto flex-col items-center justify-center text-center">
      <div className="flex w-full min-w-0 flex-wrap items-baseline justify-center gap-x-2 gap-y-1">
        <input
          ref={inputRef}
          type="text"
          inputMode={resolvedInputMode}
          value={displayValue}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect={isNumeric ? "off" : undefined}
          spellCheck={isNumeric ? false : undefined}
          enterKeyHint="done"
          onChange={(event) => handleChange(event.target.value)}
          className={cn(
            "min-w-[3ch] max-w-full border-0 bg-transparent p-0 text-center outline-none",
            "whitespace-normal break-words placeholder:text-muted-foreground",
            isNumeric
              ? "text-[1.625rem] font-semibold tabular-nums tracking-tight"
              : "text-[1.375rem] font-semibold leading-snug",
          )}
          style={{
            width: `${Math.max(displayValue.length || (placeholder?.length ?? 0), 3)}ch`,
          }}
        />
        {suffixLabel ? (
          <span
            aria-hidden
            className="shrink-0 text-[1.375rem] font-medium tabular-nums text-muted-foreground"
          >
            {suffixLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
});
