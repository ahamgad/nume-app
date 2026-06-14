"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

import { AccountTypeIcon } from "@/components/ui/account-type-icon";
import { SelectionBottomSheet } from "@/components/ui/selection-bottom-sheet";
import { Input, inputClassName } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  filterAccountsForDestinationSearch,
  formatAccountDestinationDisplay,
  formatAccountDestinationSubtitle,
} from "@/lib/finance/account-display";
import type { Account } from "@/lib/finance/types";
import { useT } from "@/providers/i18n-provider";
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

  const showSearch = accounts.length > 10;

  const filteredAccounts = useMemo(
    () =>
      filterAccountsForDestinationSearch(
        accounts,
        showSearch ? searchQuery : "",
        t,
      ),
    [accounts, searchQuery, showSearch, t],
  );

  const showClearOption = useMemo(() => {
    if (!showSearch) return true;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return t("certificates.fields.interestDestination.notSelected")
      .toLowerCase()
      .includes(query);
  }, [searchQuery, showSearch, t]);

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

  const label = t("certificates.fields.interestDestination.label");
  const placeholder = t("certificates.fields.interestDestination.placeholder");
  const description = t("certificates.fields.interestDestination.description");

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

      <SelectionBottomSheet
        open={open}
        onClose={closeSheet}
        ariaLabelledBy="interest-destination-picker-title"
      >
        <div className="border-b border-border px-4 py-4">
          <h2
            id="interest-destination-picker-title"
            className="text-base font-semibold"
          >
            {label}
          </h2>
          {showSearch ? (
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t("certificates.fields.interestDestination.searchPlaceholder")}
              className="mt-3"
              autoComplete="off"
            />
          ) : null}
        </div>

        <div className="px-2 py-2">
          {filteredAccounts.length === 0 && !showClearOption ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              {t("certificates.fields.interestDestination.noResults")}
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
                    value === null
                      ? "bg-muted font-medium"
                      : "hover:bg-muted/60",
                  )}
                >
                  {t("certificates.fields.interestDestination.notSelected")}
                </button>
              ) : null}

              {filteredAccounts.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  role="option"
                  aria-selected={value === account.id}
                  onClick={() => handleSelect(account.id)}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2 text-start transition-colors",
                    value === account.id
                      ? "bg-muted"
                      : "hover:bg-muted/60",
                  )}
                >
                  <AccountTypeIcon type={account.type} className="size-4" />
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-[0.9375rem] font-medium">
                      {formatAccountDestinationDisplay(account, t)}
                    </span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {formatAccountDestinationSubtitle(account, t)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </SelectionBottomSheet>
    </div>
  );
}
