"use client";

import { FormSection } from "@/components/forms/form-section";
import { EditableField } from "@/components/field-editor";
import { AccountPicker } from "@/components/ui/account-picker";
import { InstitutionPicker } from "@/components/ui/institution-picker";
import { Label } from "@/components/ui/label";
import {
  ScrollChipSelect,
  type ScrollChipOption,
} from "@/components/ui/scroll-chip-select";
import { Button } from "@/components/ui/button";
import type { SavingsFormValues } from "@/lib/savings/form";
import { POSTING_DAY_FORM_LAST } from "@/lib/savings/posting-schedule";
import type { Account } from "@/lib/finance/types";
import {
  formatAmountInput,
  sanitizeAmountInput,
  sanitizeDecimalInput,
} from "@/lib/format/currency";
import {
  validateAccountBalanceField,
  validateAccountNameField,
  validateCertificateRateField,
} from "@/lib/field-editor/field-validators";
import type { TranslationKey } from "@/lib/i18n";
import { useT } from "@/providers/i18n-provider";
import { Plus, Trash2 } from "lucide-react";

const POSTING_FREQUENCIES = [
  "daily",
  "monthly",
  "quarterly",
  "semi_annual",
  "annual",
] as const;

const POSTING_DAYS = Array.from({ length: 28 }, (_, index) => index + 1);

interface SavingsFormFieldsProps {
  values: SavingsFormValues;
  errors: Record<string, string>;
  amountInputLocale: string;
  transferAccounts: Account[];
  disabled?: boolean;
  mode?: "create" | "edit";
  onChange: (patch: Partial<SavingsFormValues>) => void;
  onClearError: (field: string) => void;
}

export function SavingsFormFields({
  values,
  errors,
  amountInputLocale,
  transferAccounts,
  disabled = false,
  mode = "create",
  onChange,
  onClearError,
}: SavingsFormFieldsProps) {
  const t = useT();

  const interestModelOptions: ScrollChipOption<SavingsFormValues["interestModel"]>[] =
    [
      { value: "fixed", label: t("savings.interestModel.fixed") },
      { value: "tiered", label: t("savings.interestModel.tiered") },
    ];

  const frequencyOptions: ScrollChipOption<
    SavingsFormValues["postingFrequency"]
  >[] = POSTING_FREQUENCIES.map((frequency) => ({
    value: frequency,
    label: t(`savings.postingFrequency.${frequency}` as TranslationKey),
  }));

  const destinationOptions: ScrollChipOption<
    SavingsFormValues["interestDestination"]
  >[] = [
    { value: "same_account", label: t("savings.destination.sameAccount") },
    { value: "another_account", label: t("savings.destination.anotherAccount") },
  ];

  const postingDayOptions: ScrollChipOption<string>[] = [
    ...POSTING_DAYS.map((day) => ({
      value: String(day),
      label: String(day),
    })),
    {
      value: POSTING_DAY_FORM_LAST,
      label: t("savings.fields.postingDay.lastOfMonth"),
    },
  ];

  function updateTier(
    index: number,
    patch: Partial<SavingsFormValues["tiers"][number]>,
  ) {
    onChange({
      tiers: values.tiers.map((tier, tierIndex) =>
        tierIndex === index ? { ...tier, ...patch } : tier,
      ),
    });
    onClearError("tiers");
  }

  function addTier() {
    const last = values.tiers.at(-1);
    const nextMin =
      last && last.maxBalance.trim()
        ? String(Number(last.maxBalance.replace(/,/g, "")) + 1)
        : "0";
    onChange({
      tiers: [
        ...values.tiers,
        { minBalance: nextMin, maxBalance: "", annualInterestRate: "" },
      ],
    });
  }

  function removeTier(index: number) {
    if (values.tiers.length <= 1) return;
    onChange({ tiers: values.tiers.filter((_, tierIndex) => tierIndex !== index) });
  }

  return (
    <div className="space-y-6">
      <FormSection title={t("accounts.formSections.accountDetails")}>
        <EditableField
          id="savings-name"
          label={t("accounts.fields.name.label")}
          value={values.name}
          placeholder={t("accounts.fields.name.placeholder")}
          disabled={disabled}
          error={errors.name}
          validate={(name) => validateAccountNameField(name, t)}
          onSave={(name) => {
            onChange({ name });
            onClearError("name");
          }}
        />

        <InstitutionPicker
          id="savings-institution"
          accountType="savings_account"
          value={values.institution}
          disabled={disabled}
          onChange={(institution) => onChange({ institution })}
        />

        {mode === "create" ? (
          <EditableField
            id="savings-balance"
            label={t("accounts.fields.balance.label")}
            mode="numeric"
            inputMode="decimal"
            value={values.balance}
            placeholder={t("common.currency.zeroPlaceholder")}
            disabled={disabled}
            error={errors.balance}
            hint={
              errors.balance ? undefined : t("accounts.add.balanceHint")
            }
            prefixLabel={t("common.currency.code")}
            sanitizeInput={sanitizeAmountInput}
            formatDisplay={(amount) =>
              formatAmountInput(amount, amountInputLocale)
            }
            triggerClassName="h-14 text-2xl font-semibold tabular-nums tracking-tight"
            validate={(next) => validateAccountBalanceField(next, t)}
            onSave={(balance) => {
              onChange({ balance });
              onClearError("balance");
            }}
          />
        ) : null}
      </FormSection>

      <FormSection
        title={t("savings.sections.interestModel")}
        separator
      >
        <div className="space-y-2">
          <Label>{t("savings.fields.interestModel.label")}</Label>
          <ScrollChipSelect
            value={values.interestModel}
            options={interestModelOptions}
            ariaLabel={t("savings.fields.interestModel.label")}
            onChange={(interestModel) => {
              onChange({ interestModel });
              onClearError("annualInterestRate");
              onClearError("tiers");
            }}
          />
        </div>

        {values.interestModel === "fixed" ? (
          <EditableField
            id="savings-rate"
            label={t("accounts.fields.annualRate.label")}
            mode="numeric"
            inputMode="decimal"
            value={values.annualInterestRate}
            placeholder="0"
            disabled={disabled}
            error={errors.annualInterestRate}
            suffixLabel="%"
            sanitizeInput={sanitizeAmountInput}
            formatDisplay={(rate) => formatAmountInput(rate, amountInputLocale)}
            validate={(rate) => validateCertificateRateField(rate, t)}
            onSave={(annualInterestRate) => {
              onChange({ annualInterestRate });
              onClearError("annualInterestRate");
            }}
          />
        ) : (
          <div className="space-y-3">
            <Label>{t("savings.fields.tiers.label")}</Label>
            {values.tiers.map((tier, index) => (
              <div
                key={index}
                className="space-y-2 rounded-lg border border-border p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {t("savings.fields.tiers.tierLabel", { index: index + 1 })}
                  </span>
                  {values.tiers.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      disabled={disabled}
                      aria-label={t("savings.fields.tiers.remove")}
                      onClick={() => removeTier(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : null}
                </div>
                <EditableField
                  id={`tier-min-${index}`}
                  label={t("savings.fields.tiers.minBalance")}
                  mode="numeric"
                  inputMode="decimal"
                  value={tier.minBalance}
                  disabled={disabled}
                  prefixLabel={t("common.currency.code")}
                  sanitizeInput={sanitizeDecimalInput}
                  formatDisplay={(amount) =>
                    formatAmountInput(amount, amountInputLocale)
                  }
                  onSave={(minBalance) => updateTier(index, { minBalance })}
                />
                <EditableField
                  id={`tier-max-${index}`}
                  label={t("savings.fields.tiers.maxBalance")}
                  mode="numeric"
                  inputMode="decimal"
                  value={tier.maxBalance}
                  placeholder={t("savings.fields.tiers.openEnded")}
                  disabled={disabled}
                  prefixLabel={t("common.currency.code")}
                  sanitizeInput={sanitizeDecimalInput}
                  formatDisplay={(amount) =>
                    formatAmountInput(amount, amountInputLocale)
                  }
                  onSave={(maxBalance) => updateTier(index, { maxBalance })}
                />
                <EditableField
                  id={`tier-rate-${index}`}
                  label={t("accounts.fields.annualRate.label")}
                  mode="numeric"
                  inputMode="decimal"
                  value={tier.annualInterestRate}
                  disabled={disabled}
                  suffixLabel="%"
                  sanitizeInput={sanitizeAmountInput}
                  formatDisplay={(rate) =>
                    formatAmountInput(rate, amountInputLocale)
                  }
                  onSave={(annualInterestRate) =>
                    updateTier(index, { annualInterestRate })
                  }
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full"
              disabled={disabled}
              onClick={addTier}
            >
              <Plus className="mr-2 size-4" />
              {t("savings.fields.tiers.add")}
            </Button>
            {errors.tiers ? (
              <p className="text-sm text-destructive">{errors.tiers}</p>
            ) : null}
          </div>
        )}
      </FormSection>

      <FormSection title={t("savings.sections.posting")} separator>
        <p className="text-sm text-muted-foreground">
          {t("savings.balanceMethodHint")}
        </p>

        <div className="space-y-2">
          <Label>{t("savings.fields.postingFrequency.label")}</Label>
          <ScrollChipSelect
            value={values.postingFrequency}
            options={frequencyOptions}
            ariaLabel={t("savings.fields.postingFrequency.label")}
            onChange={(postingFrequency) => onChange({ postingFrequency })}
          />
        </div>

        {values.postingFrequency !== "daily" ? (
          <div className="space-y-2">
            <Label>{t("savings.fields.postingDay.label")}</Label>
            <ScrollChipSelect
              value={values.postingDay}
              options={postingDayOptions}
              ariaLabel={t("savings.fields.postingDay.label")}
              onChange={(postingDay) => {
                onChange({ postingDay });
                onClearError("postingDay");
              }}
            />
            {errors.postingDay ? (
              <p className="text-sm text-destructive">{errors.postingDay}</p>
            ) : null}
          </div>
        ) : null}
      </FormSection>

      <FormSection title={t("savings.sections.destination")} separator>
        <div className="space-y-2">
          <Label>{t("savings.fields.destination.label")}</Label>
          <ScrollChipSelect
            value={values.interestDestination}
            options={destinationOptions}
            ariaLabel={t("savings.fields.destination.label")}
            onChange={(interestDestination) => {
              onChange({
                interestDestination,
                destinationAccountId:
                  interestDestination === "same_account"
                    ? ""
                    : values.destinationAccountId,
              });
              onClearError("destinationAccountId");
            }}
          />
        </div>

        {values.interestDestination === "another_account" ? (
          <>
            <AccountPicker
              id="savings-destination"
              label={t("accounts.fields.destinationAccount.label")}
              placeholder={t("accounts.fields.destinationAccount.placeholder")}
              value={values.destinationAccountId || null}
              accounts={transferAccounts}
              disabled={disabled}
              onChange={(destinationAccountId) => {
                onChange({ destinationAccountId: destinationAccountId ?? "" });
                onClearError("destinationAccountId");
              }}
            />
            {errors.destinationAccountId ? (
              <p className="text-sm text-destructive">
                {errors.destinationAccountId}
              </p>
            ) : null}
          </>
        ) : null}
      </FormSection>
    </div>
  );
}
