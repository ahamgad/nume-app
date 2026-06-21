"use client";

import { ProgressBar } from "@/components/patterns";
import { useT } from "@/providers/i18n-provider";

interface CreditUtilizationProgressProps {
  utilization: number;
}

export function CreditUtilizationProgress({
  utilization,
}: CreditUtilizationProgressProps) {
  const t = useT();

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.8125rem] font-medium text-muted-foreground">
          {t("creditCards.details.utilizationLabel")}
        </p>
        <p className="text-[0.8125rem] font-semibold tabular-nums">
          {t("creditCards.details.utilizationValue", { value: utilization })}
        </p>
      </div>
      <ProgressBar value={utilization} />
    </div>
  );
}
