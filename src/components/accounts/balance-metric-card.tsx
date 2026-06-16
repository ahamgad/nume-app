"use client";

import { Pencil } from "lucide-react";

import { MetricHero, WidgetCard } from "@/components/patterns";
import { validateAccountBalanceField } from "@/lib/field-editor/field-validators";
import { supportsQuickBalanceEdit } from "@/lib/finance/account-form";
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
        amountAction={
          canEdit ? (
            <button
              type="button"
              onClick={handleEditBalance}
              className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={label}
            >
              <Pencil className="size-4" />
            </button>
          ) : undefined
        }
      />
    </WidgetCard>
  );
}
