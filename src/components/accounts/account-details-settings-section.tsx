"use client";

import { Children, isValidElement, type ReactNode } from "react";

import { InputFieldRowTrigger } from "@/components/forms/input-field";
import { Button } from "@/components/ui/button";
import {
  ACCOUNT_FORM_FIELD_ROW_CLASS,
  ACCOUNT_FORM_SECTION_FIELDS_CLASS,
  ACCOUNT_FORM_SECTION_TITLE_CLASS,
  ACCOUNT_FORM_SECTION_TITLE_TO_FIELDS_CLASS,
} from "@/lib/layout/account-form-chrome";
import {
  ACCOUNT_DETAILS_COMPACT_FIELD_ROW_CLASS,
  ACCOUNT_DETAILS_SECTION_PADDING_CLASS,
} from "@/lib/layout/account-details-chrome";
import { CARD_SURFACE_CLASS } from "@/lib/layout/card-surface";
import { INPUT_FIELD_VALUE_CLASS } from "@/lib/layout/input-field-chrome";
import { cn } from "@/lib/utils";

interface AccountDetailsSettingsSectionProps {
  title: string;
  editLabel: string;
  archiveLabel: string;
  onEdit: () => void;
  onArchive: () => void;
  archiveDisabled?: boolean;
  children?: ReactNode;
  className?: string;
}

export function AccountDetailsSettingsSection({
  title,
  editLabel,
  archiveLabel,
  onEdit,
  onArchive,
  archiveDisabled = false,
  children,
  className,
}: AccountDetailsSettingsSectionProps) {
  const toggleRows = Children.toArray(children).filter(isValidElement);

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
        <div className={cn(ACCOUNT_FORM_FIELD_ROW_CLASS, "mt-2")}>
          <InputFieldRowTrigger className="min-h-0 py-0" onClick={onEdit}>
            <span className={INPUT_FIELD_VALUE_CLASS}>{editLabel}</span>
          </InputFieldRowTrigger>
        </div>

        {toggleRows.map((row, index) => (
          <div
            key={row.key ?? index}
            className={ACCOUNT_DETAILS_COMPACT_FIELD_ROW_CLASS}
          >
            {row}
          </div>
        ))}

        <div className={ACCOUNT_FORM_FIELD_ROW_CLASS}>
          <Button
            type="button"
            variant="ghost"
            className="h-auto min-h-0 w-full justify-center px-0 py-0 text-center text-destructive hover:bg-transparent hover:text-destructive"
            disabled={archiveDisabled}
            onClick={onArchive}
          >
            {archiveLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
