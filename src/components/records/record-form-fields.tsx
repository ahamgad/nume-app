"use client";

import { useMemo } from "react";

import { EditableField } from "@/components/field-editor";
import { AccountPicker } from "@/components/ui/account-picker";
import { DateField } from "@/components/ui/date-field";
import {
  filterTransferAccounts,
} from "@/lib/finance/account-capabilities";
import type { RecordFormValues } from "@/lib/finance/record-form";
import { validateRecordAmountField } from "@/lib/finance/record-form";
import type { Account, RecordType } from "@/lib/finance/types";
import {
  formatAmountInput,
  formatCurrency,
  parseAmount,
  sanitizeAmountInput,
} from "@/lib/format/currency";
import { useT, useFormatLocale } from "@/providers/i18n-provider";

interface RecordFormFieldsProps {
  type: RecordType;
  values: RecordFormValues;
  errors: Record<string, string>;
  amountInputLocale: string;
  disabled?: boolean;
  account?: Account;
  accounts: Account[];
  onChange: (patch: Partial<RecordFormValues>) => void;
  onClearError: (field: string) => void;
}

export function RecordFormFields({
  type,
  values,
  errors,
  amountInputLocale,
  disabled = false,
  account,
  accounts,
  onChange,
  onClearError,
}: RecordFormFieldsProps) {
  const t = useT();
  const formatLocale = useFormatLocale();
  const parsedAmount = parseAmount(values.amount);

  const transferAccounts = useMemo(
    () => filterTransferAccounts(accounts),
    [accounts],
  );

  const fromAccounts = useMemo(
    () =>
      filterTransferAccounts(accounts, {
        excludeAccountIds: values.toAccountId ? [values.toAccountId] : [],
      }),
    [accounts, values.toAccountId],
  );

  const toAccounts = useMemo(
    () =>
      filterTransferAccounts(accounts, {
        excludeAccountIds: values.fromAccountId ? [values.fromAccountId] : [],
      }),
    [accounts, values.fromAccountId],
  );

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
    if (type === "expense") {
      return { next: account.currentBalance - parsedAmount };
    }
    return null;
  }, [account, parsedAmount, type]);

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
    type === "income"
      ? t("records.fields.description.placeholder.income")
      : type === "expense"
        ? t("records.fields.description.placeholder.expense")
        : type === "transfer"
          ? t("records.fields.description.placeholder.transfer")
          : t("records.fields.reason.placeholder");

  return (
    <>
      <EditableField
        id="record-amount"
        label={amountLabel}
        mode="numeric"
        inputMode="decimal"
        value={values.amount}
        disabled={disabled}
        error={errors.amount}
        prefixLabel={t("common.currency.code")}
        sanitizeInput={sanitizeAmountInput}
        formatDisplay={(value) => formatAmountInput(value, amountInputLocale)}
        triggerClassName="tabular-nums"
        validate={(value) =>
          validateRecordAmountField(type, value, t, account?.currentBalance)
        }
        onSave={(amount) => {
          onChange({ amount });
          onClearError("amount");
        }}
      />

      {showInsufficientBalance ? (
        <p className="-mt-3 text-sm text-muted-foreground">
          {t("records.insufficientBalance")}
        </p>
      ) : null}

      {type === "transfer" ? (
        <>
          <AccountPicker
            id="transfer-from-account"
            label={t("records.fields.transfer.fromAccount")}
            placeholder={t("records.fields.transfer.fromPlaceholder")}
            value={values.fromAccountId}
            accounts={fromAccounts}
            disabled={disabled}
            onChange={(fromAccountId) => {
              onChange({ fromAccountId });
              onClearError("fromAccountId");
            }}
          />
          {errors.fromAccountId ? (
            <p className="-mt-3 text-sm text-destructive">{errors.fromAccountId}</p>
          ) : null}

          <AccountPicker
            id="transfer-to-account"
            label={t("records.fields.transfer.toAccount")}
            placeholder={t("records.fields.transfer.toPlaceholder")}
            value={values.toAccountId}
            accounts={toAccounts}
            disabled={disabled}
            onChange={(toAccountId) => {
              onChange({ toAccountId });
              onClearError("toAccountId");
            }}
          />
          {errors.toAccountId ? (
            <p className="-mt-3 text-sm text-destructive">{errors.toAccountId}</p>
          ) : null}
        </>
      ) : null}

      <EditableField
        id={type !== "adjustment" ? "description" : "reason"}
        label={`${descriptionLabel} (${t("common.optional")})`}
        value={values.description}
        placeholder={descriptionPlaceholder}
        disabled={disabled}
        onSave={(description) => onChange({ description })}
      />

      <div className="min-w-0 w-full max-w-full space-y-2">
        <DateField
          id="record-date"
          value={values.date}
          locale={formatLocale}
          label={t("records.fields.date")}
          onChange={(date) => {
            onChange({ date });
            onClearError("date");
          }}
          aria-invalid={Boolean(errors.date)}
        />
        {errors.date ? (
          <p className="text-sm text-destructive">{errors.date}</p>
        ) : null}
      </div>

      {preview && parsedAmount !== null && type !== "transfer" ? (
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
    </>
  );
}
