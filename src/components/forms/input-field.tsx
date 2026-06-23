"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { CardChevron } from "@/components/ui/card-chevron";
import {
  INPUT_FIELD_AFFIX_CLASS,
  INPUT_FIELD_ERROR_CLASS,
  INPUT_FIELD_ERROR_OFFSET_CLASS,
  INPUT_FIELD_LABEL_CLASS,
  INPUT_FIELD_PLACEHOLDER_CLASS,
  INPUT_FIELD_REQUIRED_INDICATOR_CLASS,
  INPUT_FIELD_ROW_TRIGGER_CLASS,
  INPUT_FIELD_STACK_CLASS,
  INPUT_FIELD_VALUE_CLASS,
} from "@/lib/layout/input-field-chrome";
import { cn } from "@/lib/utils";

interface InputFieldLabelProps {
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

/** Shared field label with optional required indicator. */
export function InputFieldLabel({
  htmlFor,
  required = false,
  children,
  className,
}: InputFieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className={cn(INPUT_FIELD_LABEL_CLASS, className)}>
      {children}
      {required ? (
        <span className={INPUT_FIELD_REQUIRED_INDICATOR_CLASS} aria-hidden>
          *
        </span>
      ) : null}
    </label>
  );
}

interface InputFieldErrorProps {
  id?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Field error — absolutely positioned so section divider rhythm is unchanged.
 */
export function InputFieldError({ id, children, className }: InputFieldErrorProps) {
  return (
    <p
      id={id}
      role="alert"
      className={cn(
        INPUT_FIELD_ERROR_CLASS,
        INPUT_FIELD_ERROR_OFFSET_CLASS,
        "pointer-events-none absolute inset-x-0 top-full",
        className,
      )}
    >
      {children}
    </p>
  );
}

interface InputFieldProps {
  id?: string;
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  hideLabel?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Frozen input field shell — label, control slot, error placement.
 *
 * @see docs/FOUNDATION.md — Input fields foundation
 */
export function InputField({
  id,
  label,
  required = false,
  error,
  hint,
  hideLabel = false,
  children,
  className,
}: InputFieldProps) {
  return (
    <div className={cn("relative", className)}>
      <div className={INPUT_FIELD_STACK_CLASS}>
        {label && !hideLabel ? (
          <InputFieldLabel htmlFor={id} required={required}>
            {label}
          </InputFieldLabel>
        ) : null}
        {children}
      </div>
      {hint && !error ? (
        <p
          id={id ? `${id}-hint` : undefined}
          className="pointer-events-none absolute inset-x-0 top-full mt-1 text-[0.8125rem] text-muted-foreground"
        >
          {hint}
        </p>
      ) : null}
      {error ? (
        <InputFieldError id={id ? `${id}-error` : undefined}>{error}</InputFieldError>
      ) : null}
    </div>
  );
}

interface InputFieldAffixProps {
  children: ReactNode;
  className?: string;
}

export function InputFieldAffix({ children, className }: InputFieldAffixProps) {
  return <span className={cn(INPUT_FIELD_AFFIX_CLASS, className)}>{children}</span>;
}

interface InputFieldValueProps {
  children: ReactNode;
  isPlaceholder?: boolean;
  className?: string;
}

export function InputFieldValue({
  children,
  isPlaceholder = false,
  className,
}: InputFieldValueProps) {
  return (
    <span
      className={cn(
        INPUT_FIELD_VALUE_CLASS,
        isPlaceholder && INPUT_FIELD_PLACEHOLDER_CLASS,
        className,
      )}
    >
      {children}
    </span>
  );
}

interface InputFieldRowTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

/** Borderless editable row with shared card chevron. */
export const InputFieldRowTrigger = forwardRef<
  HTMLButtonElement,
  InputFieldRowTriggerProps
>(function InputFieldRowTrigger(
  { children, className, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(INPUT_FIELD_ROW_TRIGGER_CLASS, className)}
      {...props}
    >
      {children}
      <CardChevron />
    </button>
  );
});
