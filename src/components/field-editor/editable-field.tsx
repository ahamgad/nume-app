"use client";

import { inputClassName } from "@/components/ui/input";
import {
  InputField,
  InputFieldAffix,
  InputFieldRowTrigger,
  InputFieldValue,
} from "@/components/forms/input-field";
import type {
  FieldEditorInputMode,
  FieldEditorMode,
} from "@/lib/field-editor/types";
import { sanitizeFieldEditorPlaceholder } from "@/lib/field-editor/placeholder";
import {
  INPUT_FIELD_AMOUNT_PREFIX,
  INPUT_FIELD_RATE_SUFFIX,
} from "@/lib/layout/input-field-chrome";
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
  required?: boolean;
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

function resolveFieldDecorations(
  mode: FieldEditorMode,
  options: {
    prefixLabel?: string;
    suffixLabel?: string;
    showSignToggle?: boolean;
    formatDisplay?: (value: string) => string;
  },
) {
  const isRateField = options.suffixLabel === "%";
  const isAmountField =
    options.showSignToggle ||
    Boolean(options.prefixLabel) ||
    (mode === "numeric" &&
      options.formatDisplay != null &&
      !isRateField);

  return {
    prefix:
      isAmountField && !isRateField
        ? (options.prefixLabel ?? INPUT_FIELD_AMOUNT_PREFIX)
        : options.prefixLabel,
    suffix: isRateField
      ? (options.suffixLabel ?? INPUT_FIELD_RATE_SUFFIX)
      : options.suffixLabel,
  };
}

/**
 * Inline trigger for the Nume field-editor bottom sheet.
 * Visually identical to Input (default) or a chevron row; never receives focus.
 *
 * @see docs/FOUNDATION.md — Input fields foundation, Inline field editor
 */
export function EditableField({
  id,
  label,
  value,
  placeholder,
  disabled = false,
  error,
  hint,
  required,
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
  const isRequired = required === true;

  const { prefix, suffix } = resolveFieldDecorations(mode, {
    prefixLabel,
    suffixLabel,
    showSignToggle,
    formatDisplay,
  });

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
      prefixLabel: prefix,
      suffixLabel: suffix,
      showSignToggle,
      validate,
      onSave,
    });
  }

  if (variant === "row") {
    return (
      <InputField
        id={id}
        label={label}
        required={isRequired}
        error={error}
        hint={hint}
        hideLabel={hideLabel}
      >
        <InputFieldRowTrigger
          id={id}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          onClick={handleOpen}
          className={triggerClassName}
        >
          <span className="flex min-w-0 flex-1 items-center gap-1.5">
            {prefix ? <InputFieldAffix>{prefix}</InputFieldAffix> : null}
            <InputFieldValue isPlaceholder={Boolean(showPlaceholder)}>
              {showPlaceholder ? resolvedPlaceholder : resolvedDisplay}
            </InputFieldValue>
            {suffix ? <InputFieldAffix>{suffix}</InputFieldAffix> : null}
          </span>
        </InputFieldRowTrigger>
      </InputField>
    );
  }

  const triggerClasses = cn(
    inputClassName,
    "block w-full min-w-0 cursor-text truncate text-start",
    prefix && "ps-16",
    suffix && "pe-10",
    error && "border-destructive",
    showPlaceholder && "text-muted-foreground",
    triggerClassName,
  );

  return (
    <InputField
      id={id}
      label={label}
      required={isRequired}
      error={error}
      hint={hint}
      hideLabel={hideLabel}
    >
      {prefix || suffix ? (
        <div className="relative min-w-0">
          {prefix ? (
            <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-base font-medium text-muted-foreground">
              {prefix}
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
          {suffix ? (
            <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-4 text-sm text-muted-foreground">
              {suffix}
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
    </InputField>
  );
}
