"use client";

import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  AccountActionPickerCard,
  AccountActionPickerRow,
} from "@/components/accounts/account-action-picker-card";
import { PickerBottomSheet } from "@/components/ui/picker-bottom-sheet";
import type { TranslationKey } from "@/lib/i18n";
import { useT } from "@/providers/i18n-provider";

const RECORD_ACTIONS = ["income", "expense", "transfer"] as const;
type RecordAction = (typeof RECORD_ACTIONS)[number];

function recordActionIcon(type: RecordAction) {
  if (type === "income") return <ArrowDownLeft className="size-6" />;
  if (type === "expense") return <ArrowUpRight className="size-6" />;
  return <ArrowLeftRight className="size-6" />;
}

interface AddRecordActionSheetProps {
  open: boolean;
  onClose: () => void;
  accountId: string;
}

export function AddRecordActionSheet({
  open,
  onClose,
  accountId,
}: AddRecordActionSheetProps) {
  const t = useT();
  const router = useRouter();

  function handleSelect(type: RecordAction) {
    onClose();
    router.push(`/accounts/${accountId}/records/new/${type}`);
  }

  return (
    <PickerBottomSheet
      open={open}
      onClose={onClose}
      title={t("records.add.title")}
      titleId="add-record-action-sheet-title"
      ariaLabel={t("records.add.title")}
    >
      <AccountActionPickerRow>
        {RECORD_ACTIONS.map((type) => (
          <AccountActionPickerCard
            key={type}
            label={t(`records.types.${type}` as TranslationKey)}
            icon={recordActionIcon(type)}
            onSelect={() => handleSelect(type)}
          />
        ))}
      </AccountActionPickerRow>
    </PickerBottomSheet>
  );
}
