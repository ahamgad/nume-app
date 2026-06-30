"use client";

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  AccountActionPickerCard,
  AccountActionPickerRow,
} from "@/components/accounts/account-action-picker-card";
import { PickerBottomSheet } from "@/components/ui/picker-bottom-sheet";
import type { TranslationKey } from "@/lib/i18n";
import { useT } from "@/providers/i18n-provider";

const ACTIVITY_ACTIONS = ["purchase", "payment"] as const;
type ActivityAction = (typeof ACTIVITY_ACTIONS)[number];

function activityActionIcon(type: ActivityAction) {
  if (type === "purchase") return <ArrowUpRight className="size-6" />;
  return <ArrowDownLeft className="size-6" />;
}

const ACTIVITY_LABEL_KEYS: Record<ActivityAction, TranslationKey> = {
  purchase: "creditCards.activity.purchase.title",
  payment: "creditCards.activity.payment.title",
};

interface AddActivityActionSheetProps {
  open: boolean;
  onClose: () => void;
  accountId: string;
}

export function AddActivityActionSheet({
  open,
  onClose,
  accountId,
}: AddActivityActionSheetProps) {
  const t = useT();
  const router = useRouter();

  function handleSelect(type: ActivityAction) {
    onClose();
    router.push(`/accounts/${accountId}/activity/new/${type}`);
  }

  return (
    <PickerBottomSheet
      open={open}
      onClose={onClose}
      title={t("creditCards.activity.title")}
      titleId="add-activity-action-sheet-title"
      ariaLabel={t("creditCards.activity.title")}
    >
      <AccountActionPickerRow>
        {ACTIVITY_ACTIONS.map((type) => (
          <AccountActionPickerCard
            key={type}
            label={t(ACTIVITY_LABEL_KEYS[type])}
            icon={activityActionIcon(type)}
            onSelect={() => handleSelect(type)}
          />
        ))}
      </AccountActionPickerRow>
    </PickerBottomSheet>
  );
}
