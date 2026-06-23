"use client";

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
import { SCREEN_HEADER_ACTION_ICON_CLASS } from "@/components/layout/screen-header";
import { Switch } from "@/components/ui/switch";
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
import type { TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useT } from "@/providers/i18n-provider";

import { Plus, Trash2 } from "lucide-react";

/** Matches `FormSection` / Add Record field stack spacing (`space-y-5`). */
const SAVINGS_FORM_STACK_GAP_CLASS = "mt-5";

/** Tiered interest vertical rhythm (px). */
const SAVINGS_TIER_SECTION_GAP_CLASS = "mt-4";

const SAVINGS_TIER_LABEL_CLASS =
  "text-[0.9375rem] font-semibold leading-5 text-foreground";

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

interface SavingsToggleSettingRowProps {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function SavingsToggleSettingRow({
  label,
  description,
  checked,
  disabled,
  onCheckedChange,
}: SavingsToggleSettingRowProps) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-4 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-[0.8125rem] font-bold leading-none text-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="shrink-0"
      />
    </div>
  );
}

interface SavingsAddTierButtonProps {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

/** Full-width Add Tier — mirrors `ScreenHeaderActionButton` icon/text rhythm. */
function SavingsAddTierButton({
  label,
  disabled,
  onClick,
}: SavingsAddTierButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-11 w-full items-center justify-center gap-1 rounded-md border border-border bg-background px-1 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50",
        SAVINGS_FORM_STACK_GAP_CLASS,
      )}
    >
      <Plus className={cn(SCREEN_HEADER_ACTION_ICON_CLASS, "shrink-0")} />
      <span>{label}</span>
    </button>
  );
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
    onChange({
      tiers: [
        ...values.tiers,
        { minBalance: "", maxBalance: "", annualInterestRate: "" },
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
      </AccountFormSection>

      <AccountFormSection title={t("savings.sections.interestModel")}>
        <AccountFormScrollChipSelect
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
          <div className="flex flex-col">
            {values.tiers.map((tier, index) => (
              <div
                key={index}
                className={cn(
                  index > 0 &&
                    cn(
                      "border-t border-border",
                      SAVINGS_TIER_SECTION_GAP_CLASS,
                    ),
                )}
              >
                <div className="mb-4 flex h-8 items-center justify-between gap-3">
                  <span className={SAVINGS_TIER_LABEL_CLASS}>
                    {t("savings.fields.tiers.tierLabel", { index: index + 1 })}
                  </span>
                  <div className="flex size-8 shrink-0 items-center justify-center">
                    {values.tiers.length > 1 ? (
                      <button
                        type="button"
                        className="inline-flex size-8 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                        disabled={disabled}
                        aria-label={t("savings.fields.tiers.remove")}
                        onClick={() => removeTier(index)}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col gap-2 pb-4">
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
                </div>
              </div>
            ))}
            <SavingsAddTierButton
              label={t("savings.fields.tiers.add")}
              disabled={disabled}
              onClick={addTier}
            />
            {errors.tiers ? (
              <div className="mt-2">
                <AccountFormGroupError id="savings-tiers-error" error={errors.tiers} />
              </div>
            ) : null}
          </div>
        )}
      </AccountFormSection>

      <AccountFormSection title={t("savings.sections.posting")}>
        <AccountFormScrollChipSelect
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
          <>
            <SavingsToggleSettingRow
              label={t("businessDays.excludeWeekends.label")}
              description={t("businessDays.excludeWeekends.description")}
              checked={values.excludeWeekends}
              disabled={disabled}
              onCheckedChange={(excludeWeekends) => onChange({ excludeWeekends })}
            />
            <SavingsToggleSettingRow
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
          </>
        )}
      </AccountFormSection>

      <AccountFormSection title={t("savings.sections.destination")}>
        <AccountFormScrollChipSelect
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
            label={t("savings.fields.destinationAccount.label")}
            placeholder={t("savings.fields.destinationAccount.placeholder")}
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
