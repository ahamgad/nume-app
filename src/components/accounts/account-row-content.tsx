"use client";

import {
  InstitutionBrandAsset,
} from "@/components/institutions/institution-brand-asset";
import { formatAccountCardInstituteRow } from "@/lib/finance/account-card-display";
import { getAccountTypeCardLabelKey } from "@/lib/finance/account-labels";
import type { Account } from "@/lib/finance/types";
import {
  PICKER_ROW_PRIMARY_LABEL_CLASS,
  PICKER_ROW_SECONDARY_LABEL_CLASS,
  PICKER_ROW_TEXT_COLUMN_CLASS,
} from "@/lib/layout/picker-option-row";
import {
  resolveInstitutionBrandAssetProps,
} from "@/lib/institutions/catalog";
import type { TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface AccountRowContentProps {
  account: Account;
  identifierLast4?: string | null;
  t: (key: TranslationKey) => string;
}

/**
 * Frozen account picker row — logo, account name, account type · last-4.
 * Visual foundation matches Institution Picker (typography, logo size, spacing).
 *
 * @see docs/FOUNDATION.md — Account picker foundation
 */
export function AccountRowContent({
  account,
  identifierLast4,
  t,
}: AccountRowContentProps) {
  const typeLabel = t(getAccountTypeCardLabelKey(account.type));
  const metadataRow = formatAccountCardInstituteRow(
    account,
    identifierLast4,
    t,
  );
  const brandAsset = resolveInstitutionBrandAssetProps(account.institution, t);

  const logo = brandAsset ? (
    <InstitutionBrandAsset
      institutionId={brandAsset.institutionId}
      fallbackLabel={brandAsset.fallbackLabel}
    />
  ) : (
    <InstitutionBrandAsset
      institutionId={account.type}
      fallbackLabel={typeLabel}
    />
  );

  return (
    <>
      {logo}
      <span className={PICKER_ROW_TEXT_COLUMN_CLASS}>
        <span className={cn(PICKER_ROW_PRIMARY_LABEL_CLASS, "truncate")}>
          {account.name}
        </span>
        <span className={cn(PICKER_ROW_SECONDARY_LABEL_CLASS, "truncate")}>
          {metadataRow}
        </span>
      </span>
    </>
  );
}
