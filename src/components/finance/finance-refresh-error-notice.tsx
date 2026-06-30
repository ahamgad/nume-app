"use client";

import { Button } from "@/components/ui/button";
import { useT } from "@/providers/i18n-provider";

interface FinanceRefreshErrorNoticeProps {
  onRetry: () => void;
}

export function FinanceRefreshErrorNotice({
  onRetry,
}: FinanceRefreshErrorNoticeProps) {
  const t = useT();

  return (
    <div
      className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3"
      role="alert"
    >
      <p className="text-sm text-destructive">{t("accounts.refreshError")}</p>
      <Button
        type="button"
        variant="outline"
        className="mt-3 h-9"
        onClick={onRetry}
      >
        {t("common.retry")}
      </Button>
    </div>
  );
}
