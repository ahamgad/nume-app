"use client";

import { useMemo, useState } from "react";

import { AccountPickerOptionRow } from "@/components/accounts/account-picker-option-row";
import {
  InputField,
  InputFieldRowTrigger,
  InputFieldValue,
} from "@/components/forms/input-field";
import { PickerBottomSheet } from "@/components/ui/picker-bottom-sheet";
import {
  PICKER_NONE_LABEL_KEY,
  PickerList,
  PickerListNoneOption,
  shouldShowPickerNoneOption,
} from "@/components/ui/picker-list";
import { inputClassName } from "@/components/ui/input";
import { CardChevron } from "@/components/ui/card-chevron";
import { shouldShowPickerSearch } from "@/lib/layout/picker-sheet";
import {
  filterAccountsForDestinationSearch,
  formatAccountDestinationDisplay,
} from "@/lib/finance/account-display";
import type { Account } from "@/lib/finance/types";
import { useT } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";

interface AccountPickerProps {
  id?: string;
  label: string;
  description?: string;
  placeholder: string;
  value: string | null;
  accounts: Account[];
  disabled?: boolean;
  allowClear?: boolean;
  sheetTitle?: string;
  searchPlaceholder?: string;
  noResultsMessage?: string;
  error?: string;
  required?: boolean;
  variant?: "input" | "row";
  onChange: (accountId: string | null) => void;
}

export function AccountPicker({
  id,
  label,
  description,
  placeholder,
  value,
  accounts,
  disabled = false,
  allowClear = false,
  sheetTitle,
  searchPlaceholder,
  noResultsMessage,
  error,
  required = false,
  variant = "input",
  onChange,
}: AccountPickerProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const noneLabel = t(PICKER_NONE_LABEL_KEY);

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === value) ?? null,
    [accounts, value],
  );

  const showSearch = shouldShowPickerSearch(accounts.length);

  const filteredAccounts = useMemo(
    () =>
      filterAccountsForDestinationSearch(
        accounts,
        showSearch ? searchQuery : "",
        t,
      ),
    [accounts, searchQuery, showSearch, t],
  );

  const showNoneOption = useMemo(
    () =>
      shouldShowPickerNoneOption(
        allowClear,
        searchQuery,
        showSearch,
        noneLabel,
      ),
    [allowClear, noneLabel, searchQuery, showSearch],
  );

  const displayLabel = selectedAccount
    ? formatAccountDestinationDisplay(selectedAccount, t)
    : null;

  function closeSheet() {
    setOpen(false);
    setSearchQuery("");
  }

  function handleSelect(accountId: string | null) {
    onChange(accountId);
    closeSheet();
  }

  const resolvedSheetTitle = sheetTitle ?? label;
  const resolvedSearchPlaceholder =
    searchPlaceholder ?? t("records.fields.transfer.searchPlaceholder");
  const resolvedNoResults =
    noResultsMessage ?? t("records.fields.transfer.noResults");

  const triggerLabel = (
    <InputFieldValue isPlaceholder={!displayLabel}>
      {displayLabel ?? placeholder}
    </InputFieldValue>
  );

  const pickerControl =
    variant === "row" ? (
      <InputFieldRowTrigger
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onClick={() => setOpen(true)}
        className={disabled ? "pointer-events-none opacity-60" : undefined}
      >
        {triggerLabel}
      </InputFieldRowTrigger>
    ) : (
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={cn(
          inputClassName,
          "flex items-center justify-between gap-2 text-start",
          !displayLabel && "text-muted-foreground",
          disabled && "pointer-events-none opacity-60",
          error && "border-destructive",
        )}
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-[0.9375rem] font-medium",
            !displayLabel && "font-normal text-muted-foreground",
          )}
        >
          {displayLabel ?? placeholder}
        </span>
        <CardChevron />
      </button>
    );

  return (
    <InputField
      id={id}
      label={label}
      required={required}
      error={error}
      hint={description}
    >
      {pickerControl}

      <PickerBottomSheet
        open={open}
        onClose={closeSheet}
        title={resolvedSheetTitle}
        titleId={`${id ?? "account"}-picker-title`}
        search={
          showSearch
            ? {
                value: searchQuery,
                onChange: setSearchQuery,
                placeholder: resolvedSearchPlaceholder,
              }
            : undefined
        }
      >
        {filteredAccounts.length === 0 && !showNoneOption ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            {resolvedNoResults}
          </p>
        ) : (
          <PickerList ariaLabel={resolvedSheetTitle}>
            {showNoneOption ? (
              <PickerListNoneOption
                selected={value === null}
                onSelect={() => handleSelect(null)}
              />
            ) : null}

            {filteredAccounts.map((account) => (
              <AccountPickerOptionRow
                key={account.id}
                account={account}
                selected={value === account.id}
                t={t}
                onClick={() => handleSelect(account.id)}
              />
            ))}
          </PickerList>
        )}
      </PickerBottomSheet>
    </InputField>
  );
}
