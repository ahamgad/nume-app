"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { EditableField } from "@/components/field-editor";
import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { StickyFooter } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { DiscardDialog } from "@/components/ui/discard-dialog";
import { DateField } from "@/components/ui/date-field";
import { useDirtyFormNavigation } from "@/hooks/use-dirty-form-navigation";
import {
  formatAmountInput,
  formatCurrency,
  parseAmount,
  sanitizeAmountInput,
} from "@/lib/format/currency";
import { isFutureDate, todayIsoDate } from "@/lib/format/date";
import { useFinance } from "@/lib/finance/store";
import type { RecordType } from "@/lib/finance/types";
import { getAmountInputLocale } from "@/lib/i18n/locale";
import { useT, useLocale, useFormatLocale } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";

interface AddRecordFormScreenProps {
  accountId: string;
  type: RecordType;
}

export function AddRecordFormScreen({ accountId, type }: AddRecordFormScreenProps) {
  const t = useT();
  const locale = useLocale();
  const formatLocale = useFormatLocale();
  const amountInputLocale = getAmountInputLocale(locale);
  const router = useRouter();
  const { getAccount, createRecord } = useFinance();
  const { showToast } = useToast();

  const account = getAccount(accountId);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayIsoDate());
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDiscard, setShowDiscard] = useState(false);

  const parsedAmount = parseAmount(amount);

  const preview = useMemo(() => {
    if (!account || parsedAmount === null) return null;
    if (type === "adjustment") {
      const delta = parsedAmount - account.currentBalance;
      return {
        current: account.currentBalance,
        delta,
        next: parsedAmount,
      };
    }
    if (type === "income") {
      return { next: account.currentBalance + parsedAmount };
    }
    return { next: account.currentBalance - parsedAmount };
  }, [account, parsedAmount, type]);

  const isDirty =
    amount.trim().length > 0 ||
    description.trim().length > 0 ||
    date !== todayIsoDate();

  function clearFieldError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validate() {
    const nextErrors: Record<string, string> = {};
    const value = parseAmount(amount);

    if (value === null) {
      nextErrors.amount =
        type === "adjustment"
          ? t("records.validation.correctBalanceRequired")
          : t("records.validation.amountRequired");
    } else if (value <= 0 && type !== "adjustment") {
      nextErrors.amount = t("records.validation.amountZero");
    } else if (
      type === "adjustment" &&
      account &&
      value === account.currentBalance
    ) {
      nextErrors.amount = t("records.adjustmentNoChange");
    }

    if (!date) {
      nextErrors.date = t("records.validation.dateRequired");
    } else if (isFutureDate(date)) {
      nextErrors.date = t("records.validation.dateFuture");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!account || !validate()) return;
    const value = parseAmount(amount);
    if (value === null) return;

    setSubmitting(true);
    try {
      await createRecord({
        accountId,
        type,
        amount: value,
        description: description.trim() || null,
        date,
      });

      if (type === "income") showToast(t("common.incomeRecorded"));
      else if (type === "expense") showToast(t("common.expenseRecorded"));
      else showToast(t("common.adjustmentRecorded"));

      router.replace(`/accounts/${accountId}`);
    } catch {
      setErrors({ form: t("common.retry") });
    } finally {
      setSubmitting(false);
    }
  }

  function handleBack() {
    if (isDirty) {
      setShowDiscard(true);
      return;
    }
    router.back();
  }

  const { confirmDiscardNavigation } = useDirtyFormNavigation();

  function handleDiscardConfirm() {
    setShowDiscard(false);
    confirmDiscardNavigation(() => router.back());
  }

  const titleKey =
    type === "adjustment"
      ? "records.add.adjustment.title"
      : (`records.add.${type}.title` as const);

  const showInsufficientBalance =
    type === "expense" &&
    account &&
    parsedAmount !== null &&
    parsedAmount > account.currentBalance;

  const amountLabel =
    type === "adjustment"
      ? t("records.fields.correctBalance")
      : t("records.fields.amount");

  const descriptionLabel =
    type !== "adjustment"
      ? t("records.fields.description.label")
      : t("records.fields.reason.label");

  const descriptionPlaceholder =
    type !== "adjustment"
      ? t(`records.fields.description.placeholder.${type}`)
      : t("records.fields.reason.placeholder");

  function validateRecordAmount(value: string): string | undefined {
    const parsed = parseAmount(value);
    if (parsed === null) {
      return type === "adjustment"
        ? t("records.validation.correctBalanceRequired")
        : t("records.validation.amountRequired");
    }
    if (parsed <= 0 && type !== "adjustment") {
      return t("records.validation.amountZero");
    }
    if (
      type === "adjustment" &&
      account &&
      parsed === account.currentBalance
    ) {
      return t("records.adjustmentNoChange");
    }
  }

  return (
    <>
      <ScreenHeader mode="stack" title={t(titleKey)} onBack={handleBack} />
      <ScreenBody withTabBar={false} withStickyFooter className="space-y-5">
        {account ? (
          <p className="text-[0.8125rem] text-muted-foreground">
            {account.name}
          </p>
        ) : null}

        <EditableField
          id="record-amount"
          label={amountLabel}
          mode="numeric"
          inputMode="decimal"
          value={amount}
          disabled={submitting}
          error={errors.amount}
          prefixLabel={t("common.currency.code")}
          sanitizeInput={sanitizeAmountInput}
          formatDisplay={(value) => formatAmountInput(value, amountInputLocale)}
          triggerClassName="tabular-nums"
          validate={validateRecordAmount}
          onSave={(nextAmount) => {
            setAmount(nextAmount);
            clearFieldError("amount");
          }}
        />
        {showInsufficientBalance ? (
          <p className="-mt-3 text-sm text-muted-foreground">
            {t("records.insufficientBalance")}
          </p>
        ) : null}

        <EditableField
          id={type !== "adjustment" ? "description" : "reason"}
          label={`${descriptionLabel} (${t("common.optional")})`}
          value={description}
          placeholder={descriptionPlaceholder}
          disabled={submitting}
          onSave={setDescription}
        />

        <div className="min-w-0 w-full max-w-full space-y-2">
          <DateField
            id="record-date"
            value={date}
            locale={formatLocale}
            label={t("records.fields.date")}
            onChange={(nextDate) => {
              setDate(nextDate);
              clearFieldError("date");
            }}
            aria-invalid={Boolean(errors.date)}
          />
          {errors.date ? (
            <p className="text-sm text-destructive">{errors.date}</p>
          ) : null}
        </div>

        {preview && parsedAmount !== null ? (
          <div className="space-y-1">
            {type === "adjustment" && preview.current !== undefined ? (
              <>
                <div className="flex items-baseline justify-between gap-3 text-[0.8125rem] text-muted-foreground">
                  <span>{t("records.preview.currentBalance")}</span>
                  <span className="shrink-0 tabular-nums">
                    {formatCurrency(preview.current, formatLocale)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-3 text-[0.8125rem] text-muted-foreground">
                  <span>{t("records.preview.adjustment")}</span>
                  <span className="shrink-0 tabular-nums">
                    {formatCurrency("delta" in preview ? preview.delta : 0, formatLocale)}
                  </span>
                </div>
              </>
            ) : null}
            <div className="flex items-baseline justify-between gap-3 text-[0.9375rem] font-medium text-foreground">
              <span>{t("records.preview.newBalance")}</span>
              <span className="shrink-0 tabular-nums">
                {formatCurrency(preview.next, formatLocale)}
              </span>
            </div>
          </div>
        ) : null}
      </ScreenBody>

      <StickyFooter>
        <Button
          className="h-12 w-full"
          disabled={submitting || !account}
          onClick={handleSubmit}
        >
          {submitting ? t("records.add.saving") : t("records.add.save")}
        </Button>
      </StickyFooter>

      <DiscardDialog
        open={showDiscard}
        onConfirm={handleDiscardConfirm}
        onCancel={() => setShowDiscard(false)}
      />
    </>
  );
}
