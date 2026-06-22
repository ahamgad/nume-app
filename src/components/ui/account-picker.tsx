"use client";

import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { AccountPickerOptionRow } from "@/components/accounts/account-picker-option-row";
import { PickerBottomSheet } from "@/components/ui/picker-bottom-sheet";
import {
  PICKER_NONE_LABEL_KEY,
  PickerList,
  PickerListNoneOption,
  shouldShowPickerNoneOption,
} from "@/components/ui/picker-list";
import { inputClassName } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <span
      className={cn(
        "min-w-0 flex-1 truncate text-[0.9375rem] font-medium",
        !displayLabel && "font-normal text-muted-foreground",
        error && "text-destructive",
      )}
    >
      {displayLabel ?? placeholder}
    </span>
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {description ? (
        <p className="text-[0.8125rem] text-muted-foreground">{description}</p>
      ) : null}

      {variant === "row" ? (
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onClick={() => setOpen(true)}
          className={cn(
            "flex min-h-12 w-full items-center gap-3 text-start transition-colors",
            disabled && "pointer-events-none opacity-60",
          )}
        >
          {triggerLabel}
          <ChevronRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" />
        </button>
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
          {triggerLabel}
          <ChevronRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" />
        </button>
      )}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-sm text-destructive">
          {error}
        </p>
      ) : null}

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
    </div>
  );
}
