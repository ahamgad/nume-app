"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

import { AccountPickerOptionRow } from "@/components/accounts/account-picker-option-row";
import { PickerBottomSheet } from "@/components/ui/picker-bottom-sheet";
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
  clearLabel?: string;
  sheetTitle?: string;
  searchPlaceholder?: string;
  noResultsMessage?: string;
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
  clearLabel,
  sheetTitle,
  searchPlaceholder,
  noResultsMessage,
  onChange,
}: AccountPickerProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const resolvedClearLabel =
    clearLabel ?? t("records.fields.transfer.notSelected");

  const showClearOption = useMemo(() => {
    if (!allowClear) return false;
    if (!showSearch) return true;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return resolvedClearLabel.toLowerCase().includes(query);
  }, [allowClear, resolvedClearLabel, searchQuery, showSearch]);

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

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {description ? (
        <p className="text-[0.8125rem] text-muted-foreground">{description}</p>
      ) : null}

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
        )}
      >
        <span className="truncate">{displayLabel ?? placeholder}</span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

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
        {filteredAccounts.length === 0 && !showClearOption ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            {resolvedNoResults}
          </p>
        ) : (
          <div
            role="listbox"
            aria-label={resolvedSheetTitle}
            className="divide-y divide-border"
          >
            {showClearOption ? (
              <button
                type="button"
                role="option"
                aria-selected={value === null}
                onClick={() => handleSelect(null)}
                className={cn(
                  "flex min-h-11 w-full items-center px-3 py-2 text-start text-[0.9375rem] transition-colors",
                  value === null
                    ? "bg-muted font-medium"
                    : "hover:bg-muted/60",
                )}
              >
                {resolvedClearLabel}
              </button>
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
          </div>
        )}
      </PickerBottomSheet>
    </div>
  );
}
