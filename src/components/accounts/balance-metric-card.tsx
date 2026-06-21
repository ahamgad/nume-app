"use client";

import { Pencil } from "lucide-react";

import { MetricHero, WidgetCard } from "@/components/patterns";
import { IconButton } from "@/components/ui/icon-button";
import { validateAccountBalanceField } from "@/lib/field-editor/field-validators";
import { supportsQuickBalanceEdit } from "@/lib/finance/account-form";
import { getBalanceToneClassName } from "@/lib/finance/balance-display";
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
      value: sanitizeAmountInput(String(account.currentBalance)),
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
    <WidgetCard>
      <MetricHero
        label={label}
        amount={account.currentBalance}
        locale={formatLocale}
        meta={meta}
        amountClassName={getBalanceToneClassName(account)}
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
    </WidgetCard>
  );
}
