"use client";

import { useState } from "react";

import { EditableField } from "@/components/field-editor";
import { ImmersiveBottomSheet } from "@/components/ui/immersive-bottom-sheet";
import { DateField } from "@/components/ui/date-field";
import { Label } from "@/components/ui/label";
import { validateRecordAmountField } from "@/lib/finance/record-form";
import {
  formatAmountInput,
  parseAmount,
  sanitizeAmountInput,
} from "@/lib/format/currency";
import { todayIsoDate } from "@/lib/format/date";
import { getAmountInputLocale } from "@/lib/i18n/locale";
import { useT, useLocale } from "@/providers/i18n-provider";

interface CreditCardPurchaseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: {
    amount: number;
    description: string | null;
    date: string;
  }) => Promise<void>;
}

export function CreditCardPurchaseSheet({
  open,
  onOpenChange,
  onSubmit,
}: CreditCardPurchaseSheetProps) {
  const t = useT();
  const locale = useLocale();
  const amountInputLocale = getAmountInputLocale(locale);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayIsoDate());
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  function reset() {
    setAmount("");
    setDescription("");
    setDate(todayIsoDate());
    setErrors({});
    setSubmitting(false);
  }

  function dismiss() {
    reset();
    onOpenChange(false);
  }

  async function handleSubmit() {
    const nextErrors: Record<string, string> = {};
    const amountError = validateRecordAmountField("expense", amount, t);
    if (amountError) nextErrors.amount = amountError;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const parsedAmount = parseAmount(amount);
    if (parsedAmount === null) return;

    setSubmitting(true);
    try {
      await onSubmit({
        amount: parsedAmount,
        description: description.trim() || null,
        date,
      });
      dismiss();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ImmersiveBottomSheet
      title={t("creditCards.purchase.title")}
      onDismiss={dismiss}
      onConfirm={() => void handleSubmit()}
      confirmDisabled={submitting}
      confirmLabel={
        submitting ? t("creditCards.purchase.saving") : t("creditCards.purchase.submit")
      }
      bodyClassName="overflow-y-auto px-4 py-4"
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t("creditCards.purchase.description")}
        </p>

        <EditableField
          id="cc-purchase-amount"
          label={t("records.fields.amount")}
          mode="numeric"
          inputMode="decimal"
          value={amount}
          placeholder={t("common.currency.zeroPlaceholder")}
          error={errors.amount}
          prefixLabel={t("common.currency.code")}
          sanitizeInput={sanitizeAmountInput}
          formatDisplay={(value) => formatAmountInput(value, amountInputLocale)}
          validate={(next) => validateRecordAmountField("expense", next, t)}
          onSave={setAmount}
        />

        <EditableField
          id="cc-purchase-description"
          label={t("records.fields.description.label")}
          value={description}
          placeholder={t("creditCards.purchase.descriptionPlaceholder")}
          onSave={setDescription}
        />

        <div className="space-y-2">
          <Label htmlFor="cc-purchase-date">{t("records.fields.date")}</Label>
          <DateField
            id="cc-purchase-date"
            value={date}
            label={t("records.fields.date")}
            onChange={setDate}
          />
        </div>
      </div>
    </ImmersiveBottomSheet>
  );
}
