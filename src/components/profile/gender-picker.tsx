"use client";

import { useMemo, useState } from "react";

import {
  InputField,
  InputFieldRowTrigger,
  InputFieldValue,
} from "@/components/forms/input-field";
import { PickerBottomSheet } from "@/components/ui/picker-bottom-sheet";
import { PickerList, PickerListOption } from "@/components/ui/picker-list";
import type { ProfileGender } from "@/lib/profile/types";
import { PROFILE_GENDER_OPTIONS } from "@/lib/profile/types";
import type { TranslationKey } from "@/lib/i18n";
import { useT } from "@/providers/i18n-provider";

interface GenderPickerProps {
  id?: string;
  label: string;
  value: ProfileGender | null;
  disabled?: boolean;
  onSave: (value: ProfileGender) => void | Promise<void>;
}

function genderLabel(
  gender: ProfileGender,
  t: ReturnType<typeof useT>,
): string {
  return t(`more.profile.genderOptions.${gender}` as TranslationKey);
}

export function GenderPicker({
  id = "gender",
  label,
  value,
  disabled = false,
  onSave,
}: GenderPickerProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const displayLabel = useMemo(() => {
    if (!value) return t("more.profile.genderPlaceholder");
    return genderLabel(value, t);
  }, [t, value]);

  function handleOpen() {
    if (disabled || saving) return;
    setOpen(true);
  }

  async function handleSelect(next: ProfileGender) {
    if (saving) return;
    if (next === value) {
      setOpen(false);
      return;
    }

    setSaving(true);
    try {
      await onSave(next);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <InputField id={id} label={label}>
      <InputFieldRowTrigger
        id={id}
        disabled={disabled || saving}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={handleOpen}
        className={
          disabled || saving ? "pointer-events-none opacity-60" : undefined
        }
      >
        <InputFieldValue isPlaceholder={!value}>{displayLabel}</InputFieldValue>
      </InputFieldRowTrigger>

      <PickerBottomSheet
        open={open}
        onClose={() => {
          if (!saving) setOpen(false);
        }}
        title={label}
        titleId={`${id}-picker-title`}
      >
        <PickerList ariaLabel={label}>
          {PROFILE_GENDER_OPTIONS.map((option) => (
            <PickerListOption
              key={option}
              selected={value === option}
              onSelect={() => {
                void handleSelect(option);
              }}
            >
              {genderLabel(option, t)}
            </PickerListOption>
          ))}
        </PickerList>
      </PickerBottomSheet>
    </InputField>
  );
}
