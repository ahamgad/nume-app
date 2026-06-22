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
import { pickerOptionRowClassName } from "@/lib/layout/picker-option-row";
import { cn } from "@/lib/utils";

interface InterestDestinationPickerProps {
  value: string | null;
  onChange: (accountId: string | null) => void;
  accounts: Account[];
  disabled?: boolean;
  id?: string;
}

export function InterestDestinationPicker({
  value,
  onChange,
  accounts,
  disabled = false,
  id,
}: InterestDestinationPickerProps) {
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

  const notSelectedLabel = t(
    "accounts.fields.interestDestinationAccount.notSelected",
  );

  const showClearOption = useMemo(() => {
    if (!showSearch) return true;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return notSelectedLabel.toLowerCase().includes(query);
  }, [notSelectedLabel, searchQuery, showSearch]);

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

  const label = t("accounts.fields.interestDestinationAccount.label");
  const placeholder = t(
    "accounts.fields.interestDestinationAccount.placeholder",
  );
  const description = t(
    "accounts.fields.interestDestinationAccount.description",
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <p className="text-[0.8125rem] text-muted-foreground">{description}</p>

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
          disabled && "pointer-events-none",
        )}
      >
        <span className="truncate">{displayLabel ?? placeholder}</span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

      <PickerBottomSheet
        open={open}
        onClose={closeSheet}
        title={label}
        titleId="interest-destination-picker-title"
        search={
          showSearch
            ? {
                value: searchQuery,
                onChange: setSearchQuery,
                placeholder: t(
                  "accounts.fields.interestDestinationAccount.searchPlaceholder",
                ),
              }
            : undefined
        }
      >
        {filteredAccounts.length === 0 && !showClearOption ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            {t("accounts.fields.interestDestinationAccount.noResults")}
          </p>
        ) : (
          <div
            role="listbox"
            aria-label={label}
            className="divide-y divide-border"
          >
            {showClearOption ? (
              <button
                type="button"
                role="option"
                aria-selected={value === null}
                onClick={() => handleSelect(null)}
                className={pickerOptionRowClassName(value === null)}
              >
                {notSelectedLabel}
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
