"use client";

import { useRouter } from "next/navigation";

import { AccountTypePickerCard } from "@/components/accounts/account-type-picker-card";
import { AccountTypePickerSection } from "@/components/accounts/account-type-picker-section";
import { PickerBottomSheet } from "@/components/ui/picker-bottom-sheet";
import {
  ACCOUNT_TYPE_GROUPS,
  getAccountTypeCreatePath,
} from "@/lib/finance/account-type-catalog";
import { ACCOUNT_TYPE_PICKER_CATEGORY_GAP_PX } from "@/lib/layout/account-type-picker-chrome";
import { useT } from "@/providers/i18n-provider";

interface AccountTypePickerSheetProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Frozen Add Account type picker — dedicated foundation, not Picker List rows.
 *
 * @see docs/FOUNDATION.md — Account type picker sheet foundation
 */
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
      <div
        className="flex flex-col px-2 pb-2"
        style={{ gap: ACCOUNT_TYPE_PICKER_CATEGORY_GAP_PX }}
      >
        {ACCOUNT_TYPE_GROUPS.map((group) => (
          <AccountTypePickerSection key={group.id} title={t(group.labelKey)}>
            {group.types.map((entry) => (
              <AccountTypePickerCard
                key={entry.type}
                type={entry.type}
                enabled={entry.enabled}
                t={t}
                onSelect={() => handleSelect(entry.type, entry.enabled)}
              />
            ))}
          </AccountTypePickerSection>
        ))}
      </div>
    </PickerBottomSheet>
  );
}
