"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { EditableField } from "@/components/field-editor";
import { StickyFooter } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { DiscardDialog } from "@/components/ui/discard-dialog";
import { InstitutionPicker } from "@/components/ui/institution-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { useDirtyFormNavigation } from "@/hooks/use-dirty-form-navigation";
import {
  isMoneyAccountFormDirty,
  moneyAccountFormValuesFromAccount,
  validateMoneyAccountForm,
  type MoneyAccountFormValues,
} from "@/lib/finance/account-form";
import {
  shouldShowInstitutionPicker,
  type InstitutionPickerContext,
} from "@/lib/institutions/catalog";
import { validateAccountNameField } from "@/lib/field-editor/field-validators";
import { useFinance } from "@/lib/finance/store";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/errors";
import { useT } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";

interface EditAccountScreenProps {
  accountId: string;
}

function EditAccountForm({
  accountId,
  accountType,
  initialValues,
}: {
  accountId: string;
  accountType: "current_account" | "wallet" | "cash";
  initialValues: MoneyAccountFormValues;
}) {
  const t = useT();
  const router = useRouter();
  const { showToast } = useToast();
  const { updateAccount } = useFinance();

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);

  const isDirty = isMoneyAccountFormDirty(values, initialValues);
  const showInstitution = shouldShowInstitutionPicker(accountType);

  const { confirmDiscardNavigation } = useDirtyFormNavigation();

  function clearFieldError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit() {
    const nextErrors = validateMoneyAccountForm(values, accountType, t);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await updateAccount(accountId, {
        name: values.name.trim(),
        institution:
          accountType === "cash" ? null : values.institution.trim() || null,
      });
      showToast(t("accounts.edit.success"));
      router.replace(`/accounts/${accountId}`);
    } catch (error) {
      logSupabaseError("updateAccount", error);
      setErrors({
        form: getSupabaseErrorMessage(error) || t("common.retry"),
      });
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

  function handleDiscardConfirm() {
    setShowDiscard(false);
    confirmDiscardNavigation(() => router.back());
  }

  return (
    <>
      <ScreenHeader
        mode="stack"
        title={t("accounts.edit.title")}
        onBack={handleBack}
      />
      <ScreenBody withTabBar={false} withStickyFooter>
        <div className="space-y-5 pt-2">
          <EditableField
            id="edit-account-name"
            label={t("accounts.fields.name.label")}
            value={values.name}
            placeholder={t("accounts.fields.name.placeholder")}
            disabled={submitting}
            error={errors.name}
            validate={(name) => validateAccountNameField(name, t)}
            onSave={(name) => {
              setValues((current) => ({ ...current, name }));
              clearFieldError("name");
            }}
          />

          {showInstitution ? (
            <InstitutionPicker
              id="edit-account-institution"
              accountType={accountType as InstitutionPickerContext}
              value={values.institution}
              disabled={submitting}
              onChange={(institution) => {
                setValues((current) => ({ ...current, institution }));
                clearFieldError("institution");
              }}
            />
          ) : null}

          {errors.institution ? (
            <p className="text-sm text-destructive">{errors.institution}</p>
          ) : null}
          {errors.form ? (
            <p className="text-sm text-destructive">{errors.form}</p>
          ) : null}
        </div>
      </ScreenBody>

      <StickyFooter>
        <Button
          className="h-12 w-full text-base"
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? t("accounts.edit.saving") : t("accounts.edit.submit")}
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

export function EditAccountScreen({ accountId }: EditAccountScreenProps) {
  const t = useT();
  const router = useRouter();
  const { getAccount, isFinanceReady } = useFinance();

  const account = getAccount(accountId);

  const initialValues = useMemo(() => {
    if (!account) return null;
    return moneyAccountFormValuesFromAccount(account);
  }, [account]);

  if (!isFinanceReady) {
    return (
      <>
        <ScreenHeader mode="stack" title={t("common.loading")} />
        <ScreenBody withTabBar={false}>
          <Skeleton className="h-40 w-full rounded-lg" />
        </ScreenBody>
      </>
    );
  }

  if (
    !account ||
    !initialValues ||
    (account.type !== "current_account" &&
      account.type !== "wallet" &&
      account.type !== "cash")
  ) {
    return (
      <>
        <ScreenHeader
          mode="stack"
          title={t("accounts.details.notFound")}
          onBack={() => router.push("/accounts")}
        />
        <ScreenBody withTabBar={false}>
          <p className="text-muted-foreground">
            {t("accounts.details.notFoundDescription")}
          </p>
        </ScreenBody>
      </>
    );
  }

  return (
    <EditAccountForm
      key={account.id}
      accountId={accountId}
      accountType={account.type}
      initialValues={initialValues}
    />
  );
}
