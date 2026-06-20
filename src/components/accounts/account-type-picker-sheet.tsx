"use client";

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { AccountTypeIcon } from "@/components/ui/account-type-icon";
import { PickerBottomSheet } from "@/components/ui/picker-bottom-sheet";
import {
  ACCOUNT_TYPE_GROUPS,
  getAccountTypeCreatePath,
} from "@/lib/finance/account-type-catalog";
import { getAccountTypeLabelKey } from "@/lib/finance/account-labels";
import { markAccountTypePickerDismissed } from "@/lib/accounts/account-type-picker-state";
import { useT } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";

interface AccountTypePickerSheetProps {
  open: boolean;
  onClose: () => void;
}

export function AccountTypePickerSheet({
  open,
  onClose,
}: AccountTypePickerSheetProps) {
  const t = useT();
  const router = useRouter();

  function handleSelect(type: string, enabled: boolean) {
    if (!enabled) return;
    const path = getAccountTypeCreatePath(
      type as Parameters<typeof getAccountTypeCreatePath>[0],
    );
    markAccountTypePickerDismissed();
    router.push(path);
    queueMicrotask(onClose);
  }

  return (
    <PickerBottomSheet
      open={open}
      onClose={onClose}
      title={t("accounts.add.chooseType")}
      ariaLabel={t("accounts.add.chooseType")}
    >
      <div className="space-y-5 px-2 pb-2">
        {ACCOUNT_TYPE_GROUPS.map((group) => (
          <section key={group.id}>
            <p className="mb-2 px-2 text-xs font-medium tracking-wide text-muted-foreground">
              {t(group.labelKey)}
            </p>
            <div className="overflow-hidden rounded-lg border border-border">
              {group.types.map((entry, index) => (
                <button
                  key={entry.type}
                  type="button"
                  disabled={!entry.enabled}
                  onClick={() => handleSelect(entry.type, entry.enabled)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3.5 text-start transition-colors",
                    entry.enabled
                      ? "hover:bg-muted/60 active:bg-muted"
                      : "cursor-not-allowed opacity-50",
                    index < group.types.length - 1 && "border-b border-border",
                  )}
                >
                  <AccountTypeIcon type={entry.type} />
                  <span className="flex-1 text-[0.9375rem] font-medium">
                    {t(getAccountTypeLabelKey(entry.type))}
                  </span>
                  {!entry.enabled ? (
                    <span className="text-xs text-muted-foreground">
                      {t("accounts.add.comingSoon")}
                    </span>
                  ) : (
                    <ChevronRight
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                  )}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PickerBottomSheet>
  );
}
