"use client";

import { Fragment } from "react";

import {
  AccountFormAccountPicker,
  AccountFormEditableField,
  AccountFormGroupError,
  AccountFormIdentifierField,
  AccountFormInstitutionPicker,
  AccountFormScrollChipSelect,
  AccountFormSection,
  AccountFormSections,
  type ScrollChipOption,
} from "@/components/forms/account-form-section";
import { ToggleSettingRow } from "@/components/patterns";
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
import { formatBalanceTriggerDisplay } from "@/lib/field-editor/balance-sign";
import { CARD_SURFACE_FLAT_CLASS } from "@/lib/layout/card-surface";
import type { TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
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
    <AccountFormSections
      requirements={{
        mode,
        accountType: "savings_account",
        interestModel: values.interestModel,
        interestDestination: values.interestDestination,
        postingFrequency: values.postingFrequency,
        showsInstitution: true,
        showsBalance: mode === "create",
        showsIdentifier: true,
      }}
    >
      <AccountFormSection title={t("accounts.formSections.accountDetails")}>
        <AccountFormEditableField
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

        <AccountFormInstitutionPicker
          id="savings-institution"
          accountType="savings_account"
          value={values.institution}
          disabled={disabled}
          error={errors.institution}
          onChange={(institution) => {
            onChange({ institution });
            onClearError("institution");
          }}
        />

        <AccountFormIdentifierField
          id="savings-account-number"
          labelKey="accounts.fields.accountNumber.label"
          placeholderKey="accounts.fields.accountNumber.placeholder"
          value={values.accountNumber}
          disabled={disabled}
          error={errors.accountNumber}
          onChange={(accountNumber) => onChange({ accountNumber })}
          onClearError={() => onClearError("accountNumber")}
        />

        {mode === "create" ? (
          <AccountFormEditableField
            id="savings-balance"
            label={t("accounts.fields.balance.label")}
            mode="numeric"
            inputMode="decimal"
            value={values.balance}
            placeholder={t("common.currency.zeroPlaceholder")}
            disabled={disabled}
            error={errors.balance}
            showSignToggle
            sanitizeInput={sanitizeAmountInput}
            formatDisplay={(amount) =>
              formatAmountInput(amount, amountInputLocale)
            }
            displayValue={
              values.balance.trim()
                ? formatBalanceTriggerDisplay(values.balance, (unsigned) =>
                    formatAmountInput(unsigned, amountInputLocale),
                  )
                : undefined
            }
            validate={(next) => validateAccountBalanceField(next, t)}
            onSave={(balance) => {
              onChange({ balance });
              onClearError("balance");
            }}
          />
        ) : null}
      </AccountFormSection>

      <AccountFormSection title={t("savings.sections.interestModel")}>
        <AccountFormScrollChipSelect
          label={t("savings.fields.interestModel.label")}
          value={values.interestModel}
          options={interestModelOptions}
          ariaLabel={t("savings.fields.interestModel.label")}
          onChange={(interestModel) => {
            onChange({ interestModel });
            onClearError("annualInterestRate");
            onClearError("tiers");
          }}
        />

        {values.interestModel === "fixed" ? (
          <AccountFormEditableField
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
          <>
            {values.tiers.map((tier, index) => (
              <Fragment key={index}>
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
                <AccountFormEditableField
                  id={`tier-min-${index}`}
                  label={t("savings.fields.tiers.minBalance")}
                  mode="numeric"
                  inputMode="decimal"
                  value={tier.minBalance}
                  placeholder={t("common.currency.zeroPlaceholder")}
                  disabled={disabled}
                  sanitizeInput={sanitizeDecimalInput}
                  formatDisplay={(amount) =>
                    formatAmountInput(amount, amountInputLocale)
                  }
                  onSave={(minBalance) => updateTier(index, { minBalance })}
                />
                <AccountFormEditableField
                  id={`tier-max-${index}`}
                  label={t("savings.fields.tiers.maxBalance")}
                  mode="numeric"
                  inputMode="decimal"
                  value={tier.maxBalance}
                  placeholder={t("savings.fields.tiers.openEnded")}
                  disabled={disabled}
                  sanitizeInput={sanitizeDecimalInput}
                  formatDisplay={(amount) =>
                    formatAmountInput(amount, amountInputLocale)
                  }
                  onSave={(maxBalance) => updateTier(index, { maxBalance })}
                />
                <AccountFormEditableField
                  id={`tier-rate-${index}`}
                  label={t("accounts.fields.annualRate.label")}
                  mode="numeric"
                  inputMode="decimal"
                  value={tier.annualInterestRate}
                  placeholder="0"
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
              </Fragment>
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
            <AccountFormGroupError id="savings-tiers-error" error={errors.tiers} />
          </>
        )}
      </AccountFormSection>

      <AccountFormSection title={t("savings.sections.posting")}>
        <p className="text-sm text-muted-foreground">
          {t("savings.balanceMethodHint")}
        </p>

        <AccountFormScrollChipSelect
          label={t("savings.fields.postingFrequency.label")}
          value={values.postingFrequency}
          options={frequencyOptions}
          ariaLabel={t("savings.fields.postingFrequency.label")}
          onChange={(postingFrequency) => onChange({ postingFrequency })}
        />

        {values.postingFrequency !== "daily" ? (
          <AccountFormScrollChipSelect
            label={t("savings.fields.postingDay.label")}
            fieldId="savings-posting-day"
            value={values.postingDay}
            options={postingDayOptions}
            ariaLabel={t("savings.fields.postingDay.label")}
            error={errors.postingDay}
            onChange={(postingDay) => {
              onChange({ postingDay });
              onClearError("postingDay");
            }}
          />
        ) : (
          <div className={cn(CARD_SURFACE_FLAT_CLASS, "px-4")}>
            <p className="border-b border-border py-3 text-sm font-medium">
              {t("businessDays.title")}
            </p>
            <ToggleSettingRow
              label={t("businessDays.excludeWeekends.label")}
              description={t("businessDays.excludeWeekends.description")}
              checked={values.excludeWeekends}
              disabled={disabled}
              onCheckedChange={(excludeWeekends) => onChange({ excludeWeekends })}
            />
            <ToggleSettingRow
              label={t("businessDays.excludeEgyptianHolidays.label")}
              description={t(
                "businessDays.excludeEgyptianHolidays.description",
              )}
              checked={values.excludeEgyptianHolidays}
              disabled={disabled}
              onCheckedChange={(excludeEgyptianHolidays) =>
                onChange({ excludeEgyptianHolidays })
              }
            />
          </div>
        )}
      </AccountFormSection>

      <AccountFormSection title={t("savings.sections.destination")}>
        <AccountFormScrollChipSelect
          label={t("accounts.fields.interestDestination.label")}
          value={values.interestDestination}
          options={destinationOptions}
          ariaLabel={t("accounts.fields.interestDestination.label")}
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

        {values.interestDestination === "another_account" ? (
          <AccountFormAccountPicker
            id="savings-destination"
            label={t("accounts.fields.interestDestinationAccount.label")}
            placeholder={t(
              "accounts.fields.interestDestinationAccount.placeholder",
            )}
            description={t(
              "accounts.fields.interestDestinationAccount.description",
            )}
            searchPlaceholder={t(
              "accounts.fields.interestDestinationAccount.searchPlaceholder",
            )}
            noResultsMessage={t(
              "accounts.fields.interestDestinationAccount.noResults",
            )}
            value={values.destinationAccountId || null}
            accounts={transferAccounts}
            disabled={disabled}
            error={errors.destinationAccountId}
            onChange={(destinationAccountId) => {
              onChange({ destinationAccountId: destinationAccountId ?? "" });
              onClearError("destinationAccountId");
            }}
          />
        ) : null}
      </AccountFormSection>
    </AccountFormSections>
  );
}
