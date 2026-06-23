"use client";

import type { ReactNode } from "react";

import { ACCOUNT_CARD_CATEGORY_LABEL_CLASS } from "@/lib/layout/account-card-chrome";
import {
  ACCOUNT_TYPE_PICKER_CARD_GAP_PX,
  ACCOUNT_TYPE_PICKER_CATEGORY_TO_FIRST_GAP_PX,
} from "@/lib/layout/account-type-picker-chrome";

interface AccountTypePickerSectionProps {
  title: string;
  children: ReactNode;
}

export function AccountTypePickerSection({
  title,
  children,
}: AccountTypePickerSectionProps) {
  return (
    <section>
      <p
        className={ACCOUNT_CARD_CATEGORY_LABEL_CLASS}
        style={{ marginBottom: ACCOUNT_TYPE_PICKER_CATEGORY_TO_FIRST_GAP_PX }}
      >
        {title}
      </p>
      <div
        className="flex flex-col"
        style={{ gap: ACCOUNT_TYPE_PICKER_CARD_GAP_PX }}
      >
        {children}
      </div>
    </section>
  );
}
