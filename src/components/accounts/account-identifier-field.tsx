"use client";

import { EditableField } from "@/components/field-editor";
import { validateIdentifierLast4Field } from "@/lib/field-editor/field-validators";
import type { TranslationKey } from "@/lib/i18n";
import { sanitizeIdentifierLast4Input } from "@/lib/finance/account-identifier";
import { useT } from "@/providers/i18n-provider";

interface AccountIdentifierFieldProps {
  id: string;
  labelKey: TranslationKey;
  placeholderKey: TranslationKey;
  value: string;
  disabled?: boolean;
  error?: string;
  onChange: (value: string) => void;
  onClearError: () => void;
}

export function AccountIdentifierField({
  id,
  labelKey,
  placeholderKey,
  value,
  disabled = false,
  error,
  onChange,
  onClearError,
}: AccountIdentifierFieldProps) {
  const t = useT();

  return (
    <EditableField
      id={id}
      label={t(labelKey)}
      mode="numeric"
      inputMode="numeric"
      value={value}
      placeholder={t(placeholderKey)}
      disabled={disabled}
      error={error}
      sanitizeInput={sanitizeIdentifierLast4Input}
      validate={(next) => validateIdentifierLast4Field(next, t)}
      onSave={(next) => {
        onChange(next);
        onClearError();
      }}
    />
  );
}
