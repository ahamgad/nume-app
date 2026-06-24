"use client";

import { Pencil } from "lucide-react";

import { AccountDetailsBalanceCard } from "@/components/accounts/account-details-balance-card";
import { IconButton } from "@/components/ui/icon-button";
import { validateAccountBalanceField } from "@/lib/field-editor/field-validators";
import { supportsQuickBalanceEdit } from "@/lib/finance/account-form";
import { getAccountDisplayBalance } from "@/lib/finance/balance-display";
import type { Account } from "@/lib/finance/types";
import {
  formatAmountInput,
  parseAmount,
  sanitizeAmountInput,
} from "@/lib/format/currency";
import { getAmountInputLocale } from "@/lib/i18n/locale";
import { useFieldEditor } from "@/providers/field-editor-provider";
import { useT, useFormatLocale, useLocale } from "@/providers/i18n-provider";

interface BalanceMetricCardProps {
  account: Account;
  label: string;
  meta?: string;
  editable?: boolean;
  onBalanceSave: (balance: number) => Promise<void>;
}

export function BalanceMetricCard({
  account,
  label,
  meta,
  editable = true,
  onBalanceSave,
}: BalanceMetricCardProps) {
  const t = useT();
  const formatLocale = useFormatLocale();
  const locale = useLocale();
  const amountInputLocale = getAmountInputLocale(locale);
  const { openFieldEditor } = useFieldEditor();

  const canEdit =
    editable && account.status === "active" && supportsQuickBalanceEdit(account.type);

  function handleEditBalance() {
    openFieldEditor({
      mode: "numeric",
      title: label,
      value: String(account.currentBalance),
      placeholder: t("common.currency.zeroPlaceholder"),
      inputMode: "decimal",
      showSignToggle: true,
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
      amount={getAccountDisplayBalance(account)}
      locale={formatLocale}
      meta={meta}
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
