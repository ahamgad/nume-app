"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { StickyFooter, ToggleSettingRow } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { DiscardDialog } from "@/components/ui/discard-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseAmount } from "@/lib/format/currency";
import { useFinance } from "@/lib/finance/store";
import { useT } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";

export function AddAccountScreen() {
  const t = useT();
  const router = useRouter();
  const { createAccount } = useFinance();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [balance, setBalance] = useState("");
  const [includeInNetWorth, setIncludeInNetWorth] = useState(true);
  const [includeInEmergencyFund, setIncludeInEmergencyFund] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDiscard, setShowDiscard] = useState(false);

  const isDirty =
    name.trim().length > 0 ||
    institution.trim().length > 0 ||
    balance.trim().length > 0 ||
    !includeInNetWorth ||
    includeInEmergencyFund;

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
      const account = createAccount({
        name,
        institution: institution.trim() || null,
        currentBalance: parsedBalance,
        includeInNetWorth,
        includeInEmergencyFund,
      });
      showToast(t("common.accountCreated"));
      router.replace(`/accounts/${account.id}`);
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
        title={t("accounts.add.title")}
        onBack={handleBack}
      />
      <ScreenBody withTabBar={false} withStickyFooter className="space-y-6">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">
            {t("accounts.sections.basic")}
          </h2>
          <div className="space-y-2">
            <Label htmlFor="account-name">{t("accounts.fields.name.label")}</Label>
            <Input
              id="account-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("accounts.fields.name.placeholder")}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name ? (
              <p className="text-sm text-destructive">{errors.name}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="institution">
              {t("accounts.fields.institution.label")}{" "}
              <span className="text-muted-foreground">({t("common.optional")})</span>
            </Label>
            <Input
              id="institution"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder={t("accounts.fields.institution.placeholder")}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">
            {t("accounts.sections.balance")}
          </h2>
          <div className="space-y-2">
            <Label htmlFor="balance">{t("accounts.fields.balance.label")}</Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-sm text-muted-foreground">
                EGP
              </span>
              <Input
                id="balance"
                inputMode="decimal"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="ps-14 tabular-nums"
                aria-invalid={Boolean(errors.balance)}
              />
            </div>
            {errors.balance ? (
              <p className="text-sm text-destructive">{errors.balance}</p>
            ) : null}
          </div>
        </section>

        <section>
          <button
            type="button"
            onClick={() => setSettingsOpen((open) => !open)}
            className="flex min-h-11 w-full items-center justify-between py-2 text-[0.9375rem] font-medium"
          >
            {t("accounts.fields.settings.title")}
            <ChevronDown
              className={`size-4 transition-transform ${settingsOpen ? "rotate-180" : ""}`}
            />
          </button>
          {settingsOpen ? (
            <div className="space-y-1 border-t border-border pt-2">
              <ToggleSettingRow
                label={t("accounts.settings.includeInNetWorth.label")}
                description={t("accounts.settings.includeInNetWorth.description")}
                checked={includeInNetWorth}
                onCheckedChange={setIncludeInNetWorth}
              />
              <ToggleSettingRow
                label={t("accounts.settings.includeInEmergencyFund.label")}
                description={t(
                  "accounts.settings.includeInEmergencyFund.description",
                )}
                checked={includeInEmergencyFund}
                onCheckedChange={setIncludeInEmergencyFund}
              />
            </div>
          ) : null}
        </section>
      </ScreenBody>

      <StickyFooter>
        <Button
          className="h-12 w-full"
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? t("accounts.creating") : t("accounts.createAccount")}
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
