"use client";

import { ChevronRight } from "lucide-react";

import { inputClassName } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  FieldEditorInputMode,
  FieldEditorMode,
} from "@/lib/field-editor/types";
import { sanitizeFieldEditorPlaceholder } from "@/lib/field-editor/placeholder";
import { cn } from "@/lib/utils";
import { useFieldEditor } from "@/providers/field-editor-provider";

interface EditableFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  hint?: string;
  /** Hide the inline label row; editor title still uses `label`. */
  hideLabel?: boolean;
  mode?: FieldEditorMode;
  inputMode?: FieldEditorInputMode;
  sanitizeInput?: (raw: string) => string;
  formatDisplay?: (value: string) => string;
  /** Formatted value shown on the inline trigger; defaults to formatDisplay(value) or value. */
  displayValue?: string;
  triggerClassName?: string;
  prefixLabel?: string;
  suffixLabel?: string;
  showSignToggle?: boolean;
  validate?: (value: string) => string | undefined;
  onSave: (value: string) => void;
  /** `row` — borderless chevron row for account forms; `input` — bordered trigger. */
  variant?: "input" | "row";
}

/**
 * Inline trigger for the Nume field-editor bottom sheet.
 * Visually identical to Input (default) or a chevron row; never receives focus.
 *
 * @see docs/FOUNDATION.md § 5 — Inline field editor (frozen)
 */
export function EditableField({
  id,
  label,
  value,
  placeholder,
  disabled = false,
  error,
  hint,
  hideLabel = false,
  mode = "text",
  inputMode,
  sanitizeInput,
  formatDisplay,
  displayValue,
  triggerClassName,
  prefixLabel,
  suffixLabel,
  showSignToggle,
  validate,
  onSave,
  variant = "input",
}: EditableFieldProps) {
  const { openFieldEditor } = useFieldEditor();

  const resolvedDisplay =
    displayValue ?? (formatDisplay ? formatDisplay(value) : value);
  const hasValue = resolvedDisplay.trim().length > 0;
  const resolvedPlaceholder = sanitizeFieldEditorPlaceholder(placeholder);
  const showPlaceholder = !hasValue && resolvedPlaceholder;

  function handleOpen() {
    if (disabled) return;

    openFieldEditor({
      mode,
      label,
      value,
      placeholder: resolvedPlaceholder,
      inputMode,
      sanitizeInput,
      formatDisplay,
      prefixLabel: variant === "row" ? undefined : prefixLabel,
      suffixLabel,
      showSignToggle,
      validate,
      onSave,
    });
  }

  if (variant === "row") {
    return (
      <div className="space-y-2">
        {hideLabel ? null : <Label htmlFor={id}>{label}</Label>}
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          onClick={handleOpen}
          className={cn(
            "flex min-h-12 w-full items-center gap-3 text-start transition-colors",
            "disabled:cursor-not-allowed disabled:opacity-50",
            triggerClassName,
          )}
        >
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-[0.9375rem] font-medium leading-snug",
              showPlaceholder && "font-normal text-muted-foreground",
              error && "text-destructive",
            )}
          >
            {showPlaceholder ? resolvedPlaceholder : resolvedDisplay}
          </span>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" />
        </button>
        {hint && !error ? (
          <p id={`${id}-hint`} className="text-[0.8125rem] text-muted-foreground">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={`${id}-error`} className="mt-1 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  const triggerClasses = cn(
    inputClassName,
    "block w-full min-w-0 cursor-text truncate text-start",
    prefixLabel && "ps-16",
    suffixLabel && "pe-10",
    error && "border-destructive",
    showPlaceholder && "text-muted-foreground",
    triggerClassName,
  );

  return (
    <div className="space-y-2">
      {hideLabel ? null : <Label htmlFor={id}>{label}</Label>}
      {prefixLabel || suffixLabel ? (
        <div className="relative min-w-0">
          {prefixLabel ? (
            <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-base font-medium text-muted-foreground">
              {prefixLabel}
            </span>
          ) : null}
          <button
            id={id}
            type="button"
            disabled={disabled}
            aria-describedby={
              error ? `${id}-error` : hint ? `${id}-hint` : undefined
            }
            onClick={handleOpen}
            className={triggerClasses}
          >
            {showPlaceholder ? resolvedPlaceholder : resolvedDisplay}
          </button>
          {suffixLabel ? (
            <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-4 text-sm text-muted-foreground">
              {suffixLabel}
            </span>
          ) : null}
        </div>
      ) : (
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          onClick={handleOpen}
          className={triggerClasses}
        >
          {showPlaceholder ? resolvedPlaceholder : resolvedDisplay}
        </button>
      )}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-[0.8125rem] text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
