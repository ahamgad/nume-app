"use client";

import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import {
  ACCOUNT_CREATE_SUBMIT_KEY,
  ACCOUNT_CREATE_SUBMITTING_KEY,
} from "@/lib/finance/account-create-copy";
import { FORM_PRIMARY_ACTION_BUTTON_CLASS } from "@/lib/layout/form-action-chrome";
import { useT } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";

type AccountCreateActionButtonProps = Omit<
  ComponentProps<typeof Button>,
  "children"
> & {
  submitting?: boolean;
  /** Overrides the default "Create account" label (e.g. first-account Continue). */
  label?: string;
};

/** Primary CTA for account creation screens — unified label and loading state. */
export function AccountCreateActionButton({
  submitting = false,
  label,
  className,
  disabled,
  ...props
}: AccountCreateActionButtonProps) {
  const t = useT();

  return (
    <Button
      className={cn(FORM_PRIMARY_ACTION_BUTTON_CLASS, className)}
      disabled={disabled ?? submitting}
      {...props}
    >
      {submitting
        ? t(ACCOUNT_CREATE_SUBMITTING_KEY)
        : (label ?? t(ACCOUNT_CREATE_SUBMIT_KEY))}
    </Button>
  );
}
