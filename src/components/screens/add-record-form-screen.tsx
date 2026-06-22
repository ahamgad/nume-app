"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { RecordFormFields } from "@/components/records/record-form-fields";
import { StackPageHeader, StackPageTitle } from "@/components/layout/stack-page-chrome";
import { ScreenBody } from "@/components/layout/screen-header";
import { StickyFooter } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { useNavigationGuard } from "@/hooks/use-dirty-form-navigation";
import { parseAmount } from "@/lib/format/currency";
import { todayIsoDate } from "@/lib/format/date";
import { canSendTransfers } from "@/lib/finance/account-capabilities";
import { useFinance } from "@/lib/finance/store";
import {
  validateRecordForm,
  type RecordFormValues,
} from "@/lib/finance/record-form";
import type { RecordType } from "@/lib/finance/types";
import type { TranslationKey } from "@/lib/i18n";
import { getAmountInputLocale } from "@/lib/i18n/locale";
import { useT, useLocale } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";

interface AddRecordFormScreenProps {
  accountId: string;
  type: RecordType;
}

export function AddRecordFormScreen({ accountId, type }: AddRecordFormScreenProps) {
  const t = useT();
  const locale = useLocale();
  const amountInputLocale = getAmountInputLocale(locale);
  const router = useRouter();
  const { accounts, getAccount, createRecord, createTransfer } = useFinance();
  const { showToast } = useToast();

  const account = getAccount(accountId);

  const fixedSourceAccountId =
    type === "transfer" && account && canSendTransfers(account) ? accountId : null;

  const [values, setValues] = useState<RecordFormValues>(() => ({
    amount: "",
    description: "",
    date: todayIsoDate(),
    fromAccountId: type === "transfer" ? accountId : null,
    toAccountId: null,
  }));
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isDirty =
    values.amount.trim().length > 0 ||
    values.description.trim().length > 0 ||
    values.date !== todayIsoDate() ||
    (type === "transfer" &&
      (values.fromAccountId !== accountId || values.toAccountId !== null));

  const fromAccount = useMemo(() => {
    const id = fixedSourceAccountId ?? values.fromAccountId;
    return id ? accounts.find((item) => item.id === id) : undefined;
  }, [accounts, fixedSourceAccountId, values.fromAccountId]);

  const parsedAmount = parseAmount(values.amount);
  const showInsufficientTransferBalance =
    type === "transfer" &&
    fromAccount &&
    parsedAmount !== null &&
    parsedAmount > fromAccount.currentBalance;

  function clearFieldError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit() {
    const nextErrors = validateRecordForm(type, values, t, {
      currentBalance: account?.currentBalance,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const amount = parseAmount(values.amount);
    if (amount === null) return;

    setSubmitting(true);
    try {
      if (type === "transfer") {
        const fromAccountId = fixedSourceAccountId ?? values.fromAccountId;
        if (!fromAccountId || !values.toAccountId) return;
        await createTransfer({
          fromAccountId,
          toAccountId: values.toAccountId,
          amount,
          description: values.description.trim() || null,
          date: values.date,
        });
        showToast(t("common.transferRecorded"));
        router.replace(`/accounts/${accountId}`);
        return;
      }

      if (!account) return;
      await createRecord({
        accountId,
        type,
        amount,
        description: values.description.trim() || null,
        date: values.date,
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

  const { handleBack } = useNavigationGuard(isDirty);

  const titleKey: TranslationKey =
    type === "adjustment"
      ? "records.add.adjustment.title"
      : type === "interest"
        ? "records.types.interest"
        : (`records.add.${type}.title` as TranslationKey);

  const canSubmit =
    type === "transfer"
      ? Boolean((fixedSourceAccountId ?? values.fromAccountId) && values.toAccountId)
      : Boolean(account);

  return (
    <>
      <StackPageHeader title={t(titleKey)} onBack={handleBack} />
      <ScreenBody withTabBar={false} withStickyFooter className="space-y-5">
        <StackPageTitle>{t(titleKey)}</StackPageTitle>
        {account ? (
          <p className="text-[0.8125rem] text-muted-foreground">
            {account.name}
          </p>
        ) : null}

        <RecordFormFields
          type={type}
          values={values}
          errors={errors}
          amountInputLocale={amountInputLocale}
          disabled={submitting}
          account={account}
          accounts={accounts}
          fixedSourceAccountId={fixedSourceAccountId}
          onChange={(patch) => setValues((current) => ({ ...current, ...patch }))}
          onClearError={clearFieldError}
        />

        {showInsufficientTransferBalance ? (
          <p className="text-sm text-muted-foreground">
            {t("records.insufficientBalance")}
          </p>
        ) : null}

        {errors.form ? (
          <p className="text-sm text-destructive">{errors.form}</p>
        ) : null}
      </ScreenBody>

      <StickyFooter>
        <Button
          className="h-12 w-full"
          disabled={submitting || !canSubmit}
          onClick={handleSubmit}
        >
          {submitting ? t("records.add.saving") : t("records.add.save")}
        </Button>
      </StickyFooter>
    </>
  );
}
