"use client";

import { ChevronRight } from "lucide-react";
import { Fragment } from "react";
import { useRouter } from "next/navigation";

import { AccountTypeIcon } from "@/components/ui/account-type-icon";
import { PickerBottomSheet } from "@/components/ui/picker-bottom-sheet";
import {
  PickerList,
  PickerListDivider,
  PickerListOption,
} from "@/components/ui/picker-list";
import {
  ACCOUNT_TYPE_GROUPS,
  getAccountTypeCreatePath,
} from "@/lib/finance/account-type-catalog";
import { getAccountTypeLabelKey } from "@/lib/finance/account-labels";
import { useT } from "@/providers/i18n-provider";

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
    router.push(path);
  }

  return (
    <PickerBottomSheet
      open={open}
      onClose={onClose}
      title={t("accounts.add.chooseType")}
      ariaLabel={t("accounts.add.chooseType")}
    >
      <div className="space-y-5 px-2 pb-2">
        {ACCOUNT_TYPE_GROUPS.map((group, groupIndex) => (
          <Fragment key={group.id}>
            {groupIndex > 0 ? <PickerListDivider /> : null}
            <section>
              <p className="mb-2 px-2 text-xs font-medium tracking-wide text-muted-foreground">
                {t(group.labelKey)}
              </p>
              <PickerList ariaLabel={t(group.labelKey)}>
                {group.types.map((entry) => (
                  <PickerListOption
                    key={entry.type}
                    selected={false}
                    disabled={!entry.enabled}
                    onSelect={() => handleSelect(entry.type, entry.enabled)}
                    className="min-h-[4.5rem] gap-3 px-4 py-3.5 disabled:cursor-not-allowed disabled:opacity-50"
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
                  </PickerListOption>
                ))}
              </PickerList>
            </section>
          </Fragment>
        ))}
      </div>
    </PickerBottomSheet>
  );
}
