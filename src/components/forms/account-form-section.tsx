import { Children, isValidElement, type ReactNode } from "react";

import {
  ACCOUNT_FORM_FIELD_ROW_CLASS,
  ACCOUNT_FORM_SECTION_FIELDS_CLASS,
  ACCOUNT_FORM_SECTION_HEADER_CLASS,
  ACCOUNT_FORM_SECTION_TITLE_CLASS,
} from "@/lib/layout/account-form-chrome";
import { CARD_SURFACE_CLASS } from "@/lib/layout/card-surface";
import { cn } from "@/lib/utils";

export {
  AccountFormAccountPicker,
  AccountFormDateField,
  AccountFormEditableField,
  AccountFormGroupError,
  AccountFormIdentifierField,
  AccountFormInstitutionPicker,
  AccountFormRenewalTypePicker,
  AccountFormScrollChipSelect,
  AccountFormSections,
  useAccountFormFieldRequired,
  type ScrollChipOption,
} from "@/components/forms/account-form-field";

interface AccountFormFieldProps {
  children: ReactNode;
  className?: string;
}

/** Single row inside an account form section. */
export function AccountFormField({ children, className }: AccountFormFieldProps) {
  return (
    <div className={cn(ACCOUNT_FORM_FIELD_ROW_CLASS, className)}>{children}</div>
  );
}

interface AccountFormSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * Frozen account form section — card surface, title, field rows.
 *
 * @see docs/FOUNDATION.md — Account forms foundation
 */
export function AccountFormSection({
  title,
  children,
  className,
}: AccountFormSectionProps) {
  const fields = Children.toArray(children).filter(isValidElement);

  return (
    <section
      className={cn(
        CARD_SURFACE_CLASS,
        "min-w-0 w-full overflow-hidden",
        className,
      )}
    >
      <div className={ACCOUNT_FORM_SECTION_HEADER_CLASS}>
        <h2 className={ACCOUNT_FORM_SECTION_TITLE_CLASS}>{title}</h2>
      </div>
      <div className={ACCOUNT_FORM_SECTION_FIELDS_CLASS}>
        {fields.map((field, index) => (
          <AccountFormField key={field.key ?? index}>{field}</AccountFormField>
        ))}
      </div>
    </section>
  );
}
