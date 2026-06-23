"use client";

import { Children, isValidElement, type ReactNode } from "react";

import {
  ACCOUNT_FORM_FIELD_ROW_CLASS,
  ACCOUNT_FORM_SECTION_FIELDS_CLASS,
  ACCOUNT_FORM_SECTION_TITLE_CLASS,
  ACCOUNT_FORM_SECTION_TITLE_TO_FIELDS_CLASS,
} from "@/lib/layout/account-form-chrome";
import { ACCOUNT_DETAILS_SECTION_PADDING_CLASS } from "@/lib/layout/account-details-chrome";
import { CARD_SURFACE_CLASS } from "@/lib/layout/card-surface";
import { cn } from "@/lib/utils";

interface AccountDetailsSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * Frozen account details content section — card surface, title inside card,
 * 16px padding, 16px item/divider rhythm.
 *
 * @see docs/FOUNDATION.md — Account details foundation
 */
export function AccountDetailsSection({
  title,
  children,
  className,
}: AccountDetailsSectionProps) {
  const rows = Children.toArray(children).filter(isValidElement);

  return (
    <section
      className={cn(
        CARD_SURFACE_CLASS,
        ACCOUNT_DETAILS_SECTION_PADDING_CLASS,
        "min-w-0 w-full",
        className,
      )}
    >
      <h2 className={ACCOUNT_FORM_SECTION_TITLE_CLASS}>{title}</h2>
      <div
        className={cn(
          ACCOUNT_FORM_SECTION_TITLE_TO_FIELDS_CLASS,
          ACCOUNT_FORM_SECTION_FIELDS_CLASS,
        )}
      >
        {rows.map((row, index) => (
          <div key={row.key ?? index} className={ACCOUNT_FORM_FIELD_ROW_CLASS}>
            {row}
          </div>
        ))}
      </div>
    </section>
  );
}

interface AccountDetailsDetailRowProps {
  label: string;
  value: string;
}

/** Label/value row inside an account details section. */
export function AccountDetailsDetailRow({
  label,
  value,
}: AccountDetailsDetailRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[0.9375rem] text-muted-foreground">{label}</span>
      <span className="text-end text-[0.9375rem] font-medium tabular-nums">{value}</span>
    </div>
  );
}
