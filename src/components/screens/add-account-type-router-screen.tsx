"use client";

import { useRouter } from "next/navigation";

import { AddCertificateAccountScreen } from "@/components/screens/add-certificate-account-screen";
import { AddMoneyAccountScreen } from "@/components/screens/add-money-account-screen";
import { AddSavingsAccountScreen } from "@/components/screens/add-savings-account-screen";
import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { Button } from "@/components/ui/button";
import { parseCreatableAccountType } from "@/lib/finance/account-type-catalog";
import {
  isCertificateAccountType,
  isMoneyAccountType,
} from "@/lib/finance/add-account-types";
import { useT } from "@/providers/i18n-provider";

interface AddAccountTypeRouterScreenProps {
  type: string;
}

export function AddAccountTypeRouterScreen({ type }: AddAccountTypeRouterScreenProps) {
  const t = useT();
  const router = useRouter();
  const accountType = parseCreatableAccountType(type);

  if (!accountType) {
    return (
      <>
        <ScreenHeader
          mode="stack"
          title={t("accounts.add.title")}
          onBack={() => router.push("/accounts")}
        />
        <ScreenBody withTabBar={false}>
          <p className="text-muted-foreground">{t("accounts.add.typeUnavailable")}</p>
          <Button
            className="mt-4 h-11"
            variant="outline"
            onClick={() => router.push("/accounts")}
          >
            {t("accounts.title")}
          </Button>
        </ScreenBody>
      </>
    );
  }

  if (isMoneyAccountType(accountType)) {
    return <AddMoneyAccountScreen accountType={accountType} />;
  }

  if (isCertificateAccountType(accountType)) {
    return <AddCertificateAccountScreen />;
  }

  if (accountType === "savings_account") {
    return <AddSavingsAccountScreen />;
  }

  return null;
}
