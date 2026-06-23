"use client";

import type { ReactNode } from "react";

import { InputFieldRowTrigger } from "@/components/forms/input-field";
import { Button } from "@/components/ui/button";
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
  return (
    <section className={className}>
      <h2 className="mb-2 text-start text-lg font-semibold">{title}</h2>
      <div className={cn(CARD_SURFACE_CLASS, "px-4")}>
        <InputFieldRowTrigger
          className="min-h-14 py-2"
          onClick={onEdit}
        >
          <span className={INPUT_FIELD_VALUE_CLASS}>{editLabel}</span>
        </InputFieldRowTrigger>

        {children ? (
          <div className="border-t border-border">{children}</div>
        ) : null}

        <div className="border-t border-border">
          <Button
            type="button"
            variant="ghost"
            className="h-11 w-full text-destructive hover:text-destructive"
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
