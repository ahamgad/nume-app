"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { StickyFooter } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { DiscardDialog } from "@/components/ui/discard-dialog";
import { DateField } from "@/components/ui/date-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSwipeBackDiscard } from "@/hooks/use-swipe-back-discard";
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
  const amountInputRef = useRef<HTMLInputElement>(null);

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

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const sanitized = sanitizeAmountInput(e.target.value);
    setAmount(sanitized);
    clearFieldError("amount");
    requestAnimationFrame(() => {
      const input = amountInputRef.current;
      if (!input) return;
      const displayLength = formatAmountInput(sanitized, amountInputLocale).length;
      input.setSelectionRange(displayLength, displayLength);
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

  const { confirmDiscardNavigation } = useSwipeBackDiscard({
    isDirty,
    onRequestDiscard: () => setShowDiscard(true),
  });

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

  return (
    <>
      <ScreenHeader mode="stack" title={t(titleKey)} onBack={handleBack} />
      <ScreenBody withTabBar={false} withStickyFooter className="space-y-5">
        {account ? (
          <p className="text-[0.8125rem] text-muted-foreground">
            {account.name}
          </p>
        ) : null}

        <div className="min-w-0 w-full max-w-full space-y-2">
          <Label htmlFor="record-amount">
            {type === "adjustment"
              ? t("records.fields.correctBalance")
              : t("records.fields.amount")}
          </Label>
          <div className="relative min-w-0">
            <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-sm text-muted-foreground">
              {t("common.currency.code")}
            </span>
            <Input
              ref={amountInputRef}
              id="record-amount"
              inputMode="decimal"
              value={formatAmountInput(amount, amountInputLocale)}
              onChange={handleAmountChange}
              className="w-full min-w-0 ps-14 tabular-nums"
              aria-invalid={Boolean(errors.amount)}
            />
          </div>
          {errors.amount ? (
            <p className="text-sm text-destructive">{errors.amount}</p>
          ) : null}
          {showInsufficientBalance ? (
            <p className="text-sm text-muted-foreground">
              {t("records.insufficientBalance")}
            </p>
          ) : null}
        </div>

        {type !== "adjustment" ? (
          <div className="min-w-0 w-full max-w-full space-y-2">
            <Label htmlFor="description">
              {t("records.fields.description.label")}{" "}
              <span className="text-muted-foreground">({t("common.optional")})</span>
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t(`records.fields.description.placeholder.${type}`)}
            />
          </div>
        ) : (
          <div className="min-w-0 w-full max-w-full space-y-2">
            <Label htmlFor="reason">
              {t("records.fields.reason.label")}{" "}
              <span className="text-muted-foreground">({t("common.optional")})</span>
            </Label>
            <Input
              id="reason"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("records.fields.reason.placeholder")}
            />
          </div>
        )}

        <div className="min-w-0 w-full max-w-full space-y-2">
          <Label htmlFor="record-date">{t("records.fields.date")}</Label>
          <DateField
            id="record-date"
            value={date}
            locale={formatLocale}
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
