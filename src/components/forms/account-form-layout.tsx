import type { ReactNode } from "react";

import {
  ACCOUNT_FORM_DESCRIPTION_CLASS,
  ACCOUNT_FORM_DESCRIPTION_TO_SECTION_GAP_PX,
  accountFormDisabledClassName,
} from "@/lib/layout/account-form-chrome";
import { cn } from "@/lib/utils";

interface AccountFormDescriptionProps {
  children: ReactNode;
}

export function AccountFormDescription({ children }: AccountFormDescriptionProps) {
  return <p className={ACCOUNT_FORM_DESCRIPTION_CLASS}>{children}</p>;
}

interface AccountFormEditContentProps {
  children: ReactNode;
  disabled?: boolean;
  formError?: string;
}

/** Shared wrapper for account edit forms. */
export function AccountFormEditContent({
  children,
  disabled = false,
  formError,
}: AccountFormEditContentProps) {
  return (
    <div className={accountFormDisabledClassName(disabled)}>
      {children}
      {formError ? (
        <p className="mt-4 text-sm text-destructive">{formError}</p>
      ) : null}
    </div>
  );
}

interface AccountFormCreateContentProps {
  children: ReactNode;
  description?: string;
  disabled?: boolean;
  formError?: string;
}

/** Shared wrapper for account create forms — 16px description → first section. */
export function AccountFormCreateContent({
  children,
  description,
  disabled = false,
  formError,
}: AccountFormCreateContentProps) {
  return (
    <AccountFormEditContent disabled={disabled} formError={formError}>
      {description ? (
        <>
          <AccountFormDescription>{description}</AccountFormDescription>
          <div
            style={{ marginTop: ACCOUNT_FORM_DESCRIPTION_TO_SECTION_GAP_PX }}
          >
            {children}
          </div>
        </>
      ) : (
        children
      )}
    </AccountFormEditContent>
  );
}
