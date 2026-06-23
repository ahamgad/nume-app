"use client";

import { Pencil } from "lucide-react";
import type { ReactNode } from "react";

import { AccountDetailsBalanceCard } from "@/components/accounts/account-details-balance-card";
import { IconButton } from "@/components/ui/icon-button";
import { toDisplayOutstandingBalance, toStoredCreditCardBalance } from "@/lib/credit-cards/balance";
import { validateAccountBalanceField } from "@/lib/field-editor/field-validators";
import type { Account } from "@/lib/finance/types";
import {
  formatAmountInput,
  parseAmount,
  sanitizeAmountInput,
} from "@/lib/format/currency";
import { formatRelativeTime } from "@/lib/format/date";
import { getAmountInputLocale } from "@/lib/i18n/locale";
import { useFieldEditor } from "@/providers/field-editor-provider";
import { useT, useFormatLocale, useLocale } from "@/providers/i18n-provider";

interface LiabilityBalanceMetricCardProps {
  account: Account;
  label: string;
  meta?: string;
  footer?: ReactNode;
  editable?: boolean;
  onBalanceSave?: (outstandingBalance: number) => Promise<void>;
}

export function LiabilityBalanceMetricCard({
  account,
  label,
  meta,
  footer,
  editable = false,
  onBalanceSave,
}: LiabilityBalanceMetricCardProps) {
  const t = useT();
  const formatLocale = useFormatLocale();
  const locale = useLocale();
  const amountInputLocale = getAmountInputLocale(locale);
  const { openFieldEditor } = useFieldEditor();
  const outstanding = toDisplayOutstandingBalance(account.currentBalance);

  const canEdit =
    editable && account.status === "active" && Boolean(onBalanceSave);

  function handleEditBalance() {
    if (!onBalanceSave) return;

    openFieldEditor({
      mode: "numeric",
      title: label,
      value: sanitizeAmountInput(String(outstanding)),
      placeholder: t("common.currency.zeroPlaceholder"),
      inputMode: "decimal",
      prefixLabel: t("common.currency.code"),
      sanitizeInput: sanitizeAmountInput,
      formatDisplay: (amount) => formatAmountInput(amount, amountInputLocale),
      validate: (next) => validateAccountBalanceField(next, t),
      onSave: async (next) => {
        const parsed = parseAmount(next);
        if (parsed === null) return;
        await onBalanceSave(parsed);
      },
    });
  }

  return (
    <AccountDetailsBalanceCard
      label={label}
      amount={outstanding}
      locale={formatLocale}
      meta={meta}
      footer={footer}
      amountAction={
        canEdit ? (
          <IconButton
            type="button"
            size="sm"
            aria-label={label}
            onClick={handleEditBalance}
          >
            <Pencil />
          </IconButton>
        ) : undefined
      }
    />
  );
}

export function liabilityBalanceMeta(
  updatedAt: string,
  t: ReturnType<typeof useT>,
  formatLocale: string,
) {
  return t("dashboard.netWorth.updated", {
    time: formatRelativeTime(updatedAt, t, formatLocale),
  });
}

export { toStoredCreditCardBalance };
