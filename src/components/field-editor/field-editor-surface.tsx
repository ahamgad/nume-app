"use client";

import { useEffect, useRef } from "react";

import type { FieldEditorInputMode, FieldEditorMode } from "@/lib/field-editor/types";
import { cn } from "@/lib/utils";

interface FieldEditorSurfaceProps {
  /** When true, focus the input and present the keyboard. */
  focusReady: boolean;
  mode: FieldEditorMode;
  inputMode?: FieldEditorInputMode;
  displayValue: string;
  placeholder?: string;
  prefixLabel?: string;
  suffixLabel?: string;
  onChange: (raw: string) => void;
}

/**
 * Borderless, caret-first editing surface for the field editor sheet.
 * Not a traditional Input — minimal chrome, large type, premium focus.
 */
export function FieldEditorSurface({
  focusReady,
  mode,
  inputMode,
  displayValue,
  placeholder,
  prefixLabel,
  suffixLabel,
  onChange,
}: FieldEditorSurfaceProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasFocusedRef = useRef(false);
  const isNumeric = mode === "numeric";
  const resolvedInputMode =
    inputMode ?? (isNumeric ? "decimal" : "text");

  useEffect(() => {
    if (!focusReady || hasFocusedRef.current) return;

    const frame = requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) return;
      input.focus({ preventScroll: true });
      const length = input.value.length;
      input.setSelectionRange(length, length);
      hasFocusedRef.current = true;
    });

    return () => cancelAnimationFrame(frame);
  }, [focusReady]);

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
    <div className="relative flex min-w-0 shrink-0 items-baseline gap-2">
      {prefixLabel ? (
        <span
          aria-hidden
          className="shrink-0 text-[1.75rem] font-medium tabular-nums text-muted-foreground"
        >
          {prefixLabel}
        </span>
      ) : null}
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
          "min-w-0 flex-1 border-0 bg-transparent p-0 outline-none placeholder:text-muted-foreground/70",
          isNumeric
            ? "text-[2.25rem] font-semibold tabular-nums tracking-tight"
            : "text-[1.75rem] font-semibold leading-snug",
        )}
      />
      {suffixLabel ? (
        <span
          aria-hidden
          className="shrink-0 text-[1.75rem] font-medium tabular-nums text-muted-foreground"
        >
          {suffixLabel}
        </span>
      ) : null}
    </div>
  );
}
