"use client";

import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { StackPageHeader, StackPageTitle } from "@/components/layout/stack-page-chrome";
import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { Card } from "@/components/ui/card";
import { useFinance } from "@/lib/finance/store";
import { useT } from "@/providers/i18n-provider";

interface AddRecordTypeScreenProps {
  accountId: string;
}

const recordTypes = ["income", "expense", "transfer"] as const;
type AddRecordType = (typeof recordTypes)[number];

function typeIcon(type: AddRecordType) {
  if (type === "income") return <ArrowDownLeft className="size-5" />;
  if (type === "expense") return <ArrowUpRight className="size-5" />;
  return <ArrowLeftRight className="size-5" />;
}

export function AddRecordTypeScreen({ accountId }: AddRecordTypeScreenProps) {
  const t = useT();
  const router = useRouter();
  const { getAccount } = useFinance();
  const account = getAccount(accountId);

  if (
    account &&
    (account.type === "credit_card" || account.type === "certificate")
  ) {
    return (
      <>
        <ScreenHeader
          mode="stack"
          title={t("records.add.title")}
          onBack={() => router.back()}
        />
        <ScreenBody withTabBar={false}>
          <p className="text-muted-foreground">
            {t("records.add.unsupportedAccountType")}
          </p>
        </ScreenBody>
      </>
    );
  }

  return (
    <>
      <StackPageHeader title={t("records.add.title")} />
      <ScreenBody withTabBar={false} className="space-y-4">
        <StackPageTitle>{t("records.add.title")}</StackPageTitle>
        {account ? (
          <p className="text-[0.8125rem] text-muted-foreground">
            {account.name}
          </p>
        ) : null}

        <Card className="overflow-hidden shadow-none">
          {recordTypes.map((type, index) => (
            <div key={type}>
              <button
                type="button"
                onClick={() =>
                  router.push(`/accounts/${accountId}/records/new/${type}`)
                }
                className="flex min-h-[4.5rem] w-full items-center gap-4 px-4 py-3 text-start transition-colors active:bg-muted"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  {typeIcon(type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.9375rem] font-semibold">
                    {t(`records.types.${type}`)}
                  </p>
                  <p className="mt-0.5 text-[0.8125rem] text-muted-foreground">
                    {t(`records.add.${type}.description`)}
                  </p>
                </div>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground rtl:rotate-180" />
              </button>
              {index < recordTypes.length - 1 ? (
                <div className="mx-4 border-b border-border" />
              ) : null}
            </div>
          ))}
        </Card>
      </ScreenBody>
    </>
  );
}
