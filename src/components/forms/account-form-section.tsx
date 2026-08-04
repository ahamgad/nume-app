import { Children, isValidElement, type ReactNode } from "react";

import {
  ACCOUNT_FORM_ACTION_CONTENT_OPTICAL_OFFSET_CLASS,
  ACCOUNT_FORM_FIELD_ROW_CLASS,
  ACCOUNT_FORM_FIELD_ROW_STANDALONE_CLASS,
  ACCOUNT_FORM_SECTION_ACTION_PADDING_CLASS,
  ACCOUNT_FORM_SECTION_FIELDS_CLASS,
  ACCOUNT_FORM_SECTION_GAP_PX,
  ACCOUNT_FORM_SECTION_PADDING_CLASS,
  ACCOUNT_FORM_SECTION_TITLE_CLASS,
  ACCOUNT_FORM_SECTION_TITLE_TO_FIELDS_CLASS,
} from "@/lib/layout/account-form-chrome";
import { CARD_SURFACE_CLASS } from "@/lib/layout/card-surface";
import { cn } from "@/lib/utils";
import { SurfaceStateProvider } from "@/providers/surface-state-provider";

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
  /** Optional — omit for titleless action sections (e.g. Sign out). */
  title?: string;
  /**
   * Optional content above the section title (e.g. centered profile avatar).
   * Not wrapped as a field row.
   */
  leading?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Frozen account form section — one card surface; title and fields share 16px padding.
 *
 * Titleless action sections use horizontal section inset + standalone field-row
 * vertical rhythm so padding does not stack.
 *
 * @see docs/FOUNDATION.md — Account forms foundation
 */
export function AccountFormSection({
  title,
  leading,
  children,
  className,
}: AccountFormSectionProps) {
  const fields = Children.toArray(children).filter(isValidElement);
  const isActionSection = !title && !leading;
  const fieldRowClass = isActionSection
    ? ACCOUNT_FORM_FIELD_ROW_STANDALONE_CLASS
    : ACCOUNT_FORM_FIELD_ROW_CLASS;
  const sectionPaddingClass = isActionSection
    ? ACCOUNT_FORM_SECTION_ACTION_PADDING_CLASS
    : ACCOUNT_FORM_SECTION_PADDING_CLASS;

  return (
    <SurfaceStateProvider value="card">
      <section
        className={cn(
          CARD_SURFACE_CLASS,
          sectionPaddingClass,
          "min-w-0 w-full overflow-hidden",
          className,
        )}
      >
        {leading ? (
          <div
            className="flex justify-center"
            style={{
              marginTop: ACCOUNT_FORM_SECTION_GAP_PX,
              marginBottom: ACCOUNT_FORM_SECTION_GAP_PX,
            }}
          >
            {leading}
          </div>
        ) : null}
        {title ? (
          <h2
            className={cn(
              ACCOUNT_FORM_SECTION_TITLE_CLASS,
              leading ? ACCOUNT_FORM_SECTION_TITLE_TO_FIELDS_CLASS : undefined,
            )}
          >
            {title}
          </h2>
        ) : null}
        {fields.length > 0 ? (
          <div
            className={cn(
              title || leading
                ? ACCOUNT_FORM_SECTION_TITLE_TO_FIELDS_CLASS
                : undefined,
              ACCOUNT_FORM_SECTION_FIELDS_CLASS,
            )}
          >
            {fields.map((field, index) => (
              <div key={field.key ?? index} className={fieldRowClass}>
                {isActionSection ? (
                  <div className={ACCOUNT_FORM_ACTION_CONTENT_OPTICAL_OFFSET_CLASS}>
                    {field}
                  </div>
                ) : (
                  field
                )}
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </SurfaceStateProvider>
  );
}
