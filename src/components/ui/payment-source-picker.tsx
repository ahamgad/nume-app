"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

import { AccountTypeIcon } from "@/components/ui/account-type-icon";
import { PickerBottomSheet } from "@/components/ui/picker-bottom-sheet";
import { inputClassName } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { shouldShowPickerSearch } from "@/lib/layout/picker-sheet";
import {
  filterAccountsForDestinationSearch,
  formatAccountDestinationDisplay,
  formatAccountDestinationSubtitle,
} from "@/lib/finance/account-display";
import type { Account } from "@/lib/finance/types";
import { useT } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";

interface PaymentSourcePickerProps {
  value: string | null;
  onChange: (accountId: string | null) => void;
  accounts: Account[];
  disabled?: boolean;
  id?: string;
}

export function PaymentSourcePicker({
  value,
  onChange,
  accounts,
  disabled = false,
  id,
}: PaymentSourcePickerProps) {
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

  const notSelectedLabel = t("creditCards.fields.paymentSource.notSelected");

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

  const label = t("creditCards.fields.paymentSource.label");
  const placeholder = t("creditCards.fields.paymentSource.placeholder");
  const description = t("creditCards.fields.paymentSource.description");
  const noResultsLabel = t("creditCards.fields.paymentSource.noResults");

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={cn(
          inputClassName,
          "flex h-12 w-full items-center justify-between gap-2 px-3 text-start",
          !displayLabel && "text-muted-foreground",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <span className="min-w-0 truncate">
          {displayLabel ?? placeholder}
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </button>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}

      <PickerBottomSheet
        open={open}
        onClose={closeSheet}
        title={label}
        titleId={`${id ?? "payment-source"}-picker-title`}
        search={
          showSearch
            ? {
                value: searchQuery,
                onChange: setSearchQuery,
                placeholder: t("creditCards.fields.paymentSource.searchPlaceholder"),
              }
            : undefined
        }
      >
        {filteredAccounts.length === 0 && !showClearOption ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            {noResultsLabel}
          </p>
        ) : (
          <div role="listbox" aria-label={label}>
            {showClearOption ? (
              <button
                type="button"
                role="option"
                aria-selected={value === null}
                onClick={() => handleSelect(null)}
                className={cn(
                  "flex min-h-11 w-full items-center rounded-md px-3 py-2 text-start text-[0.9375rem] transition-colors",
                  value === null ? "bg-muted font-medium" : "hover:bg-muted/60",
                )}
              >
                {notSelectedLabel}
              </button>
            ) : null}
            {filteredAccounts.map((account) => (
              <button
                key={account.id}
                type="button"
                role="option"
                aria-selected={account.id === value}
                onClick={() => handleSelect(account.id)}
                className={cn(
                  "flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2 text-start transition-colors",
                  account.id === value
                    ? "bg-muted font-medium"
                    : "hover:bg-muted/60",
                )}
              >
                <AccountTypeIcon type={account.type} className="size-5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.9375rem] font-medium">
                    {formatAccountDestinationDisplay(account, t)}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {formatAccountDestinationSubtitle(account, t)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </PickerBottomSheet>
    </div>
  );
}
