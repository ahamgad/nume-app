"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

import { AccountIdentifierField } from "@/components/accounts/account-identifier-field";
import { RenewalTypePicker } from "@/components/certificates/renewal-type-picker";
import { EditableField } from "@/components/field-editor";
import { InputFieldError } from "@/components/forms/input-field";
import { AccountPicker } from "@/components/ui/account-picker";
import { DateField, type DateFieldProps } from "@/components/ui/date-field";
import { InstitutionPicker } from "@/components/ui/institution-picker";
import {
  ScrollChipSelect,
  type ScrollChipOption,
} from "@/components/ui/scroll-chip-select";
import {
  type AccountFormRequirements,
  isAccountFormFieldRequired,
} from "@/lib/finance/account-form-required";
import { ACCOUNT_FORM_SECTION_STACK_CLASS } from "@/lib/layout/account-form-chrome";
import { cn } from "@/lib/utils";

const AccountFormRequirementsContext = createContext<AccountFormRequirements>(
  {},
);

export function useAccountFormFieldRequired(fieldKey: string): boolean {
  const requirements = useContext(AccountFormRequirementsContext);
  return isAccountFormFieldRequired(fieldKey, requirements);
}

interface AccountFormSectionsProps {
  children: ReactNode;
  className?: string;
  requirements?: AccountFormRequirements;
}

/** Stacks account form sections with foundation spacing and requirement context. */
export function AccountFormSections({
  children,
  className,
  requirements = {},
}: AccountFormSectionsProps) {
  return (
    <AccountFormRequirementsContext.Provider value={requirements}>
      <div className={cn(ACCOUNT_FORM_SECTION_STACK_CLASS, className)}>
        {children}
      </div>
    </AccountFormRequirementsContext.Provider>
  );
}

type AccountFormEditableFieldProps = Omit<
  React.ComponentProps<typeof EditableField>,
  "variant"
>;

/** Account form text/numeric field — always uses row input foundation. */
export function AccountFormEditableField({
  required,
  id,
  ...props
}: AccountFormEditableFieldProps) {
  const contextRequired = useAccountFormFieldRequired(id);
  return (
    <EditableField
      id={id}
      variant="row"
      required={required ?? contextRequired}
      {...props}
    />
  );
}

type AccountFormInstitutionPickerProps = React.ComponentProps<
  typeof InstitutionPicker
>;

export function AccountFormInstitutionPicker({
  required,
  id = "institution",
  ...props
}: AccountFormInstitutionPickerProps) {
  const contextRequired = useAccountFormFieldRequired(id);
  return (
    <InstitutionPicker
      id={id}
      required={required ?? contextRequired}
      variant="row"
      {...props}
    />
  );
}

type AccountFormAccountPickerProps = React.ComponentProps<typeof AccountPicker>;

export function AccountFormAccountPicker({
  required,
  id,
  ...props
}: AccountFormAccountPickerProps) {
  const contextRequired = useAccountFormFieldRequired(id ?? "");
  return (
    <AccountPicker
      id={id}
      required={required ?? contextRequired}
      variant="row"
      {...props}
    />
  );
}

type AccountFormDateFieldProps = DateFieldProps;

export function AccountFormDateField({
  required,
  id,
  variant = "row",
  ...props
}: AccountFormDateFieldProps) {
  const contextRequired = useAccountFormFieldRequired(id ?? "");
  return (
    <DateField
      id={id}
      variant={variant}
      required={required ?? contextRequired}
      {...props}
    />
  );
}

type AccountFormRenewalTypePickerProps = React.ComponentProps<
  typeof RenewalTypePicker
>;

export function AccountFormRenewalTypePicker(
  props: AccountFormRenewalTypePickerProps,
) {
  return <RenewalTypePicker variant="row" {...props} />;
}

type AccountFormIdentifierFieldProps = React.ComponentProps<
  typeof AccountIdentifierField
>;

export function AccountFormIdentifierField({
  required,
  id,
  ...props
}: AccountFormIdentifierFieldProps) {
  const contextRequired = useAccountFormFieldRequired(id);
  return (
    <AccountIdentifierField
      id={id}
      variant="row"
      required={required ?? contextRequired}
      {...props}
    />
  );
}

interface AccountFormScrollChipSelectProps<T extends string | number>
  extends React.ComponentProps<typeof ScrollChipSelect<T>> {
  fieldKey?: string;
}

export function AccountFormScrollChipSelect<T extends string | number>({
  required,
  fieldId,
  fieldKey,
  ...props
}: AccountFormScrollChipSelectProps<T>) {
  const contextRequired = useAccountFormFieldRequired(
    fieldKey ?? fieldId ?? "",
  );
  return (
    <ScrollChipSelect
      fieldId={fieldId}
      required={required ?? contextRequired}
      {...props}
    />
  );
}

interface AccountFormGroupErrorProps {
  error?: string;
  id?: string;
}

/** In-flow group-level validation message for conditional field clusters. */
export function AccountFormGroupError({ error, id }: AccountFormGroupErrorProps) {
  if (!error) return null;
  return <InputFieldError id={id}>{error}</InputFieldError>;
}

export type { ScrollChipOption };
