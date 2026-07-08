"use client";

import type { ReactNode } from "react";

import {
  InputFieldError,
  InputFieldLabel,
} from "@/components/forms/input-field";
import {
  INPUT_FIELD_HINT_CLASS,
  INPUT_FIELD_LABEL_TO_CONTROL_GAP_PX,
  INPUT_FIELD_STACK_CLASS,
} from "@/lib/layout/input-field-chrome";
import { cn } from "@/lib/utils";

interface AuthInputFieldProps {
  id: string;
  label: ReactNode;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Auth-only field shell — same Foundation error/hint components with a tighter
 * control → message gap ({@link INPUT_FIELD_LABEL_TO_CONTROL_GAP_PX}px token).
 */
export function AuthInputField({
  id,
  label,
  required = false,
  error,
  hint,
  children,
  className,
}: AuthInputFieldProps) {
  return (
    <div className={cn(INPUT_FIELD_STACK_CLASS, className)}>
      {typeof label === "string" ? (
        <InputFieldLabel htmlFor={id} required={required}>
          {label}
        </InputFieldLabel>
      ) : (
        label
      )}
      <div
        className="flex flex-col"
        style={{ gap: INPUT_FIELD_LABEL_TO_CONTROL_GAP_PX }}
      >
        {children}
        {error ? (
          <InputFieldError id={`${id}-error`} className="mt-0">
            {error}
          </InputFieldError>
        ) : null}
        {hint && !error ? (
          <p id={`${id}-hint`} className={INPUT_FIELD_HINT_CLASS}>
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
