"use client";

import { useMemo } from "react";

import { EditableField } from "@/components/field-editor";
import { AccountPicker } from "@/components/ui/account-picker";
import { DateField } from "@/components/ui/date-field";
import { Label } from "@/components/ui/label";
import { filterTransferAccounts } from "@/lib/finance/account-capabilities";
import { filterInterestDestinationAccounts } from "@/lib/finance/interest-destination-accounts";
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
  /** When set, the source account is fixed (account-details transfer flow). */
  fixedSourceAccountId?: string | null;
  onChange: (patch: Partial<RecordFormValues>) => void;
  onClearError: (field: string) => void;
}

function RecordDateField({
  value,
  error,
  disabled,
  formatLocale,
  onChange,
}: {
  value: string;
  error?: string;
  disabled?: boolean;
  formatLocale: string;
  onChange: (date: string) => void;
}) {
  const t = useT();

  return (
    <div className="min-w-0 w-full max-w-full space-y-2">
      <Label htmlFor="record-date">{t("records.fields.date")}</Label>
      <DateField
        id="record-date"
        value={value}
        locale={formatLocale}
        label={t("records.fields.date")}
        disabled={disabled}
        onChange={onChange}
        aria-invalid={Boolean(error)}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function RecordFormFields({
  type,
  values,
  errors,
  amountInputLocale,
  disabled = false,
  account,
  accounts,
  fixedSourceAccountId = null,
  onChange,
  onClearError,
}: RecordFormFieldsProps) {
  const t = useT();
  const formatLocale = useFormatLocale();
  const parsedAmount = parseAmount(values.amount);

  const sourceAccountId = fixedSourceAccountId ?? values.fromAccountId;

  const fromAccounts = useMemo(
    () =>
      filterTransferAccounts(accounts, {
        excludeAccountIds: values.toAccountId ? [values.toAccountId] : [],
      }),
    [accounts, values.toAccountId],
  );

  const toAccounts = useMemo(
    () =>
      filterInterestDestinationAccounts(accounts, {
        excludeAccountIds: sourceAccountId ? [sourceAccountId] : [],
      }),
    [accounts, sourceAccountId],
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

      <RecordDateField
        value={values.date}
        error={errors.date}
        disabled={disabled}
        formatLocale={formatLocale}
        onChange={(date) => {
          onChange({ date });
          onClearError("date");
        }}
      />

      {type === "transfer" ? (
        <>
          {!fixedSourceAccountId ? (
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
                <p className="-mt-3 text-sm text-destructive">
                  {errors.fromAccountId}
                </p>
              ) : null}
            </>
          ) : null}

          <AccountPicker
            id="transfer-to-account"
            label={t("records.fields.transfer.toAccount")}
            placeholder={t(
              "accounts.fields.interestDestinationAccount.placeholder",
            )}
            searchPlaceholder={t(
              "accounts.fields.interestDestinationAccount.searchPlaceholder",
            )}
            noResultsMessage={t(
              "accounts.fields.interestDestinationAccount.noResults",
            )}
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
