"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { StickyFooter } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { DiscardDialog } from "@/components/ui/discard-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAccountTypeLabelKey } from "@/lib/finance/account-labels";
import {
  ENABLED_ADD_ACCOUNT_TYPES,
  type MoneyAccountType,
} from "@/lib/finance/types";
import { parseAmount } from "@/lib/format/currency";
import { useFinance } from "@/lib/finance/store";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/errors";
import { useT } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";
import { cn } from "@/lib/utils";

export function AddAccountScreen() {
  const t = useT();
  const router = useRouter();
  const { accounts, createAccount } = useFinance();
  const { showToast } = useToast();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const isFirstAccount = accounts.length === 0;

  const [accountType, setAccountType] =
    useState<MoneyAccountType>("current_account");
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDiscard, setShowDiscard] = useState(false);

  const isDirty = name.trim().length > 0 || balance.trim().length > 0;

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) {
      nextErrors.name = t("accounts.validation.nameRequired");
    }
    const parsedBalance = parseAmount(balance);
    if (parsedBalance === null) {
      nextErrors.balance = t("accounts.validation.balanceRequired");
    } else if (parsedBalance < 0) {
      nextErrors.balance = t("accounts.validation.balanceNegative");
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    const parsedBalance = parseAmount(balance);
    if (parsedBalance === null) return;

    setSubmitting(true);
    try {
      const account = await createAccount({
        type: isFirstAccount ? "current_account" : accountType,
        name,
        currentBalance: parsedBalance,
      });
      showToast(t("common.accountCreated"));
      router.replace(`/accounts/${account.id}`);
    } catch (error) {
      logSupabaseError("createAccount", error);
      setErrors({
        form: getSupabaseErrorMessage(error) || t("common.retry"),
      });
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

  return (
    <>
      <ScreenHeader
        mode="stack"
        title={
          isFirstAccount
            ? t("accounts.add.firstAccount.title")
            : t("accounts.add.title")
        }
        onBack={handleBack}
      />
      <ScreenBody withTabBar={false} withStickyFooter>
        <div className="space-y-6 pt-2">
          <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
            {isFirstAccount
              ? t("accounts.add.firstAccount.lead")
              : t("accounts.add.lead")}
          </p>

          {!isFirstAccount ? (
            <div className="space-y-2">
              <Label>{t("accounts.add.chooseType")}</Label>
              <div className="flex gap-2">
                {ENABLED_ADD_ACCOUNT_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAccountType(type)}
                    className={cn(
                      "inline-flex min-h-11 flex-1 items-center justify-center rounded-md border px-2 py-2 text-xs font-medium transition-colors",
                      accountType === type
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background text-foreground",
                    )}
                  >
                    {t(getAccountTypeLabelKey(type))}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="account-name">
                {t("accounts.fields.name.label")}
              </Label>
              <Input
                ref={nameInputRef}
                id="account-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("accounts.fields.name.placeholder")}
                aria-invalid={Boolean(errors.name)}
                autoComplete="off"
              />
              {errors.name ? (
                <p className="text-sm text-destructive">{errors.name}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="balance">
                {t("accounts.fields.balance.label")}
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-base font-medium text-muted-foreground">
                  EGP
                </span>
                <Input
                  id="balance"
                  inputMode="decimal"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="0"
                  className="h-14 ps-16 text-2xl font-semibold tabular-nums tracking-tight"
                  aria-invalid={Boolean(errors.balance)}
                />
              </div>
              {errors.balance ? (
                <p className="text-sm text-destructive">{errors.balance}</p>
              ) : (
                <p className="text-[0.8125rem] text-muted-foreground">
                  {t("accounts.add.balanceHint")}
                </p>
              )}
            </div>
          </div>
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
          {submitting
            ? t("accounts.creating")
            : isFirstAccount
              ? t("accounts.add.firstAccount.cta")
              : t("accounts.createAccount")}
        </Button>
      </StickyFooter>

      <DiscardDialog
        open={showDiscard}
        onConfirm={() => {
          setShowDiscard(false);
          router.back();
        }}
        onCancel={() => setShowDiscard(false)}
      />
    </>
  );
}
