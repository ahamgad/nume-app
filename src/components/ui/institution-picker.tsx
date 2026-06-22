"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PickerBottomSheet } from "@/components/ui/picker-bottom-sheet";
import { InstitutionBrandAsset } from "@/components/institutions/institution-brand-asset";
import { Input, inputClassName } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { preloadBrandAssets } from "@/lib/institutions/brand-asset-cache";
import { getInstitutionBrandAssetPath } from "@/lib/institutions/brand-assets-registry";
import { shouldShowPickerSearch } from "@/lib/layout/picker-sheet";
import {
  filterInstitutions,
  getInstitutionFullName,
  getInstitutionShortcut,
  getInstitutionTriggerLabel,
  getInstitutionsForContext,
  isOtherInstitutionValue,
  matchInstitutionEntry,
  type InstitutionCatalogEntry,
  type InstitutionPickerContext,
} from "@/lib/institutions/catalog";
import type { TranslationKey } from "@/lib/i18n";
import { useT } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";

interface InstitutionPickerProps {
  value: string;
  onChange: (value: string) => void;
  accountType: InstitutionPickerContext;
  disabled?: boolean;
  id?: string;
  label?: string;
  placeholder?: string;
  customLabel?: string;
  customPlaceholder?: string;
  error?: string;
  variant?: "input" | "row";
  "aria-invalid"?: boolean;
}

export function InstitutionPicker({
  value,
  onChange,
  accountType,
  disabled = false,
  id,
  label,
  placeholder,
  customLabel,
  customPlaceholder,
  error,
  variant = "input",
  "aria-invalid": ariaInvalidProp,
}: InstitutionPickerProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingOther, setPendingOther] = useState(false);

  const entries = useMemo(
    () => getInstitutionsForContext(accountType),
    [accountType],
  );

  useEffect(() => {
    const assetPaths = entries
      .map((entry) => getInstitutionBrandAssetPath(entry.id))
      .filter((path): path is string => path !== null);
    preloadBrandAssets(assetPaths);
  }, [entries]);

  const bankEntries = useMemo(
    () => entries.filter((entry) => entry.category === "bank"),
    [entries],
  );
  const financialEntries = useMemo(
    () => entries.filter((entry) => entry.category === "financial_service"),
    [entries],
  );

  const filteredBanks = useMemo(
    () => filterInstitutions(bankEntries, searchQuery, t),
    [bankEntries, searchQuery, t],
  );
  const filteredFinancial = useMemo(
    () => filterInstitutions(financialEntries, searchQuery, t),
    [financialEntries, searchQuery, t],
  );

  const showOtherOption = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return t("institutions.other").toLowerCase().includes(query);
  }, [searchQuery, t]);

  const matchedEntry = useMemo(
    () => matchInstitutionEntry(value, entries, t),
    [value, entries, t],
  );

  const isOtherSelected =
    pendingOther || isOtherInstitutionValue(value, entries, t);

  const displayLabel = useMemo(() => {
    if (pendingOther && !value.trim()) return t("institutions.other");
    return getInstitutionTriggerLabel(value, accountType, t);
  }, [pendingOther, value, accountType, t]);

  const showCustomField = isOtherSelected;

  function closeSheet() {
    setOpen(false);
    setSearchQuery("");
  }

  function handleSelect(entry: InstitutionCatalogEntry) {
    setPendingOther(false);
    onChange(entry.storageValue);
    closeSheet();
  }

  function handleSelectOther() {
    setPendingOther(true);
    onChange("");
    closeSheet();
  }

  const resolvedLabel = label ?? t("accounts.fields.institution.label");
  const resolvedPlaceholder =
    placeholder ?? t("accounts.fields.institution.placeholder");
  const resolvedCustomLabel =
    customLabel ?? t("institutions.customName.label");
  const resolvedCustomPlaceholder =
    customPlaceholder ?? t("institutions.customName.placeholder");

  const hasResults =
    filteredBanks.length > 0 ||
    filteredFinancial.length > 0 ||
    showOtherOption;

  const selectableCount = entries.length + 1;
  const showSearch = shouldShowPickerSearch(selectableCount);
  const ariaInvalid = ariaInvalidProp ?? Boolean(error);

  const triggerContent = (
    <span
      className={cn(
        "min-w-0 flex-1 text-[0.9375rem] font-medium leading-snug",
        !displayLabel && "font-normal text-muted-foreground",
        error && "text-destructive",
      )}
    >
      {displayLabel ?? resolvedPlaceholder}
    </span>
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{resolvedLabel}</Label>

      {variant === "row" ? (
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-invalid={ariaInvalid || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onClick={() => setOpen(true)}
          className={cn(
            "flex min-h-12 w-full items-center gap-3 px-4 py-3 text-start transition-colors",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          {triggerContent}
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
            disabled && "pointer-events-none",
            ariaInvalid && "border-destructive",
          )}
        >
          {triggerContent}
          <ChevronRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" />
        </button>
      )}

      {error ? (
        <p id={`${id}-error`} className="px-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {showCustomField ? (
        <Input
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          placeholder={resolvedCustomPlaceholder}
          aria-label={resolvedCustomLabel}
          autoComplete="organization"
        />
      ) : null}

      <PickerBottomSheet
        open={open}
        onClose={closeSheet}
        title={resolvedLabel}
        titleId="institution-picker-title"
        search={
          showSearch
            ? {
                value: searchQuery,
                onChange: setSearchQuery,
                placeholder: t("institutions.searchPlaceholder"),
              }
            : undefined
        }
      >
        {!hasResults ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              {t("institutions.noResults")}
            </p>
          ) : (
            <>
              {filteredBanks.length > 0 ? (
                <InstitutionSection
                  title={t("institutions.categories.banks")}
                  entries={filteredBanks}
                  selectedId={matchedEntry?.id ?? null}
                  onSelect={handleSelect}
                  t={t}
                />
              ) : null}

              {filteredBanks.length > 0 && filteredFinancial.length > 0 ? (
                <div
                  role="separator"
                  aria-hidden
                  className="mx-3 my-2 border-t border-border"
                />
              ) : null}

              {filteredFinancial.length > 0 ? (
                <InstitutionSection
                  title={t("institutions.categories.financialServices")}
                  entries={filteredFinancial}
                  selectedId={matchedEntry?.id ?? null}
                  onSelect={handleSelect}
                  t={t}
                />
              ) : null}

              {showOtherOption ? (
                <>
                  {(filteredBanks.length > 0 || filteredFinancial.length > 0) ? (
                    <div
                      role="separator"
                      aria-hidden
                      className="mx-3 my-2 border-t border-border"
                    />
                  ) : null}
                  <button
                    type="button"
                    role="option"
                    aria-selected={isOtherSelected && !matchedEntry}
                    onClick={handleSelectOther}
                    className={cn(
                      "flex min-h-11 w-full items-center px-3 text-start text-[0.9375rem] transition-colors",
                      isOtherSelected && !matchedEntry
                        ? "bg-muted font-medium"
                        : "hover:bg-muted/60",
                    )}
                  >
                    {t("institutions.other")}
                  </button>
                </>
              ) : null}
            </>
          )}
      </PickerBottomSheet>
    </div>
  );
}

function InstitutionSection({
  title,
  entries,
  selectedId,
  onSelect,
  t,
}: {
  title: string;
  entries: InstitutionCatalogEntry[];
  selectedId: string | null;
  onSelect: (entry: InstitutionCatalogEntry) => void;
  t: (key: TranslationKey) => string;
}) {
  return (
    <section className="mb-2">
      <p className="px-3 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </p>
      <div role="listbox" aria-label={title}>
        {entries.map((entry) => {
          const shortcut = getInstitutionShortcut(entry);
          const fullName = getInstitutionFullName(entry, t);
          return (
          <button
            key={entry.id}
            type="button"
            role="option"
            aria-selected={selectedId === entry.id}
            onClick={() => onSelect(entry)}
            className={cn(
              "flex min-h-11 w-full items-center gap-3 px-3 py-2 text-start transition-colors",
              selectedId === entry.id
                ? "bg-muted"
                : "hover:bg-muted/60",
            )}
          >
            <InstitutionBrandAsset
              institutionId={entry.id}
              fallbackLabel={shortcut}
            />
            <span className="flex min-w-0 flex-1 flex-col justify-center">
              <span className="text-[0.9375rem] font-medium">{shortcut}</span>
              <span className="text-sm text-muted-foreground">{fullName}</span>
            </span>
          </button>
        );
        })}
      </div>
    </section>
  );
}
