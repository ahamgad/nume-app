"use client";

import { useRouter } from "next/navigation";

import { EditAccountScreen } from "@/components/screens/edit-account-screen";
import { EditCertificateScreen } from "@/components/screens/edit-certificate-screen";
import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useFinance } from "@/lib/finance/store";
import { useT } from "@/providers/i18n-provider";

interface EditAccountRouterScreenProps {
  accountId: string;
}

export function EditAccountRouterScreen({ accountId }: EditAccountRouterScreenProps) {
  const t = useT();
  const router = useRouter();
  const { getAccount, isFinanceReady } = useFinance();
  const account = getAccount(accountId);

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

  if (!account) {
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

  if (account.type === "certificate") {
    return <EditCertificateScreen accountId={accountId} />;
  }

  return <EditAccountScreen accountId={accountId} />;
}
